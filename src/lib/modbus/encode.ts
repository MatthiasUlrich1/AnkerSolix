import {
	OPERATING_MODE_CAPABILITY_BITS,
	OPERATING_MODE_LABELS,
	OPERATING_MODE_OPTIONS,
	THIRD_PARTY_MODE,
	type ModbusControlSpec,
	type ModbusDataType,
} from "./types";

export function encodeRegisterValues(dataType: ModbusDataType, value: number): number[] {
	switch (dataType) {
		case "UINT16":
			return [value & 0xffff];
		case "INT16": {
			const raw = value < 0 ? value + 0x10000 : value;
			return [raw & 0xffff];
		}
		case "UINT32": {
			const unsigned = value >>> 0;
			return [(unsigned >>> 16) & 0xffff, unsigned & 0xffff];
		}
		case "INT32": {
			const unsigned = Math.trunc(value) >>> 0;
			return [(unsigned >>> 16) & 0xffff, unsigned & 0xffff];
		}
		default:
			throw new Error(`Cannot encode ${dataType} for Modbus write`);
	}
}

export function parseOperatingMode(value: string | number): string | undefined {
	if (typeof value === "number" && Number.isFinite(value)) {
		const found = Object.entries(OPERATING_MODE_OPTIONS).find(([, n]) => n === value);
		return found?.[0];
	}
	const key = String(value);
	return key in OPERATING_MODE_OPTIONS ? key : undefined;
}

export function isBackupEnabled(value: unknown): boolean {
	return isSwitchOn(value);
}

export function isSwitchOn(value: unknown): boolean {
	return (
		value === true ||
		value === 1 ||
		value === "1" ||
		value === "true" ||
		value === "enabled" ||
		value === "connected"
	);
}

export interface ModbusControlSnapshot {
	operating_mode?: string | number;
	battery_power_direction?: string | number;
	charging_limit_soc?: number;
	discharge_limit_soc?: number;
	backup_reserve_soc?: number;
	backup_soc_enable?: string | number | boolean;
	max_charge_power?: number;
	max_discharge_power?: number;
}

export function resolveControlWrite(
	spec: ModbusControlSpec,
	rawValue: ioBroker.StateValue,
	snapshot: ModbusControlSnapshot,
): { error: string } | { value: number } {
	if (spec.localOnly) {
		if (spec.kind === "select") {
			const key = String(rawValue);
			if (spec.options && !(key in spec.options)) {
				return { error: `Invalid ${spec.id} value ${key}` };
			}
			return { value: spec.options?.[key] ?? 0 };
		}
		return { value: Number(rawValue) || 0 };
	}

	if (spec.requireThirdParty && parseOperatingMode(snapshot.operating_mode ?? "") !== THIRD_PARTY_MODE) {
		return { error: "Set operating_mode to third_party_control first" };
	}

	if (spec.requireBackupEnable && !isBackupEnabled(snapshot.backup_soc_enable)) {
		return { error: "Enable backup_soc_enable before writing backup_reserve_soc" };
	}

	if (spec.kind === "switch") {
		return { value: isSwitchOn(rawValue) ? 1 : 0 };
	}

	if (spec.kind === "select") {
		const key = String(rawValue);
		if (!spec.options || !(key in spec.options)) {
			return { error: `Invalid ${spec.id} value ${key}` };
		}
		return { value: spec.options[key] };
	}

	const numeric = Number(rawValue);
	if (!Number.isFinite(numeric)) {
		return { error: `Invalid number for ${spec.id}` };
	}
	if (spec.min !== undefined && numeric < spec.min) {
		return { error: `${spec.id} below minimum ${spec.min}` };
	}
	if (spec.max !== undefined && numeric > spec.max) {
		return { error: `${spec.id} above maximum ${spec.max}` };
	}

	if (spec.signedFromDirection) {
		const direction = String(snapshot.battery_power_direction ?? "");
		if (direction !== "charge" && direction !== "discharge") {
			return { error: "Select battery_power_direction (charge/discharge) first" };
		}
		const limit = direction === "charge" ? snapshot.max_charge_power : snapshot.max_discharge_power;
		if (typeof limit === "number" && limit > 0 && numeric > limit) {
			return { error: `${spec.id} exceeds ${direction} limit ${limit} W` };
		}
		return { value: direction === "charge" ? -Math.abs(numeric) : Math.abs(numeric) };
	}

	const socError = validateSocWrite(spec.id, numeric, snapshot);
	if (socError) {
		return { error: socError };
	}
	return { value: numeric };
}

export function validateSocWrite(id: string, value: number, snapshot: ModbusControlSnapshot): string | null {
	if (!isBackupEnabled(snapshot.backup_soc_enable) && id !== "backup_soc_enable") {
		return null;
	}
	const charging = id === "charging_limit_soc" ? value : Number(snapshot.charging_limit_soc);
	const discharge = id === "discharge_limit_soc" ? value : Number(snapshot.discharge_limit_soc);
	const backup = id === "backup_reserve_soc" ? value : Number(snapshot.backup_reserve_soc);
	if (![charging, discharge, backup].every(n => Number.isFinite(n))) {
		return null;
	}
	if (charging <= discharge || charging <= backup) {
		return "charging_limit_soc must be greater than discharge and backup reserve";
	}
	if (discharge > backup) {
		return "discharge_limit_soc must be less than or equal to backup_reserve_soc";
	}
	return null;
}

export function filterOperatingModes(mask: number | undefined): Record<string, string> {
	if (mask === undefined || mask === 0) {
		return { ...OPERATING_MODE_LABELS };
	}
	const out: Record<string, string> = {};
	for (const [key, bit] of Object.entries(OPERATING_MODE_CAPABILITY_BITS)) {
		if (mask & (1 << bit)) {
			out[key] = OPERATING_MODE_LABELS[key];
		}
	}
	return Object.keys(out).length ? out : { ...OPERATING_MODE_LABELS };
}
