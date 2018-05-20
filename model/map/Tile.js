"use strict";

const MapConst      = require(ROOT_DIR +'model/map/MapConst');
const MapBuild      = require(ROOT_DIR +'model/map/MapBuild');
const MapCastle     = require(ROOT_DIR +'model/map/MapCastle');
const MapCastleWall = require(ROOT_DIR +'model/map/MapCastleWall');


module.exports = Tile;

function Tile(x, y, cfg) {
	this.x = x;
	this.y = y;
	this.cfg = cfg;
	this.pid = 0;
	//
	this.mapBuild = null; // MapBuild, 0=none, 1=castle, 2=fort
	// cx, cy
	//
	this.occupyTime = 0; // 免战倒计时
}

const pro = Tile.prototype;

pro.setPid = function(pid) {
	this.pid = pid;
}

pro.createMapBuild = function(type) {
	switch (type) {
		case MapBuild.TYPE_CASTLE:
			this.mapBuild = new MapCastle();
			break;
		case MapBuild.TYPE_CASTLE_WALL:
			this.mapBuild = new MapCastleWall();
			break;
		case MapBuild.TYPE_FORT:
			break;
	}
}

pro.occupy = function(pid) {
	this.pid = pid;
	this.occupyTime = aux.now();
}

pro.isPeace = function() {
	return aux.now() < this.occupyTime + 3600;
}

pro.getIndex = function() {
	return MapConst.uniqueIndex(this.x, this.y);
}

pro.packLogin = function() {
	let ret = {
		x : this.x,
		y : this.y
	};
	if (this.occupyTime != 0) {
		ret.occupyTime = this.occupyTime;
	}
	if (this.mapBuild != null) {
		ret.mapBuild = this.mapBuild.pack();
	}
	return ret;
}

pro.pack = function() {
	let ret = {
		x : this.x,
		y : this.y,
		pid : this.pid
	};
	if (this.mapBuild != null) {
		ret.mapBuild = this.mapBuild.pack();
	}
	return ret;
}

pro.fromBuffer = function(buffer) {
	// this.x = buffer.readUInt16BE();
	// this.y = buffer.readUInt16BE();
	this.pid = buffer.readUInt32BE();
	let mapBuildType = buffer.readUInt8();
	this.createMapBuild(mapBuildType);
	// this.occupyTime = buffer.readUInt32BE();
}

pro.toBuffer = function(buffer) {
	// buffer.writeInt16BE(this.x);
	// buffer.writeInt16BE(this.y);
	buffer.writeInt32BE(this.pid);
	if (this.mapBuild != null) {
		buffer.writeInt8(this.mapBuild.type);
	}
	else {
		buffer.writeInt8(0);
	}
	// buffer.writeInt32BE(this.occupyTime); // 读取时是unit
}

Tile.packSize = function() {
	return 5; // x=2, y=2, pid=4, *occupyTime=4（维护一小时）
}

