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
var encode_exports = {};
__export(encode_exports, {
  encodeRegisterValues: () => encodeRegisterValues,
  filterOperatingModes: () => filterOperatingModes,
  isBackupEnabled: () => isBackupEnabled,
  isSwitchOn: () => isSwitchOn,
  parseOperatingMode: () => parseOperatingMode,
  resolveControlWrite: () => resolveControlWrite,
  validateSocWrite: () => validateSocWrite
});
module.exports = __toCommonJS(encode_exports);
var import_types = require("./types");
function encodeRegisterValues(dataType, value) {
  switch (dataType) {
    case "UINT16":
      return [value & 65535];
    case "INT16": {
      const raw = value < 0 ? value + 65536 : value;
      return [raw & 65535];
    }
    case "UINT32": {
      const unsigned = value >>> 0;
      return [unsigned >>> 16 & 65535, unsigned & 65535];
    }
    case "INT32": {
      const unsigned = Math.trunc(value) >>> 0;
      return [unsigned >>> 16 & 65535, unsigned & 65535];
    }
    default:
      throw new Error(`Cannot encode ${dataType} for Modbus write`);
  }
}
function parseOperatingMode(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const found = Object.entries(import_types.OPERATING_MODE_OPTIONS).find(([, n]) => n === value);
    return found == null ? void 0 : found[0];
  }
  const key = String(value);
  return key in import_types.OPERATING_MODE_OPTIONS ? key : void 0;
}
function isBackupEnabled(value) {
  return isSwitchOn(value);
}
function isSwitchOn(value) {
  return value === true || value === 1 || value === "1" || value === "true" || value === "enabled" || value === "connected";
}
function resolveControlWrite(spec, rawValue, snapshot) {
  var _a, _b, _c, _d;
  if (spec.localOnly) {
    if (spec.kind === "select") {
      const key = String(rawValue);
      if (spec.options && !(key in spec.options)) {
        return { error: `Invalid ${spec.id} value ${key}` };
      }
      return { value: (_b = (_a = spec.options) == null ? void 0 : _a[key]) != null ? _b : 0 };
    }
    return { value: Number(rawValue) || 0 };
  }
  if (spec.requireThirdParty && parseOperatingMode((_c = snapshot.operating_mode) != null ? _c : "") !== import_types.THIRD_PARTY_MODE) {
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
  if (spec.min !== void 0 && numeric < spec.min) {
    return { error: `${spec.id} below minimum ${spec.min}` };
  }
  if (spec.max !== void 0 && numeric > spec.max) {
    return { error: `${spec.id} above maximum ${spec.max}` };
  }
  if (spec.signedFromDirection) {
    const direction = String((_d = snapshot.battery_power_direction) != null ? _d : "");
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
function validateSocWrite(id, value, snapshot) {
  if (!isBackupEnabled(snapshot.backup_soc_enable) && id !== "backup_soc_enable") {
    return null;
  }
  const charging = id === "charging_limit_soc" ? value : Number(snapshot.charging_limit_soc);
  const discharge = id === "discharge_limit_soc" ? value : Number(snapshot.discharge_limit_soc);
  const backup = id === "backup_reserve_soc" ? value : Number(snapshot.backup_reserve_soc);
  if (![charging, discharge, backup].every((n) => Number.isFinite(n))) {
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
function filterOperatingModes(mask) {
  if (mask === void 0 || mask === 0) {
    return { ...import_types.OPERATING_MODE_LABELS };
  }
  const out = {};
  for (const [key, bit] of Object.entries(import_types.OPERATING_MODE_CAPABILITY_BITS)) {
    if (mask & 1 << bit) {
      out[key] = import_types.OPERATING_MODE_LABELS[key];
    }
  }
  return Object.keys(out).length ? out : { ...import_types.OPERATING_MODE_LABELS };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  encodeRegisterValues,
  filterOperatingModes,
  isBackupEnabled,
  isSwitchOn,
  parseOperatingMode,
  resolveControlWrite,
  validateSocWrite
});
//# sourceMappingURL=encode.js.map
