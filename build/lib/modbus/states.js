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
var states_exports = {};
__export(states_exports, {
  applyControlSnapshot: () => applyControlSnapshot,
  controlStateValue: () => controlStateValue,
  controlValueFromPoints: () => controlValueFromPoints,
  ensureModbusControlObjects: () => ensureModbusControlObjects,
  ensureModbusObjects: () => ensureModbusObjects,
  operatingModeStatesFromPoints: () => operatingModeStatesFromPoints,
  writeModbusPoints: () => writeModbusPoints
});
module.exports = __toCommonJS(states_exports);
var import_objectHierarchy = require("../objectHierarchy");
var import_encode = require("./encode");
function roleForPoint(point) {
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
    case "\xB0C":
      return "value.temperature";
    default:
      return typeof point.value === "number" ? "value" : "text";
  }
}
function controlRole(spec) {
  if (spec.kind === "switch") {
    return "switch";
  }
  if (spec.kind === "select") {
    return "state";
  }
  return spec.unit === "%" ? "level.battery" : "level";
}
function controlStateValue(spec, raw) {
  if (spec.kind === "switch") {
    return (0, import_encode.isSwitchOn)(raw);
  }
  if (spec.kind === "select") {
    return String(raw);
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
async function ensureModbusObjects(adapter, deviceId, deviceName) {
  const hierarchy = new import_objectHierarchy.ObjectHierarchy(adapter);
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
      def: false
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync(`modbus.${deviceId}.info.profile`, {
    type: "state",
    common: {
      name: "Profile",
      type: "string",
      role: "text",
      read: true,
      write: false,
      def: ""
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync(`modbus.${deviceId}.info.lastError`, {
    type: "state",
    common: {
      name: "Last error",
      type: "string",
      role: "text",
      read: true,
      write: false,
      def: ""
    },
    native: {}
  });
}
async function ensureModbusControlObjects(adapter, deviceId, profile, modeStates) {
  var _a, _b;
  if (!((_a = profile.controls) == null ? void 0 : _a.length)) {
    return;
  }
  const hierarchy = new import_objectHierarchy.ObjectHierarchy(adapter);
  await hierarchy.ensureChannel(`modbus.${deviceId}.control`, "Control");
  for (const spec of profile.controls) {
    const id = `modbus.${deviceId}.control.${spec.id}`;
    const states = spec.id === "operating_mode" ? modeStates != null ? modeStates : spec.optionLabels : spec.optionLabels;
    const common = {
      name: spec.name,
      type: spec.kind === "number" ? "number" : spec.kind === "switch" ? "boolean" : "string",
      role: controlRole(spec),
      read: true,
      write: true
    };
    if (spec.unit) {
      common.unit = spec.unit;
    }
    if (spec.min !== void 0) {
      common.min = spec.min;
    }
    if (spec.max !== void 0) {
      common.max = spec.max;
    }
    if (states) {
      common.states = states;
    }
    if (spec.kind === "switch") {
      common.def = false;
    } else if (spec.kind === "number") {
      common.def = (_b = spec.min) != null ? _b : 0;
    } else {
      common.def = "";
    }
    await adapter.setObjectNotExistsAsync(id, {
      type: "state",
      common,
      native: { modbusControl: spec.id }
    });
    await adapter.extendObject(id, { common });
  }
}
async function writeModbusPoints(adapter, deviceId, points) {
  for (const point of points) {
    if (point.internal) {
      continue;
    }
    const id = `modbus.${deviceId}.sensors.${point.id}`;
    const type = typeof point.value === "number" ? "number" : "string";
    await adapter.setObjectNotExistsAsync(id, {
      type: "state",
      common: {
        name: point.name,
        type,
        role: roleForPoint(point),
        read: true,
        write: false,
        unit: point.unit
      },
      native: {}
    });
    await adapter.setState(id, { val: point.value, ack: true });
  }
}
function applyControlSnapshot(snapshot, points) {
  const byId = new Map(points.map((p) => [p.id, p.value]));
  const mode = byId.get("operating_mode");
  if (mode !== void 0) {
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
  if (backupEn !== void 0) {
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
function operatingModeStatesFromPoints(points, profile) {
  var _a, _b;
  const maskPoint = points.find((p) => p.id === "ems_mode_mask");
  if (!maskPoint) {
    const labels = (_b = (_a = profile == null ? void 0 : profile.controls) == null ? void 0 : _a.find((c) => c.id === "operating_mode")) == null ? void 0 : _b.optionLabels;
    if (labels) {
      return { ...labels };
    }
  }
  return (0, import_encode.filterOperatingModes)(typeof (maskPoint == null ? void 0 : maskPoint.value) === "number" ? maskPoint.value : void 0);
}
function controlValueFromPoints(spec, points) {
  var _a;
  const source = (_a = spec.readFrom) != null ? _a : spec.id;
  const point = points.find((p) => p.id === source);
  if (!point) {
    return void 0;
  }
  const raw = controlStateValue(spec, point.value);
  if (spec.kind === "number" && typeof raw === "number" && spec.writeGain && spec.writeGain !== 1) {
    return raw;
  }
  return raw;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  applyControlSnapshot,
  controlStateValue,
  controlValueFromPoints,
  ensureModbusControlObjects,
  ensureModbusObjects,
  operatingModeStatesFromPoints,
  writeModbusPoints
});
//# sourceMappingURL=states.js.map
