import { decodeProfilePoints, decodeRegisterValue } from "./decode";
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
	const probes: Array<{ type: ModbusRegisterType; address: number; count: number }> = [
		{ type: "input", address: 32768, count: 5 },
		{ type: "holding", address: 32768, count: 5 },
		{ type: "holding", address: 10620, count: 10 },
	];
	for (const probe of probes) {
		try {
			const registers = await client.readRegisters(probe.type, probe.address, probe.count);
			const text = decodeRegisterValue("STRING", registers);
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
		return matchProfileByProductCode(model);
	}
	return undefined;
}
