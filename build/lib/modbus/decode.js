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
var decode_exports = {};
__export(decode_exports, {
  applyGainAndSplit: () => applyGainAndSplit,
  applyValueMapping: () => applyValueMapping,
  decodeProfilePoints: () => decodeProfilePoints,
  decodeRegisterValue: () => decodeRegisterValue,
  productCodeFromSn: () => productCodeFromSn,
  registersToSlice: () => registersToSlice
});
module.exports = __toCommonJS(decode_exports);
function registersToSlice(map, address, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const value = map.get(address + i);
    if (value === void 0) {
      return null;
    }
    out.push(value);
  }
  return out;
}
function stringBytesFromRegisters(registers, stringByteOrder) {
  const bytes = [];
  for (const reg of registers) {
    if (stringByteOrder === "low") {
      bytes.push(reg & 255, reg >> 8 & 255);
    } else {
      bytes.push(reg >> 8 & 255, reg & 255);
    }
  }
  return bytes;
}
function decodeRegisterValue(dataType, registers, options = {}) {
  var _a, _b;
  if (!registers.length) {
    return dataType === "STRING" || dataType === "VERSION" ? "" : 0;
  }
  const wordOrder = (_a = options.wordOrder) != null ? _a : "big";
  const stringByteOrder = (_b = options.stringByteOrder) != null ? _b : "high";
  switch (dataType) {
    case "UINT16":
      return registers[0] & 65535;
    case "INT16": {
      const raw = registers[0] & 65535;
      return raw < 32768 ? raw : raw - 65536;
    }
    case "UINT32": {
      if (registers.length < 2) {
        return 0;
      }
      if (wordOrder === "little") {
        return (registers[1] & 65535) * 65536 + (registers[0] & 65535) >>> 0;
      }
      return (registers[0] & 65535) * 65536 + (registers[1] & 65535) >>> 0;
    }
    case "INT32": {
      if (registers.length < 2) {
        return 0;
      }
      const unsigned = wordOrder === "little" ? (registers[1] & 65535) * 65536 + (registers[0] & 65535) >>> 0 : (registers[0] & 65535) * 65536 + (registers[1] & 65535) >>> 0;
      return unsigned > 2147483647 ? unsigned - 4294967296 : unsigned;
    }
    case "VERSION": {
      const bytes = stringBytesFromRegisters(registers.slice(0, 2), stringByteOrder);
      return bytes.length >= 4 ? `${bytes[0]}.${bytes[1]}.${bytes[2]}.${bytes[3]}` : "";
    }
    case "STRING": {
      const bytes = stringBytesFromRegisters(registers, stringByteOrder);
      return Buffer.from(bytes).toString("utf8").replace(/\0+$/g, "").trim();
    }
    default:
      return registers[0] & 65535;
  }
}
function applyGainAndSplit(quantity, raw) {
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
function applyValueMapping(quantity, value) {
  var _a;
  if (!quantity.valueMapping) {
    return value;
  }
  const key = String(value);
  return (_a = quantity.valueMapping[key]) != null ? _a : key;
}
function decodeProfilePoints(profile, registers) {
  var _a;
  const rawById = {};
  for (const [id, quantity] of Object.entries(profile.quantities)) {
    const slice = registersToSlice(registers, quantity.address, quantity.count);
    if (!slice) {
      continue;
    }
    rawById[id] = applyGainAndSplit(
      quantity,
      decodeRegisterValue(quantity.dataType, slice, {
        wordOrder: quantity.wordOrder,
        stringByteOrder: quantity.stringByteOrder
      })
    );
  }
  const points = [];
  for (const [id, quantity] of Object.entries(profile.quantities)) {
    if (!(id in rawById)) {
      continue;
    }
    let value = rawById[id];
    if (((_a = quantity.additionalSources) == null ? void 0 : _a.length) && typeof value === "number") {
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
      unit: quantity.unit && quantity.unit !== "/" ? quantity.unit : void 0,
      internal: Boolean(quantity.internal)
    });
  }
  return points;
}
function productCodeFromSn(sn) {
  return (sn || "").replace(/[\s\0]/g, "").slice(0, 4).toUpperCase();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  applyGainAndSplit,
  applyValueMapping,
  decodeProfilePoints,
  decodeRegisterValue,
  productCodeFromSn,
  registersToSlice
});
//# sourceMappingURL=decode.js.map
