/** Modbus TCP PDU helpers (FC03 holding, FC04 input, FC06/FC16 write). */

export const FC_READ_HOLDING = 0x03;
export const FC_READ_INPUT = 0x04;
export const FC_WRITE_SINGLE = 0x06;
export const FC_WRITE_MULTIPLE = 0x10;

function buildMbap(transactionId: number, unitId: number, pdu: Buffer): Buffer {
	const mbap = Buffer.alloc(7);
	mbap.writeUInt16BE(transactionId & 0xffff, 0);
	mbap.writeUInt16BE(0, 2);
	mbap.writeUInt16BE(pdu.length + 1, 4);
	mbap[6] = unitId & 0xff;
	return Buffer.concat([mbap, pdu]);
}

export function buildReadRequest(
	transactionId: number,
	unitId: number,
	functionCode: number,
	address: number,
	count: number,
): Buffer {
	const pdu = Buffer.alloc(5);
	pdu[0] = functionCode;
	pdu.writeUInt16BE(address & 0xffff, 1);
	pdu.writeUInt16BE(count & 0xffff, 3);
	return buildMbap(transactionId, unitId, pdu);
}

export function buildWriteRequest(transactionId: number, unitId: number, address: number, values: number[]): Buffer {
	if (values.length === 1) {
		const pdu = Buffer.alloc(5);
		pdu[0] = FC_WRITE_SINGLE;
		pdu.writeUInt16BE(address & 0xffff, 1);
		pdu.writeUInt16BE(values[0] & 0xffff, 3);
		return buildMbap(transactionId, unitId, pdu);
	}
	const pdu = Buffer.alloc(6 + values.length * 2);
	pdu[0] = FC_WRITE_MULTIPLE;
	pdu.writeUInt16BE(address & 0xffff, 1);
	pdu.writeUInt16BE(values.length & 0xffff, 3);
	pdu[5] = values.length * 2;
	for (let i = 0; i < values.length; i++) {
		pdu.writeUInt16BE(values[i] & 0xffff, 6 + i * 2);
	}
	return buildMbap(transactionId, unitId, pdu);
}

function parseHeader(buf: Buffer, expectedTid: number, expectedUnit: number): { functionCode: number } {
	if (buf.length < 8) {
		throw new Error("Modbus response too short");
	}
	const tid = buf.readUInt16BE(0);
	const protocol = buf.readUInt16BE(2);
	const length = buf.readUInt16BE(4);
	const unit = buf[6];
	const functionCode = buf[7];
	if (tid !== (expectedTid & 0xffff)) {
		throw new Error(`Modbus transaction mismatch (${tid} != ${expectedTid})`);
	}
	if (protocol !== 0) {
		throw new Error(`Unexpected Modbus protocol ${protocol}`);
	}
	if (unit !== (expectedUnit & 0xff)) {
		throw new Error(`Modbus unit mismatch (${unit} != ${expectedUnit})`);
	}
	if (buf.length < 6 + length) {
		throw new Error("Modbus response truncated");
	}
	if (functionCode & 0x80) {
		const code = buf.length > 8 ? buf[8] : 0;
		throw new Error(`Modbus exception ${code} (FC ${functionCode & 0x7f})`);
	}
	return { functionCode };
}

export function parseReadResponse(buf: Buffer, expectedTid: number, expectedUnit: number): number[] {
	parseHeader(buf, expectedTid, expectedUnit);
	const byteCount = buf[8];
	const data = buf.subarray(9, 9 + byteCount);
	if (data.length < byteCount || byteCount % 2 !== 0) {
		throw new Error("Invalid Modbus register payload");
	}
	const registers: number[] = [];
	for (let i = 0; i < data.length; i += 2) {
		registers.push(data.readUInt16BE(i));
	}
	return registers;
}

export function parseWriteResponse(buf: Buffer, expectedTid: number, expectedUnit: number, expectedFc: number): void {
	const { functionCode } = parseHeader(buf, expectedTid, expectedUnit);
	if (functionCode !== expectedFc) {
		throw new Error(`Unexpected Modbus function ${functionCode} (expected ${expectedFc})`);
	}
}
