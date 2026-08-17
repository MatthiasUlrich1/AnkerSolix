import type { ModbusDataType, ModbusDecodedPoint, ModbusDeviceProfile, ModbusReadQuantity } from "./types";

export function registersToSlice(map: Map<number, number>, address: number, count: number): number[] | null {
	const out: number[] = [];
	for (let i = 0; i < count; i++) {
		const value = map.get(address + i);
		if (value === undefined) {
			return null;
		}
		out.push(value);
	}
	return out;
}

export function decodeRegisterValue(dataType: ModbusDataType, registers: number[]): string | number {
	if (!registers.length) {
		return dataType === "STRING" || dataType === "VERSION" ? "" : 0;
	}
	switch (dataType) {
		case "UINT16":
			return registers[0] & 0xffff;
		case "INT16": {
			const raw = registers[0] & 0xffff;
			return raw < 0x8000 ? raw : raw - 0x10000;
		}
		case "UINT32": {
			if (registers.length < 2) {
				return 0;
			}
			return ((registers[0] & 0xffff) * 0x10000 + (registers[1] & 0xffff)) >>> 0;
		}
		case "INT32": {
			if (registers.length < 2) {
				return 0;
			}
			const unsigned = ((registers[0] & 0xffff) * 0x10000 + (registers[1] & 0xffff)) >>> 0;
			return unsigned > 0x7fffffff ? unsigned - 0x100000000 : unsigned;
		}
		case "VERSION": {
			const bytes: number[] = [];
			for (const reg of registers.slice(0, 2)) {
				bytes.push((reg >> 8) & 0xff, reg & 0xff);
			}
			return bytes.length >= 4 ? `${bytes[0]}.${bytes[1]}.${bytes[2]}.${bytes[3]}` : "";
		}
		case "STRING": {
			const bytes: number[] = [];
			for (const reg of registers) {
				bytes.push((reg >> 8) & 0xff, reg & 0xff);
			}
			return Buffer.from(bytes).toString("utf8").replace(/\0+$/g, "").trim();
		}
		default:
			return registers[0] & 0xffff;
	}
}

export function applyGainAndSplit(quantity: ModbusReadQuantity, raw: string | number): string | number {
	if (typeof raw !== "number" || quantity.dataType === "STRING" || quantity.dataType === "VERSION") {
		return raw;
	}
	let value = quantity.gain && quantity.gain !== 1 ? raw / quantity.gain : raw;
	if (quantity.powerSplit === "negative_only") {
		value = value < 0 ? Math.abs(value) : 0;
	} else if (quantity.powerSplit === "positive_only") {
		value = value > 0 ? value : 0;
	}
	return value;
}

export function applyValueMapping(quantity: ModbusReadQuantity, value: string | number): string | number {
	if (!quantity.valueMapping) {
		return value;
	}
	const key = String(value);
	return quantity.valueMapping[key] ?? key;
}

export function decodeProfilePoints(
	profile: ModbusDeviceProfile,
	registers: Map<number, number>,
): ModbusDecodedPoint[] {
	const rawById: Record<string, string | number> = {};
	for (const [id, quantity] of Object.entries(profile.quantities)) {
		const slice = registersToSlice(registers, quantity.address, quantity.count);
		if (!slice) {
			continue;
		}
		rawById[id] = applyGainAndSplit(quantity, decodeRegisterValue(quantity.dataType, slice));
	}

	const points: ModbusDecodedPoint[] = [];
	for (const [id, quantity] of Object.entries(profile.quantities)) {
		if (!(id in rawById)) {
			continue;
		}
		let value = rawById[id];
		if (quantity.additionalSources?.length && typeof value === "number") {
			for (const source of quantity.additionalSources) {
				const extra = rawById[source];
				if (typeof extra === "number") {
					value += extra;
				}
			}
		}
		value = applyValueMapping(quantity, value);
		points.push({
			id,
			name: quantity.name,
			value,
			unit: quantity.unit && quantity.unit !== "/" ? quantity.unit : undefined,
			internal: Boolean(quantity.internal),
		});
	}
	return points;
}

export function productCodeFromSn(sn: string): string {
	return (sn || "")
		.replace(/[\s\0]/g, "")
		.slice(0, 4)
		.toUpperCase();
}
