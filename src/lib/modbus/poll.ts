import { decodeProfilePoints, decodeRegisterValue, type ModbusDecodeOptions } from "./decode";
import { matchProfileByProductCode } from "./profiles";
import type { ModbusTcpClient } from "./tcpClient";
import type { ModbusDecodedPoint, ModbusDeviceProfile, ModbusRegisterType } from "./types";

export async function readRangeInto(
	client: ModbusTcpClient,
	type: ModbusRegisterType,
	start: number,
	end: number,
	target: Map<number, number>,
): Promise<void> {
	const count = end - start + 1;
	const registers = await client.readRegisters(type, start, count);
	for (let i = 0; i < registers.length; i++) {
		target.set(start + i, registers[i]);
	}
}

export async function pollProfile(
	client: ModbusTcpClient,
	profile: ModbusDeviceProfile,
): Promise<ModbusDecodedPoint[]> {
	const registers = new Map<number, number>();
	for (const range of profile.ranges) {
		await readRangeInto(client, range.type, range.start, range.end, registers);
	}
	return decodeProfilePoints(profile, registers);
}

export async function probeProductCode(client: ModbusTcpClient): Promise<string> {
	const probes: Array<{ type: ModbusRegisterType; address: number; count: number; decode: ModbusDecodeOptions }> = [
		{ type: "input", address: 10090, count: 10, decode: { stringByteOrder: "low" } },
		{ type: "input", address: 10100, count: 12, decode: { stringByteOrder: "low" } },
		{ type: "input", address: 20011, count: 12, decode: {} },
		{ type: "input", address: 20001, count: 10, decode: {} },
		{ type: "input", address: 32768, count: 5, decode: {} },
		{ type: "holding", address: 32768, count: 5, decode: {} },
		{ type: "holding", address: 10620, count: 10, decode: {} },
	];
	for (const probe of probes) {
		try {
			const registers = await client.readRegisters(probe.type, probe.address, probe.count);
			const text = decodeRegisterValue("STRING", registers, probe.decode);
			if (typeof text === "string" && text.replace(/[\s\0]/g, "").length >= 3) {
				return text;
			}
		} catch {
			client.close();
		}
	}
	return "";
}

export function detectProfileFromPoints(points: ModbusDecodedPoint[]): ModbusDeviceProfile | undefined {
	const sn = points.find(p => p.id.endsWith("_sn") || p.id === "device_sn")?.value;
	if (typeof sn === "string" && sn) {
		const matched = matchProfileByProductCode(sn);
		if (matched) {
			return matched;
		}
	}
	const model = points.find(p => p.id.endsWith("_model") || p.id === "device_model")?.value;
	if (typeof model === "string" && model) {
		const fromModel = matchProfileByProductCode(model);
		if (fromModel) {
			return fromModel;
		}
		if (/x1/i.test(model)) {
			return matchProfileByProductCode("A5101");
		}
		if (/a5191|v1 smart ev|ev charger/i.test(model)) {
			return matchProfileByProductCode("A5191");
		}
	}
	return undefined;
}
