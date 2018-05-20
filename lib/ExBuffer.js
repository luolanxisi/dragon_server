"use strict";


exports.create = function(size) {
	let buffer = new ExBuffer();
	buffer.init(size);
	return buffer;
}

exports.decorate = function(nodejsBuffer) {
	let buffer = new ExBuffer();
	buffer.load(nodejsBuffer);
	return buffer;
}

function ExBuffer() {
	this.cursor = 0;
	this.buf = null;
	this.cursor = 0;
	this.length = 0; // 实际长度
}

const pro = ExBuffer.prototype;

pro.init = function(size) {
	this.buf = Buffer.allocUnsafe(size);
	this.length = 0;
}

pro.load = function(nodejsBuffer) {
	this.buf = nodejsBuffer;
	this.length = nodejsBuffer.length;
}

pro.readDoubleBE = function() {
	let value = this.buf.readDoubleBE(this.cursor);
	this.cursor += 8;
	return value;
}

pro.readDoubleLE = function() {
	let value = this.buf.readDoubleLE(this.cursor);
	this.cursor += 8;
	return value;
}

pro.readFloatBE = function() {
	let value = this.buf.readFloatBE(this.cursor);
	this.cursor += 4;
	return value;
}

pro.readFloatLE = function() {
	let value = this.buf.readFloatLE(this.cursor);
	this.cursor += 4;
	return value;
}

pro.readInt8 = function() {
	let value = this.buf.readInt8(this.cursor);
	this.cursor += 1;
	return value;
}

pro.readInt16BE = function() {
	let value = this.buf.readInt16BE(this.cursor);
	this.cursor += 2;
	return value;
}

pro.readInt16LE = function() {
	let value = this.buf.readInt16LE(this.cursor);
	this.cursor += 2;
	return value;
}

pro.readInt32BE = function() {
	let value = this.buf.readInt32BE(this.cursor);
	this.cursor += 4;
	return value;
}

pro.readInt32LE = function() {
	let value = this.buf.readInt32LE(this.cursor);
	this.cursor += 4;
	return value;
}

pro.readUInt8 = function() {
	let value = this.buf.readUInt8(this.cursor);
	this.cursor += 1;
	return value;
}

pro.readUInt16BE = function() {
	let value = this.buf.readUInt16BE(this.cursor);
	this.cursor += 2;
	return value;
}

pro.readUInt16LE = function() {
	let value = this.buf.readUInt16LE(this.cursor);
	this.cursor += 2;
	return value;
}

pro.readUInt32BE = function() {
	let value = this.buf.readUInt32BE(this.cursor);
	this.cursor += 4;
	return value;
}

pro.readUInt32LE = function() {
	let value = this.buf.readUInt32LE(this.cursor);
	this.cursor += 4;
	return value;
}

pro.writeDoubleBE = function(value) {
	this.buf.writeDoubleBE(value, this.cursor);
	this.cursor += 8;
	this.length += 8;
}

pro.writeDoubleLE = function(value) {
	this.buf.writeDoubleLE(value, this.cursor);
	this.cursor += 8;
	this.length += 8;
}

pro.writeFloatBE = function(value) {
	this.buf.writeFloatBE(value, this.cursor);
	this.cursor += 4;
	this.length += 4;
}

pro.writeFloatLE = function(value) {
	this.buf.writeFloatLE(value, this.cursor);
	this.cursor += 4;
	this.length += 4;
}

pro.writeInt8 = function(value) {
	this.buf.writeInt8(value, this.cursor);
	this.cursor += 1;
	this.length += 1;
}

pro.writeInt16BE = function(value) {
	this.buf.writeInt16BE(value, this.cursor);
	this.cursor += 2;
	this.length += 2;
}

pro.writeInt16LE = function(value) {
	this.buf.writeInt16LE(value, this.cursor);
	this.cursor += 2;
	this.length += 2;
}

pro.writeInt32BE = function(value) {
	this.buf.writeInt32BE(value, this.cursor);
	this.cursor += 4;
	this.length += 4;
}

pro.writeInt32LE = function(value) {
	this.buf.writeInt32LE(value, this.cursor);
	this.cursor += 4;
	this.length += 4;
}

pro.writeUInt8 = function(value) {
	this.buf.writeUInt8(value, this.cursor);
	this.cursor += 1;
	this.length += 1;
}

pro.writeUInt16BE = function(value) {
	this.buf.writeUInt16BE(value, this.cursor);
	this.cursor += 2;
	this.length += 2;
}

pro.writeUInt16LE = function(value) {
	this.buf.writeUInt16LE(value, this.cursor);
	this.cursor += 2;
	this.length += 2;
}

pro.writeUInt32BE = function(value) {
	this.buf.writeUInt32BE(value, this.cursor);
	this.cursor += 4;
	this.length += 4;
}

pro.writeUInt32LE = function(value) {
	this.buf.writeUInt32LE(value, this.cursor);
	this.cursor += 4;
	this.length += 4;
}

pro.sliceRawBuffer = function() {
	this.buf.writeUInt16BE(this.length, 0);
	return this.buf.slice(0, this.length);
}

pro.flip = function() {
	this.buf.slice(0, this.length);
}

pro.reset = function() {
	this.cursor = 0;
}

pro.getCursor = function() {
	return this.cursor;
}

// 注意，该接口并没有将buf长度反填，注意结合flip使用
pro.getRawBuffer = function() {
	return this.buf;
}

pro.getLength = function() {
	return this.length;
}

pro.writeBuffer = function(sourceBuf, sourceStart, sourceEnd) {
	let ret = sourceBuf.getRawBuffer().copy(this.buf, this.cursor, sourceStart, sourceEnd);
	this.cursor += ret;
	this.length += ret;
	return ret;
}

pro.writeString = function(str) {
	let ret = this.buf.write(str, this.cursor);
	this.cursor += ret;
	this.length += ret;
	return ret;
}

pro.readString = function(size) {
	let value = this.buf.toString('utf8', this.cursor, this.cursor+size);
	this.cursor += size;
	return value;
}

