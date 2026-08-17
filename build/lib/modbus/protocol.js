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
var protocol_exports = {};
__export(protocol_exports, {
  FC_READ_HOLDING: () => FC_READ_HOLDING,
  FC_READ_INPUT: () => FC_READ_INPUT,
  FC_WRITE_MULTIPLE: () => FC_WRITE_MULTIPLE,
  FC_WRITE_SINGLE: () => FC_WRITE_SINGLE,
  buildReadRequest: () => buildReadRequest,
  buildWriteRequest: () => buildWriteRequest,
  parseReadResponse: () => parseReadResponse,
  parseWriteResponse: () => parseWriteResponse
});
module.exports = __toCommonJS(protocol_exports);
const FC_READ_HOLDING = 3;
const FC_READ_INPUT = 4;
const FC_WRITE_SINGLE = 6;
const FC_WRITE_MULTIPLE = 16;
function buildMbap(transactionId, unitId, pdu) {
  const mbap = Buffer.alloc(7);
  mbap.writeUInt16BE(transactionId & 65535, 0);
  mbap.writeUInt16BE(0, 2);
  mbap.writeUInt16BE(pdu.length + 1, 4);
  mbap[6] = unitId & 255;
  return Buffer.concat([mbap, pdu]);
}
function buildReadRequest(transactionId, unitId, functionCode, address, count) {
  const pdu = Buffer.alloc(5);
  pdu[0] = functionCode;
  pdu.writeUInt16BE(address & 65535, 1);
  pdu.writeUInt16BE(count & 65535, 3);
  return buildMbap(transactionId, unitId, pdu);
}
function buildWriteRequest(transactionId, unitId, address, values) {
  if (values.length === 1) {
    const pdu2 = Buffer.alloc(5);
    pdu2[0] = FC_WRITE_SINGLE;
    pdu2.writeUInt16BE(address & 65535, 1);
    pdu2.writeUInt16BE(values[0] & 65535, 3);
    return buildMbap(transactionId, unitId, pdu2);
  }
  const pdu = Buffer.alloc(6 + values.length * 2);
  pdu[0] = FC_WRITE_MULTIPLE;
  pdu.writeUInt16BE(address & 65535, 1);
  pdu.writeUInt16BE(values.length & 65535, 3);
  pdu[5] = values.length * 2;
  for (let i = 0; i < values.length; i++) {
    pdu.writeUInt16BE(values[i] & 65535, 6 + i * 2);
  }
  return buildMbap(transactionId, unitId, pdu);
}
function parseHeader(buf, expectedTid, expectedUnit) {
  if (buf.length < 8) {
    throw new Error("Modbus response too short");
  }
  const tid = buf.readUInt16BE(0);
  const protocol = buf.readUInt16BE(2);
  const length = buf.readUInt16BE(4);
  const unit = buf[6];
  const functionCode = buf[7];
  if (tid !== (expectedTid & 65535)) {
    throw new Error(`Modbus transaction mismatch (${tid} != ${expectedTid})`);
  }
  if (protocol !== 0) {
    throw new Error(`Unexpected Modbus protocol ${protocol}`);
  }
  if (unit !== (expectedUnit & 255)) {
    throw new Error(`Modbus unit mismatch (${unit} != ${expectedUnit})`);
  }
  if (buf.length < 6 + length) {
    throw new Error("Modbus response truncated");
  }
  if (functionCode & 128) {
    const code = buf.length > 8 ? buf[8] : 0;
    throw new Error(`Modbus exception ${code} (FC ${functionCode & 127})`);
  }
  return { functionCode };
}
function parseReadResponse(buf, expectedTid, expectedUnit) {
  parseHeader(buf, expectedTid, expectedUnit);
  const byteCount = buf[8];
  const data = buf.subarray(9, 9 + byteCount);
  if (data.length < byteCount || byteCount % 2 !== 0) {
    throw new Error("Invalid Modbus register payload");
  }
  const registers = [];
  for (let i = 0; i < data.length; i += 2) {
    registers.push(data.readUInt16BE(i));
  }
  return registers;
}
function parseWriteResponse(buf, expectedTid, expectedUnit, expectedFc) {
  const { functionCode } = parseHeader(buf, expectedTid, expectedUnit);
  if (functionCode !== expectedFc) {
    throw new Error(`Unexpected Modbus function ${functionCode} (expected ${expectedFc})`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FC_READ_HOLDING,
  FC_READ_INPUT,
  FC_WRITE_MULTIPLE,
  FC_WRITE_SINGLE,
  buildReadRequest,
  buildWriteRequest,
  parseReadResponse,
  parseWriteResponse
});
//# sourceMappingURL=protocol.js.map
