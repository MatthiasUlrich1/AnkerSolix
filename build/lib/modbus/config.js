"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var config_exports = {};
__export(config_exports, {
  modbusDeviceId: () => modbusDeviceId,
  parseModbusControlStateId: () => parseModbusControlStateId,
  parseModbusDevices: () => parseModbusDevices,
  parseModbusScanInterval: () => parseModbusScanInterval
});
module.exports = __toCommonJS(config_exports);
var import_profiles = require("./profiles");
const PROFILE_IDS = new Set(Object.keys(import_profiles.MODBUS_PROFILES));
function isProfileId(value) {
  return PROFILE_IDS.has(value);
}
function asText(value) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
function parseModbusDevices(raw) {
  var _a;
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const devices = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const row = entry;
    const host = (asText(row.host) || asText(row.ip)).trim();
    if (!host) {
      continue;
    }
    const enabled = row.enabled !== false && row.enabled !== "false" && row.enabled !== 0;
    const port = Math.max(1, Math.min(65535, Number(row.port) || 502));
    const unitId = Math.max(1, Math.min(247, Number((_a = row.unitId) != null ? _a : row.unit) || 1));
    const profileRaw = (asText(row.profile) || "auto").trim();
    const profile = isProfileId(profileRaw) ? profileRaw : "auto";
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
function modbusDeviceId(device) {
  const named = device.name.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  if (named) {
    return named.slice(0, 64);
  }
  return `${device.host.replace(/[.:]/g, "_")}_${device.port}`.slice(0, 64);
}
function parseModbusScanInterval(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return 5;
  }
  return Math.max(2, Math.min(60, Math.round(n)));
}
function parseModbusControlStateId(namespace, stateId) {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  modbusDeviceId,
  parseModbusControlStateId,
  parseModbusDevices,
  parseModbusScanInterval
});
//# sourceMappingURL=config.js.map
