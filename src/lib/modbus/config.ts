import type { ModbusDeviceConfig, ModbusProfileId } from "./types";
import { MODBUS_PROFILES } from "./profiles";

const PROFILE_IDS = new Set<string>(Object.keys(MODBUS_PROFILES));

function isProfileId(value: string): value is ModbusProfileId {
	return PROFILE_IDS.has(value);
}

function asText(value: unknown): string {
	return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function parseModbusDevices(raw: unknown): ModbusDeviceConfig[] {
	if (!Array.isArray(raw)) {
		return [];
	}
	const seen = new Set<string>();
	const devices: ModbusDeviceConfig[] = [];
	for (const entry of raw) {
		if (!entry || typeof entry !== "object") {
			continue;
		}
		const row = entry as Record<string, unknown>;
		const host = (asText(row.host) || asText(row.ip)).trim();
		if (!host) {
			continue;
		}
		const enabled = row.enabled !== false && row.enabled !== "false" && row.enabled !== 0;
		const port = Math.max(1, Math.min(65535, Number(row.port) || 502));
		const unitId = Math.max(1, Math.min(247, Number(row.unitId ?? row.unit) || 1));
		const profileRaw = (asText(row.profile) || "auto").trim();
		const profile: ModbusProfileId | "auto" = isProfileId(profileRaw) ? profileRaw : "auto";
		const name = asText(row.name).trim();
		const id = modbusDeviceId({ enabled, host, port, unitId, profile, name });
		if (seen.has(id)) {
			continue;
		}
		seen.add(id);
		devices.push({ enabled, host, port, unitId, profile, name });
	}
	return devices;
}

export function modbusDeviceId(device: ModbusDeviceConfig): string {
	const named = device.name.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
	if (named) {
		return named.slice(0, 64);
	}
	return `${device.host.replace(/[.:]/g, "_")}_${device.port}`.slice(0, 64);
}

export function parseModbusScanInterval(raw: unknown): number {
	const n = Number(raw);
	if (!Number.isFinite(n)) {
		return 5;
	}
	return Math.max(2, Math.min(60, Math.round(n)));
}

/** `namespace.modbus.<deviceId>.control.<id>` (deviceId has no dots). */
export function parseModbusControlStateId(
	namespace: string,
	stateId: string,
): { deviceId: string; control: string } | null {
	const prefix = `${namespace}.modbus.`;
	if (!stateId.startsWith(prefix)) {
		return null;
	}
	const parts = stateId.slice(prefix.length).split(".");
	if (parts.length !== 3 || parts[1] !== "control" || !parts[0] || !parts[2]) {
		return null;
	}
	return { deviceId: parts[0], control: parts[2] };
}
