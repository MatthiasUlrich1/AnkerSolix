/** Local Modbus TCP channel (HA official YAML maps). Stage 2: holding-register writes. */

export const MODBUS_WRITE_GUARD_MS = 15_000;

export type ModbusRegisterType = "holding" | "input";

export type ModbusDataType = "UINT16" | "INT16" | "UINT32" | "INT32" | "STRING" | "VERSION";

export type ModbusPowerSplit = "negative_only" | "positive_only";

export type ModbusProfileId = "solarbank4" | "solarbankMaxAc" | "solarbankMax" | "smartMeterGen2" | "smartPlugGen2";

export type ModbusControlKind = "select" | "number" | "switch";

export interface ModbusReadQuantity {
	address: number;
	dataType: ModbusDataType;
	count: number;
	/** HA gain: numeric values are divided by this (gain 10 → 0.1). */
	gain?: number;
	unit?: string;
	name: string;
	internal?: boolean;
	powerSplit?: ModbusPowerSplit;
	additionalSources?: string[];
	valueMapping?: Record<string, string>;
}

export interface ModbusControlSpec {
	id: string;
	name: string;
	kind: ModbusControlKind;
	address: number;
	dataType: ModbusDataType;
	count: number;
	/** ioBroker state value → register number (select). */
	options?: Record<string, number>;
	optionLabels?: Record<string, string>;
	/** option key → ems_mode_mask bit index */
	capabilityBits?: Record<string, number>;
	min?: number;
	max?: number;
	unit?: string;
	/** Do not overwrite from device after the user has set a value. */
	neverRead?: boolean;
	/** Stored locally; not written to the device by itself. */
	localOnly?: boolean;
	/** Write signed INT32 using battery_power_direction (charge = negative). */
	signedFromDirection?: boolean;
	requireThirdParty?: boolean;
	requireBackupEnable?: boolean;
	/** Poll this quantity id into the control state (e.g. plug switch_status). */
	readFrom?: string;
}

export interface ModbusBatchRange {
	type: ModbusRegisterType;
	start: number;
	end: number;
}

export interface ModbusDeviceProfile {
	id: ModbusProfileId;
	label: string;
	snKey: string;
	modelKey: string;
	productCodes: Record<string, string>;
	ranges: ModbusBatchRange[];
	quantities: Record<string, ModbusReadQuantity>;
	controls?: ModbusControlSpec[];
}

export interface ModbusDeviceConfig {
	enabled: boolean;
	host: string;
	port: number;
	unitId: number;
	profile: ModbusProfileId | "auto";
	name: string;
}

export interface ModbusDecodedPoint {
	id: string;
	name: string;
	value: string | number;
	unit?: string;
	internal: boolean;
}

export const THIRD_PARTY_MODE = "third_party_control";

export const OPERATING_MODE_OPTIONS: Record<string, number> = {
	self_consumption: 0,
	tou_mode: 1,
	third_party_control: 3,
	custom_mode: 4,
	socket_overlay_mode: 5,
	smart_mode: 6,
	dynamic_pricing: 7,
};

export const OPERATING_MODE_LABELS: Record<string, string> = {
	self_consumption: "Self-consumption",
	tou_mode: "Time of use",
	third_party_control: "Third-party control",
	custom_mode: "Custom",
	socket_overlay_mode: "Socket overlay",
	smart_mode: "Smart mode",
	dynamic_pricing: "Dynamic pricing",
};

/** HA 0x8006 bit index per operating-mode option key. */
export const OPERATING_MODE_CAPABILITY_BITS: Record<string, number> = {
	self_consumption: 0,
	tou_mode: 1,
	custom_mode: 2,
	smart_mode: 3,
	socket_overlay_mode: 4,
	third_party_control: 5,
	dynamic_pricing: 6,
};
