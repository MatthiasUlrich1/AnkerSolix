#!/usr/bin/env node
/**
 * Generate an ioBroker object-structure dump (OBJECTDUMP.md format) from adapter code.
 * Simulates a fresh instance with all entity groups enabled and representative devices.
 *
 * Usage: npm run build && node tools/generate-object-dump.mjs [output.json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outFile = path.resolve(process.argv[2] || path.join(root, "docs", "anker-solix.0.json"));

function importBuild(relPath) {
	return import(pathToFileURL(path.join(root, relPath)).href);
}

const { syncDevices } = await importBuild("build/lib/stateSync.js");
const { setupServiceStates } = await importBuild("build/lib/services.js");
const { setupCurtailmentStates } = await importBuild("build/lib/curtailmentStates.js");
const { ensureSystemBatPowerStates } = await importBuild("build/lib/systemBatPower.js");

const NS = "anker-solix.0";
const FROM = "system.adapter.anker-solix.0";
const TS = Date.now();
const ACL = {
	object: 1636,
	state: 1636,
	owner: "system.user.admin",
	ownerGroup: "system.group.administrator",
};

/** @type {Record<string, unknown>} */
const objects = {};
/** @type {Record<string, { val: unknown; ack: boolean }>} */
const states = {};

function deepMerge(target, patch) {
	for (const [key, val] of Object.entries(patch)) {
		if (val && typeof val === "object" && !Array.isArray(val) && typeof target[key] === "object") {
			deepMerge(/** @type {Record<string, unknown>} */ (target[key]), /** @type {Record<string, unknown>} */ (val));
		} else {
			target[key] = val;
		}
	}
}

function recordObject(id, obj) {
	const entry = {
		_id: id,
		type: obj.type,
		common: structuredClone(obj.common ?? {}),
		native: structuredClone(obj.native ?? {}),
		from: FROM,
		user: "system.user.admin",
		ts: TS,
		acl: { ...ACL },
	};
	if (objects[id]) {
		deepMerge(objects[id], entry);
	} else {
		objects[id] = entry;
	}
}

/** @type {import("../build/lib/types.js").BridgeDevice[]} */
const sampleDevices = [
	{
		info: {
			id: "SITE1",
			type: "system",
			name: "Demo Site",
			site_id: "SITE1",
			model: "Power System",
		},
		entities: {
			total_pv_power: 1200,
			home_power: 800,
			grid_power: -200,
			battery_power: 400,
			state_of_charge: 72,
		},
		writable: [],
		hasStatistics: true,
	},
	{
		info: {
			id: "SB001",
			type: "solarbank",
			name: "Solarbank 1",
			site_id: "SITE1",
			model: "A17C0",
			generation: 2,
		},
		entities: {
			battery_power: 400,
			state_of_charge: 72,
			output_power_total: 900,
			bat_charge_power: 400,
			bat_discharge_power: 0,
			cloud_state: true,
		},
		writable: ["preset_usage_mode", "ac_output_limit", "min_soc"],
		usage_mode_options: ["smartmeter", "smart"],
	},
	{
		info: {
			id: "SM001",
			type: "smartmeter",
			name: "Smart Meter",
			site_id: "SITE1",
			model: "Shelly 3EM",
		},
		entities: {
			grid_power: -200,
			grid_to_home_power: 150,
			grid_import_energy: 12.5,
		},
		writable: [],
	},
	{
		info: {
			id: "CB001",
			type: "combiner_box",
			name: "Power Dock",
			site_id: "SITE1",
			model: "A17X7",
		},
		entities: {
			total_state_of_charge: 68,
			solar_power_total: 1200,
		},
		writable: ["max_total_ac_output", "preset_usage_mode"],
		max_total_ac_output_options: [800, 1200, 1600],
		hasStatistics: true,
	},
	{
		info: {
			id: "EV001",
			type: "ev_charger",
			name: "EV Charger",
			site_id: "SITE1",
			model: "A17E1",
		},
		entities: {
			ev_charger_mode_status: "solar",
			ev_charger_plug_status: true,
			ev_charger_status: "charging",
			ev_charger_boost_status: false,
			ev_charger_bat_charge_power: 7200,
			ev_charger_charging_energy: 18.4,
			ev_charger_current_l1: 10.2,
			ev_charger_current_l2: 10.1,
			ev_charger_current_l3: 10.0,
			ev_charger_power_l1: 2400,
			ev_charger_power_l2: 2400,
			ev_charger_power_l3: 2400,
			ev_charger_voltage_l1: 230,
			ev_charger_voltage_l2: 231,
			ev_charger_voltage_l3: 229,
		},
		writable: [
			"ev_charger_mode",
			"ev_charger_schedule_switch",
			"ev_charger_max_current",
			"ev_charger_solar_switch",
		],
		ev_charger_mode_options: ["manual", "solar", "scheduled"],
	},
];

const config = {
	enableCoreEntities: true,
	enableEnergyStatistics: true,
	enableEnergyStatisticsWeek: true,
	enableEnergyStatisticsMonth: true,
	enableEnergyStatisticsYear: true,
	enableEnergyDetail: true,
	enablePowerFlows: true,
	enableDiagnostics: true,
	enableBinaryIndicators: true,
	enableAdvancedControls: true,
	enableSystemOverview: true,
	enableSitePrice: true,
	enableAccountInfo: true,
	enableSolarbankMeta: true,
	enableSmartplug: true,
	enablePps: true,
	enableEvCharger: true,
	enableVehicle: true,
	enableHes: true,
	enablePowerPanel: true,
	enableInverter: true,
};

const adapter = {
	namespace: NS,
	config,
	log: { debug() {}, info() {}, warn() {}, error() {} },
	async setObjectNotExistsAsync(id, obj) {
		if (!objects[id]) {
			recordObject(id, obj);
		}
	},
	async extendObject(id, patch) {
		if (!objects[id]) {
			recordObject(id, { type: "state", common: {}, native: {} });
		}
		deepMerge(objects[id], patch);
	},
	async setState(id, val, ack = true) {
		states[id] = { val, ack: !!ack };
	},
	async getStateAsync(id) {
		return states[id] ? { val: states[id].val, ack: states[id].ack } : null;
	},
	async getObjectAsync(id) {
		return objects[id] ? structuredClone(objects[id]) : null;
	},
	async objectExists(id) {
		return Object.prototype.hasOwnProperty.call(objects, id);
	},
	delObject(id, cb) {
		delete objects[id];
		cb?.(null);
	},
};

await adapter.setObjectNotExistsAsync("account", {
	type: "device",
	common: { name: "Account" },
	native: {},
});
await adapter.setObjectNotExistsAsync("account.nickname", {
	type: "state",
	common: { name: "Account nickname", type: "string", role: "text", read: true, write: false },
	native: {},
});
await adapter.setState("account.nickname", "demo@example.com", true);

await adapter.setObjectNotExistsAsync("info", {
	type: "channel",
	common: { name: "Information" },
	native: {},
});
for (const [id, name, type, role] of [
	["info.connection", "Cloud connected", "boolean", "indicator.reachability"],
	["info.pythonReady", "Python dependencies ready", "boolean", "indicator"],
]) {
	await adapter.setObjectNotExistsAsync(id, {
		type: "state",
		common: { name, type, role, read: true, write: false },
		native: {},
	});
	await adapter.setState(id, true, true);
}

await setupServiceStates(adapter);
await setupCurtailmentStates(adapter);
await syncDevices(adapter, sampleDevices);
await ensureSystemBatPowerStates(adapter, "SITE1");

const dump = {};
for (const id of Object.keys(objects).sort()) {
	const obj = { ...objects[id] };
	if (states[id]) {
		obj.val = states[id].val;
		obj.ack = states[id].ack;
		if (obj.type === "state") {
			obj.acl = { ...ACL, state: ACL.state };
		}
	}
	dump[id] = obj;
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(dump, null, 2)}\n`, "utf8");
console.log(`Wrote ${Object.keys(dump).length} objects to ${outFile}`);
