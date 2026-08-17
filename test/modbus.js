"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");

const decodePath = path.join(__dirname, "../build/lib/modbus/decode.js");
if (!fs.existsSync(decodePath)) {
	describe("modbus", () => {
		it("skips until build/ exists (run npm run build)", function () {
			this.skip();
		});
	});
	return;
}

const { applyGainAndSplit, decodeProfilePoints, decodeRegisterValue } = require("../build/lib/modbus/decode");
const {
	buildReadRequest,
	buildWriteRequest,
	FC_READ_HOLDING,
	FC_READ_INPUT,
	FC_WRITE_MULTIPLE,
	FC_WRITE_SINGLE,
	parseReadResponse,
	parseWriteResponse,
} = require("../build/lib/modbus/protocol");
const { matchProfileByProductCode, MODBUS_PROFILES } = require("../build/lib/modbus/profiles");
const {
	parseModbusControlStateId,
	parseModbusDevices,
	parseModbusScanInterval,
} = require("../build/lib/modbus/config");
const { encodeRegisterValues, filterOperatingModes, resolveControlWrite } = require("../build/lib/modbus/encode");

describe("modbus decode", () => {
	it("decodes INT32 big-endian including negatives", () => {
		assert.strictEqual(decodeRegisterValue("INT32", [0, 1500]), 1500);
		assert.strictEqual(decodeRegisterValue("INT32", [0xffff, 0xff9c]), -100);
	});

	it("decodes STRING and VERSION", () => {
		assert.strictEqual(decodeRegisterValue("STRING", [0x4142, 0x4300]), "ABC");
		assert.strictEqual(decodeRegisterValue("VERSION", [0x0001, 0x0203]), "0.1.2.3");
	});

	it("applies HA gain and power split", () => {
		const qty = {
			address: 1,
			dataType: "INT32",
			count: 2,
			gain: 10,
			name: "x",
			powerSplit: "negative_only",
		};
		assert.strictEqual(applyGainAndSplit(qty, -250), 25);
		assert.strictEqual(applyGainAndSplit({ ...qty, powerSplit: "positive_only" }, -250), 0);
	});

	it("sums additional PV sources from Solarbank 4 map", () => {
		const registers = new Map([
			[10002, 0],
			[10003, 400],
			[10004, 0],
			[10005, 50],
			[10014, 87],
		]);
		const points = decodeProfilePoints(MODBUS_PROFILES.solarbank4, registers);
		const pv = points.find(p => p.id === "pv_power");
		const soc = points.find(p => p.id === "battery_soc");
		assert.ok(pv);
		assert.ok(soc);
		assert.strictEqual(pv.value, 450);
		assert.strictEqual(soc.value, 87);
	});
});

describe("modbus protocol", () => {
	it("builds and parses a holding-register read", () => {
		const req = buildReadRequest(7, 1, FC_READ_HOLDING, 10620, 2);
		assert.strictEqual(req.readUInt16BE(0), 7);
		assert.strictEqual(req[7], FC_READ_HOLDING);
		const pdu = Buffer.from([FC_READ_HOLDING, 4, 0x00, 0x0a, 0x00, 0x14]);
		const mbap = Buffer.alloc(7);
		mbap.writeUInt16BE(7, 0);
		mbap.writeUInt16BE(0, 2);
		mbap.writeUInt16BE(pdu.length + 1, 4);
		mbap[6] = 1;
		assert.deepStrictEqual(parseReadResponse(Buffer.concat([mbap, pdu]), 7, 1), [10, 20]);
	});

	it("rejects exception responses", () => {
		const pdu = Buffer.from([FC_READ_INPUT | 0x80, 0x02]);
		const mbap = Buffer.alloc(7);
		mbap.writeUInt16BE(1, 0);
		mbap.writeUInt16BE(0, 2);
		mbap.writeUInt16BE(pdu.length + 1, 4);
		mbap[6] = 1;
		assert.throws(() => parseReadResponse(Buffer.concat([mbap, pdu]), 1, 1), /exception 2/);
	});

	it("builds FC06 and FC16 write frames", () => {
		const single = buildWriteRequest(3, 1, 10064, [3]);
		assert.strictEqual(single[7], FC_WRITE_SINGLE);
		assert.strictEqual(single.readUInt16BE(8), 10064);
		assert.strictEqual(single.readUInt16BE(10), 3);
		const multi = buildWriteRequest(4, 1, 10071, [0xffff, 0xff9c]);
		assert.strictEqual(multi[7], FC_WRITE_MULTIPLE);
		assert.strictEqual(multi.readUInt16BE(8), 10071);
		assert.strictEqual(multi.readUInt16BE(10), 2);
		assert.strictEqual(multi[12], 4);
		assert.strictEqual(multi.readUInt16BE(13), 0xffff);
		assert.strictEqual(multi.readUInt16BE(15), 0xff9c);
	});

	it("accepts write responses", () => {
		const pdu = Buffer.from([FC_WRITE_SINGLE, 0x27, 0x40, 0x00, 0x03]);
		const mbap = Buffer.alloc(7);
		mbap.writeUInt16BE(9, 0);
		mbap.writeUInt16BE(0, 2);
		mbap.writeUInt16BE(pdu.length + 1, 4);
		mbap[6] = 1;
		parseWriteResponse(Buffer.concat([mbap, pdu]), 9, 1, FC_WRITE_SINGLE);
	});
});

describe("modbus config", () => {
	it("parses admin table rows and scan interval", () => {
		const devices = parseModbusDevices([
			{ enabled: true, host: "192.168.1.10", port: 502, unitId: 1, profile: "solarbank4", name: "SB4" },
			{ enabled: false, host: "192.168.1.11" },
			{ host: "" },
		]);
		assert.strictEqual(devices.length, 2);
		assert.strictEqual(devices[0].name, "SB4");
		assert.strictEqual(devices[1].enabled, false);
		assert.strictEqual(parseModbusScanInterval(5), 5);
		assert.strictEqual(parseModbusScanInterval(1), 2);
	});

	it("matches official product codes", () => {
		assert.strictEqual(matchProfileByProductCode("DN7Mxxxx").id, "solarbank4");
		assert.strictEqual(matchProfileByProductCode("DNSL1234").id, "smartMeterGen2");
		assert.strictEqual(matchProfileByProductCode("DMWH9999").id, "solarbankMaxAc");
	});

	it("parses modbus control state ids and ignores sensors", () => {
		assert.deepStrictEqual(
			parseModbusControlStateId("anker-solix.0", "anker-solix.0.modbus.SB4.control.operating_mode"),
			{
				deviceId: "SB4",
				control: "operating_mode",
			},
		);
		assert.strictEqual(
			parseModbusControlStateId("anker-solix.0", "anker-solix.0.modbus.SB4.sensors.battery_soc"),
			null,
		);
	});
});

describe("modbus encode and control writes", () => {
	it("encodes signed INT32 big-endian", () => {
		assert.deepStrictEqual(encodeRegisterValues("INT32", -100), [0xffff, 0xff9c]);
		assert.deepStrictEqual(encodeRegisterValues("INT32", 1500), [0, 1500]);
		assert.deepStrictEqual(encodeRegisterValues("UINT16", 3), [3]);
	});

	it("rejects battery setpoint unless third-party mode and direction are set", () => {
		const spec = MODBUS_PROFILES.solarbank4.controls.find(c => c.id === "battery_power_setpoint");
		assert.ok(spec);
		assert.match(resolveControlWrite(spec, 500, { operating_mode: "self_consumption" }).error, /third_party/);
		assert.match(
			resolveControlWrite(spec, 500, { operating_mode: "third_party_control" }).error,
			/battery_power_direction/,
		);
		assert.strictEqual(
			resolveControlWrite(spec, 500, {
				operating_mode: "third_party_control",
				battery_power_direction: "charge",
			}).value,
			-500,
		);
		assert.strictEqual(
			resolveControlWrite(spec, 400, {
				operating_mode: "third_party_control",
				battery_power_direction: "discharge",
			}).value,
			400,
		);
	});

	it("validates SOC relations when backup is enabled", () => {
		const charging = MODBUS_PROFILES.solarbank4.controls.find(c => c.id === "charging_limit_soc");
		assert.ok(charging);
		const snapshot = {
			backup_soc_enable: "enabled",
			charging_limit_soc: 90,
			discharge_limit_soc: 10,
			backup_reserve_soc: 20,
		};
		assert.strictEqual(resolveControlWrite(charging, 95, snapshot).value, 95);
		assert.match(resolveControlWrite(charging, 85, { ...snapshot, backup_reserve_soc: 90 }).error, /greater than/);
	});

	it("filters operating modes from ems_mode_mask bits", () => {
		const all = filterOperatingModes(0);
		assert.ok(all.self_consumption);
		const masked = filterOperatingModes((1 << 0) | (1 << 5));
		assert.deepStrictEqual(Object.keys(masked).sort(), ["self_consumption", "third_party_control"]);
	});

	it("exposes solarbank holding writes and plug power_switch, not meter writes", () => {
		assert.ok(MODBUS_PROFILES.solarbank4.ranges.some(r => r.type === "holding" && r.start === 10060));
		assert.ok(MODBUS_PROFILES.solarbank4.controls.some(c => c.id === "operating_mode"));
		assert.ok(MODBUS_PROFILES.smartPlugGen2.controls.some(c => c.id === "power_switch"));
		assert.ok(!MODBUS_PROFILES.smartMeterGen2.controls);
	});
});
