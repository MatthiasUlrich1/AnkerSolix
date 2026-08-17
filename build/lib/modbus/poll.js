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
var poll_exports = {};
__export(poll_exports, {
  detectProfileFromPoints: () => detectProfileFromPoints,
  pollProfile: () => pollProfile,
  probeProductCode: () => probeProductCode,
  readRangeInto: () => readRangeInto
});
module.exports = __toCommonJS(poll_exports);
var import_decode = require("./decode");
var import_profiles = require("./profiles");
async function readRangeInto(client, type, start, end, target) {
  const count = end - start + 1;
  const registers = await client.readRegisters(type, start, count);
  for (let i = 0; i < registers.length; i++) {
    target.set(start + i, registers[i]);
  }
}
async function pollProfile(client, profile) {
  const registers = /* @__PURE__ */ new Map();
  for (const range of profile.ranges) {
    await readRangeInto(client, range.type, range.start, range.end, registers);
  }
  return (0, import_decode.decodeProfilePoints)(profile, registers);
}
async function probeProductCode(client) {
  const probes = [
    { type: "input", address: 32768, count: 5 },
    { type: "holding", address: 32768, count: 5 },
    { type: "holding", address: 10620, count: 10 }
  ];
  for (const probe of probes) {
    try {
      const registers = await client.readRegisters(probe.type, probe.address, probe.count);
      const text = (0, import_decode.decodeRegisterValue)("STRING", registers);
      if (typeof text === "string" && text.replace(/[\s\0]/g, "").length >= 3) {
        return text;
      }
    } catch {
      client.close();
    }
  }
  return "";
}
function detectProfileFromPoints(points) {
  var _a, _b;
  const sn = (_a = points.find((p) => p.id.endsWith("_sn") || p.id === "device_sn")) == null ? void 0 : _a.value;
  if (typeof sn === "string" && sn) {
    const matched = (0, import_profiles.matchProfileByProductCode)(sn);
    if (matched) {
      return matched;
    }
  }
  const model = (_b = points.find((p) => p.id.endsWith("_model") || p.id === "device_model")) == null ? void 0 : _b.value;
  if (typeof model === "string" && model) {
    return (0, import_profiles.matchProfileByProductCode)(model);
  }
  return void 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  detectProfileFromPoints,
  pollProfile,
  probeProductCode,
  readRangeInto
});
//# sourceMappingURL=poll.js.map
