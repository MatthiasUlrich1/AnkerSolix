import { ObjectHierarchy } from "../objectHierarchy";
import { filterOperatingModes, isSwitchOn } from "./encode";
import type { ModbusControlSnapshot } from "./encode";
import type { ModbusControlSpec, ModbusDecodedPoint, ModbusDeviceProfile } from "./types";

function roleForPoint(point: ModbusDecodedPoint): string {
	switch (point.unit) {
		case "W":
			return "value.power";
		case "kWh":
			return "value.energy";
		case "%":
			return "value.battery";
		case "V":
			return "value.voltage";
		case "A":
			return "value.current";
		case "°C":
			return "value.temperature";
		default:
			return typeof point.value === "number" ? "value" : "text";
	}
}

function controlRole(spec: ModbusControlSpec): string {
	if (spec.kind === "switch") {
		return "switch";
	}
	if (spec.kind === "select") {
		return "state";
	}
	return spec.unit === "%" ? "level.battery" : "level";
}

export function controlStateValue(spec: ModbusControlSpec, raw: string | number | boolean): string | number | boolean {
	if (spec.kind === "switch") {
		return isSwitchOn(raw);
	}
	if (spec.kind === "select") {
		return String(raw);
	}
	const n = Number(raw);
	return Number.isFinite(n) ? n : 0;
}

export async function ensureModbusObjects(
	adapter: ioBroker.Adapter,
	deviceId: string,
	deviceName: string,
): Promise<void> {
	const hierarchy = new ObjectHierarchy(adapter);
	await hierarchy.ensureFolder("modbus", "Modbus (local)");
	await hierarchy.ensureDevice(`modbus.${deviceId}`, deviceName);
	await hierarchy.ensureChannel(`modbus.${deviceId}.info`, "Info");
	await hierarchy.ensureChannel(`modbus.${deviceId}.sensors`, "Sensors");

	await adapter.setObjectNotExistsAsync(`modbus.${deviceId}.info.connected`, {
		type: "state",
		common: {
			name: "Connected",
			type: "boolean",
			role: "indicator.connected",
			read: true,
			write: false,
			def: false,
		},
		native: {},
	});
	await adapter.setObjectNotExistsAsync(`modbus.${deviceId}.info.profile`, {
		type: "state",
		common: {
			name: "Profile",
			type: "string",
			role: "text",
			read: true,
			write: false,
			def: "",
		},
		native: {},
	});
	await adapter.setObjectNotExistsAsync(`modbus.${deviceId}.info.lastError`, {
		type: "state",
		common: {
			name: "Last error",
			type: "string",
			role: "text",
			read: true,
			write: false,
			def: "",
		},
		native: {},
	});
}

export async function ensureModbusControlObjects(
	adapter: ioBroker.Adapter,
	deviceId: string,
	profile: ModbusDeviceProfile,
	modeStates?: Record<string, string>,
): Promise<void> {
	if (!profile.controls?.length) {
		return;
	}
	const hierarchy = new ObjectHierarchy(adapter);
	await hierarchy.ensureChannel(`modbus.${deviceId}.control`, "Control");
	for (const spec of profile.controls) {
		const id = `modbus.${deviceId}.control.${spec.id}`;
		const states = spec.id === "operating_mode" ? (modeStates ?? spec.optionLabels) : spec.optionLabels;
		const common: ioBroker.StateCommon = {
			name: spec.name,
			type: spec.kind === "number" ? "number" : spec.kind === "switch" ? "boolean" : "string",
			role: controlRole(spec),
			read: true,
			write: true,
		};
		if (spec.unit) {
			common.unit = spec.unit;
		}
		if (spec.min !== undefined) {
			common.min = spec.min;
		}
		if (spec.max !== undefined) {
			common.max = spec.max;
		}
		if (states) {
			common.states = states;
		}
		if (spec.kind === "switch") {
			common.def = false;
		} else if (spec.kind === "number") {
			common.def = spec.min ?? 0;
		} else {
			common.def = "";
		}
		await adapter.setObjectNotExistsAsync(id, {
			type: "state",
			common,
			native: { modbusControl: spec.id },
		});
		await adapter.extendObject(id, { common });
	}
}

export async function writeModbusPoints(
	adapter: ioBroker.Adapter,
	deviceId: string,
	points: ModbusDecodedPoint[],
): Promise<void> {
	for (const point of points) {
		if (point.internal) {
			continue;
		}
		const id = `modbus.${deviceId}.sensors.${point.id}`;
		const type: ioBroker.CommonType = typeof point.value === "number" ? "number" : "string";
		await adapter.setObjectNotExistsAsync(id, {
			type: "state",
			common: {
				name: point.name,
				type,
				role: roleForPoint(point),
				read: true,
				write: false,
				unit: point.unit,
			},
			native: {},
		});
		await adapter.setState(id, { val: point.value, ack: true });
	}
}

export function applyControlSnapshot(snapshot: ModbusControlSnapshot, points: ModbusDecodedPoint[]): void {
	const byId = new Map(points.map(p => [p.id, p.value]));
	const mode = byId.get("operating_mode");
	if (mode !== undefined) {
		snapshot.operating_mode = mode;
	}
	const charging = byId.get("charging_limit_soc");
	if (typeof charging === "number") {
		snapshot.charging_limit_soc = charging;
	}
	const discharge = byId.get("discharge_limit_soc");
	if (typeof discharge === "number") {
		snapshot.discharge_limit_soc = discharge;
	}
	const backup = byId.get("backup_reserve_soc");
	if (typeof backup === "number") {
		snapshot.backup_reserve_soc = backup;
	}
	const backupEn = byId.get("backup_soc_enable");
	if (backupEn !== undefined) {
		snapshot.backup_soc_enable = backupEn;
	}
	const maxCharge = byId.get("max_charge_power");
	if (typeof maxCharge === "number") {
		snapshot.max_charge_power = maxCharge;
	}
	const maxDischarge = byId.get("max_discharge_power");
	if (typeof maxDischarge === "number") {
		snapshot.max_discharge_power = maxDischarge;
	}
}

export function operatingModeStatesFromPoints(points: ModbusDecodedPoint[]): Record<string, string> {
	const mask = points.find(p => p.id === "ems_mode_mask")?.value;
	return filterOperatingModes(typeof mask === "number" ? mask : undefined);
}

export function controlValueFromPoints(
	spec: ModbusControlSpec,
	points: ModbusDecodedPoint[],
): string | number | boolean | undefined {
	const source = spec.readFrom ?? spec.id;
	const point = points.find(p => p.id === source);
	if (!point) {
		return undefined;
	}
	return controlStateValue(spec, point.value);
}
