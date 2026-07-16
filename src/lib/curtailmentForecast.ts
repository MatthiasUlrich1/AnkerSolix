import type { CurtailmentPhase, CurtailmentWindow, HourlyForecast } from "./curtailmentTypes";

/** Daytime hours covered by typical PV forecast objects. */
const FORECAST_HOURS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const;

export type ForecastResolutionMin = 15 | 30 | 60;

type StateReader = (id: string) => Promise<ioBroker.State | null | undefined>;
type ObjectReader = (id: string) => Promise<ioBroker.Object | null | undefined>;

/** Convert forecast power to watts (supports W and kW units). */
export function normalizeForecastPowerW(raw: number, unit?: string): number {
	if (!Number.isFinite(raw) || raw <= 0) {
		return 0;
	}
	const u = (unit || "").trim().toLowerCase();
	if (u === "kw" || u === "kilowatt" || u === "kilowatts") {
		return Math.round(raw * 1000);
	}
	if (u === "w" || u === "watt" || u === "watts") {
		return Math.round(raw);
	}
	// Heuristic: hourly PV forecast in kW is typically 0.01–30; values < 200 are treated as kW
	if (raw < 200) {
		return Math.round(raw * 1000);
	}
	return Math.round(raw);
}

export function normalizeForecastResolutionMin(raw: unknown): ForecastResolutionMin {
	const n = Number(raw);
	if (n === 15 || n === 30) {
		return n;
	}
	return 60;
}

function pad2(n: number): string {
	return n.toString().padStart(2, "0");
}

/** Slot keys under power.hoursToday for the given resolution (HH:MM:SS). */
export function buildForecastSlotKeys(resolutionMin: ForecastResolutionMin): string[] {
	const minutes =
		resolutionMin === 15 ? [0, 15, 30, 45] : resolutionMin === 30 ? [0, 30] : [0];
	const keys: string[] = [];
	for (const h of FORECAST_HOURS) {
		for (const m of minutes) {
			keys.push(`${pad2(h)}:${pad2(m)}:00`);
		}
	}
	return keys;
}

/** Berlin clock time floored to the forecast interval as HH:MM:SS. */
export function currentBerlinSlotKey(resolutionMin: ForecastResolutionMin, now = new Date()): string {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Berlin",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).formatToParts(now);
	const hour = Number(parts.find(p => p.type === "hour")?.value ?? 0);
	const minute = Number(parts.find(p => p.type === "minute")?.value ?? 0);
	const floored = Math.floor(minute / resolutionMin) * resolutionMin;
	return `${pad2(Math.min(23, Math.max(0, hour)))}:${pad2(floored)}:00`;
}

/**
 * Read pvforecast plant power slots from `{plantPath}.power.hoursToday.{HH:MM:SS}`.
 * Aggregates max W per calendar hour into `hours`; raw slots go into `slots`.
 */
export async function readHourlyForecast(
	plantPath: string,
	getState: StateReader,
	getObject?: ObjectReader,
	resolutionMin: ForecastResolutionMin | number = 60,
): Promise<HourlyForecast> {
	const base = plantPath.replace(/\.$/, "").trim();
	const resolution = normalizeForecastResolutionMin(resolutionMin);
	const channel = `${base}.power.hoursToday`;
	const hours = new Map<number, number>();
	const slots = new Map<string, number>();

	if (!base) {
		return { hours, slots };
	}

	for (const key of buildForecastSlotKeys(resolution)) {
		const id = `${channel}.${key}`;
		const st = await getState(id);
		if (st?.val === null || st?.val === undefined || st.val === "") {
			continue;
		}
		const raw = Number(st.val);
		if (Number.isNaN(raw)) {
			continue;
		}
		let unit: string | undefined;
		if (getObject) {
			const obj = await getObject(id);
			const common = obj?.common as { unit?: string } | undefined;
			unit = common?.unit;
		}
		const watts = normalizeForecastPowerW(raw, unit);
		slots.set(key, watts);
		const hour = Number(key.slice(0, 2));
		if (Number.isFinite(hour)) {
			hours.set(hour, Math.max(hours.get(hour) ?? 0, watts));
		}
	}
	return { hours, slots };
}

export function detectCurtailmentWindow(forecast: HourlyForecast, acLimitW: number): CurtailmentWindow {
	const overHours: number[] = [];
	for (const [h, power] of forecast.hours) {
		if (power > acLimitW) {
			overHours.push(h);
		}
	}
	if (!overHours.length) {
		return {
			today: false,
			startHour: 0,
			endHour: 0,
			durationHours: 0,
			chargeDivisorHours: 0,
		};
	}
	overHours.sort((a, b) => a - b);
	const startHour = overHours[0] ?? 0;
	const endHour = overHours[overHours.length - 1] ?? 0;
	const durationHours = endHour - startHour + 1;
	return {
		today: true,
		startHour,
		endHour,
		durationHours,
		chargeDivisorHours: durationHours + 1,
	};
}

export function currentPhase(window: CurtailmentWindow, nowHour: number): CurtailmentPhase {
	if (!window.today) {
		return "idle";
	}
	if (nowHour < window.startHour) {
		return "before";
	}
	if (nowHour <= window.endHour) {
		return "active";
	}
	return "after";
}

export function remainingCurtailmentHours(window: CurtailmentWindow, nowHour: number): number {
	if (!window.today || nowHour > window.endHour) {
		return 0;
	}
	return Math.max(0, window.endHour - nowHour + 1);
}

/** Forecast PV power (W) for a given hour, or 0 if missing. */
export function forecastPowerAtHour(forecast: HourlyForecast, hour: number): number {
	return forecast.hours.get(hour) ?? 0;
}

/**
 * Target AC/grid export (W) from forecast.
 * Prefers the current interval slot when available; otherwise hour / window peak.
 */
export function forecastExportTargetW(
	forecast: HourlyForecast,
	nowHour: number,
	window: CurtailmentWindow,
	resolutionMin: ForecastResolutionMin | number = 60,
	now = new Date(),
): number {
	if (!window.today) {
		return 0;
	}
	const resolution = normalizeForecastResolutionMin(resolutionMin);
	if (forecast.slots && forecast.slots.size > 0) {
		const slotKey = currentBerlinSlotKey(resolution, now);
		const slotW = forecast.slots.get(slotKey) ?? 0;
		if (slotW > 0) {
			return slotW;
		}
	}
	const current = forecastPowerAtHour(forecast, nowHour);
	if (current > 0) {
		return current;
	}
	if (nowHour < window.startHour) {
		const atStart = forecastPowerAtHour(forecast, window.startHour);
		if (atStart > 0) {
			return atStart;
		}
	}
	let peak = 0;
	for (let h = window.startHour; h <= window.endHour; h++) {
		peak = Math.max(peak, forecastPowerAtHour(forecast, h));
	}
	return peak;
}
