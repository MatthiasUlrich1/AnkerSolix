import { expect } from "chai";

import {
	buildForecastSlotKeys,
	currentPhase,
	detectCurtailmentWindow,
	forecastExportTargetW,
	normalizeForecastPowerW,
	normalizeForecastResolutionMin,
	readHourlyForecast,
} from "./curtailmentForecast";

describe("curtailmentForecast", () => {
	it("converts kW to W and keeps W", () => {
		expect(normalizeForecastPowerW(5.473, "kW")).to.equal(5473);
		expect(normalizeForecastPowerW(5.473)).to.equal(5473);
		expect(normalizeForecastPowerW(5473, "W")).to.equal(5473);
	});

	it("normalizes resolution to 60, 30, or 15", () => {
		expect(normalizeForecastResolutionMin(60)).to.equal(60);
		expect(normalizeForecastResolutionMin("30")).to.equal(30);
		expect(normalizeForecastResolutionMin(15)).to.equal(15);
		expect(normalizeForecastResolutionMin(7)).to.equal(60);
	});

	it("builds hourly, half-hour, and quarter-hour slot keys", () => {
		expect(buildForecastSlotKeys(60)).to.include("11:00:00");
		expect(buildForecastSlotKeys(60)).to.not.include("11:30:00");
		expect(buildForecastSlotKeys(30)).to.include.members(["11:00:00", "11:30:00"]);
		expect(buildForecastSlotKeys(15)).to.include.members(["11:00:00", "11:15:00", "11:30:00", "11:45:00"]);
		expect(buildForecastSlotKeys(60)).to.have.length(18);
		expect(buildForecastSlotKeys(30)).to.have.length(36);
		expect(buildForecastSlotKeys(15)).to.have.length(72);
	});

	it("detects curtailment when forecast exceeds standalone limit", () => {
		const forecast = {
			hours: new Map<number, number>([[11, 5473]]),
		};
		const window = detectCurtailmentWindow(forecast, 800);
		expect(window.today).to.equal(true);
		expect(window.startHour).to.equal(11);
	});

	it("reads pvforecast power.hoursToday slots in W", async () => {
		const states: Record<string, number> = {
			"pvforecast.0.plants.pv.power.hoursToday.11:00:00": 5473,
			"pvforecast.0.plants.pv.power.hoursToday.12:00:00": 8000,
		};
		const units: Record<string, string> = {
			"pvforecast.0.plants.pv.power.hoursToday.11:00:00": "W",
			"pvforecast.0.plants.pv.power.hoursToday.12:00:00": "W",
		};
		const forecast = await readHourlyForecast(
			"pvforecast.0.plants.pv",
			id => Promise.resolve({ val: states[id] }) as Promise<ioBroker.State>,
			id => Promise.resolve({ common: { unit: units[id] } }) as Promise<ioBroker.Object>,
			60,
		);
		expect(forecast.hours.get(11)).to.equal(5473);
		expect(forecast.hours.get(12)).to.equal(8000);
		expect(forecast.slots?.get("11:00:00")).to.equal(5473);
	});

	it("aggregates max power per hour for 15-minute slots", async () => {
		const states: Record<string, number> = {
			"pvforecast.0.plants.pv.power.hoursToday.11:00:00": 1000,
			"pvforecast.0.plants.pv.power.hoursToday.11:15:00": 5000,
			"pvforecast.0.plants.pv.power.hoursToday.11:30:00": 3000,
			"pvforecast.0.plants.pv.power.hoursToday.11:45:00": 2000,
		};
		const forecast = await readHourlyForecast(
			"pvforecast.0.plants.pv",
			id => Promise.resolve(states[id] !== undefined ? { val: states[id] } : null) as Promise<ioBroker.State>,
			async () => ({ common: { unit: "W" } }) as unknown as Promise<ioBroker.Object>,
			15,
		);
		expect(forecast.hours.get(11)).to.equal(5000);
		expect(forecast.slots?.get("11:15:00")).to.equal(5000);
	});

	it("returns empty forecast for empty plant path", async () => {
		const forecast = await readHourlyForecast("", () => Promise.resolve(null));
		expect(forecast.hours.size).to.equal(0);
	});

	it("uses current hour forecast as export target", () => {
		const forecast = {
			hours: new Map<number, number>([
				[10, 2000],
				[11, 5473],
			]),
		};
		const window = detectCurtailmentWindow(forecast, 800);
		expect(forecastExportTargetW(forecast, 11, window)).to.equal(5473);
		expect(forecastExportTargetW(forecast, 10, window)).to.equal(2000);
	});

	it("prefers current slot for export target when slots exist", () => {
		const forecast = {
			hours: new Map<number, number>([[11, 8000]]),
			slots: new Map<string, number>([
				["11:00:00", 1000],
				["11:15:00", 4000],
				["11:30:00", 7000],
				["11:45:00", 6000],
			]),
		};
		const window = detectCurtailmentWindow(forecast, 800);
		const at = new Date("2026-07-16T09:20:00Z"); // 11:20 Berlin in summer (CEST = UTC+2)
		expect(forecastExportTargetW(forecast, 11, window, 15, at)).to.equal(4000);
	});

	it("applies controls in before phase on curtailment days", () => {
		const forecast = { hours: new Map<number, number>([[11, 5473]]) };
		const window = detectCurtailmentWindow(forecast, 800);
		expect(currentPhase(window, 10)).to.equal("before");
		expect(forecastExportTargetW(forecast, 10, window)).to.equal(5473);
	});
});
