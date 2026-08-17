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
var types_exports = {};
__export(types_exports, {
  MODBUS_WRITE_GUARD_MS: () => MODBUS_WRITE_GUARD_MS,
  OPERATING_MODE_CAPABILITY_BITS: () => OPERATING_MODE_CAPABILITY_BITS,
  OPERATING_MODE_LABELS: () => OPERATING_MODE_LABELS,
  OPERATING_MODE_OPTIONS: () => OPERATING_MODE_OPTIONS,
  THIRD_PARTY_MODE: () => THIRD_PARTY_MODE
});
module.exports = __toCommonJS(types_exports);
const MODBUS_WRITE_GUARD_MS = 15e3;
const THIRD_PARTY_MODE = "third_party_control";
const OPERATING_MODE_OPTIONS = {
  self_consumption: 0,
  tou_mode: 1,
  third_party_control: 3,
  custom_mode: 4,
  socket_overlay_mode: 5,
  smart_mode: 6,
  dynamic_pricing: 7
};
const OPERATING_MODE_LABELS = {
  self_consumption: "Self-consumption",
  tou_mode: "Time of use",
  third_party_control: "Third-party control",
  custom_mode: "Custom",
  socket_overlay_mode: "Socket overlay",
  smart_mode: "Smart mode",
  dynamic_pricing: "Dynamic pricing"
};
const OPERATING_MODE_CAPABILITY_BITS = {
  self_consumption: 0,
  tou_mode: 1,
  custom_mode: 2,
  smart_mode: 3,
  socket_overlay_mode: 4,
  third_party_control: 5,
  dynamic_pricing: 6
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MODBUS_WRITE_GUARD_MS,
  OPERATING_MODE_CAPABILITY_BITS,
  OPERATING_MODE_LABELS,
  OPERATING_MODE_OPTIONS,
  THIRD_PARTY_MODE
});
//# sourceMappingURL=types.js.map
