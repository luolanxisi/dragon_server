"use strict";

const fs = require('fs');
const LandCfg  = require(ROOT_DIR +'data/LandCfg.json');
const MapConst = require(ROOT_DIR +'model/map/MapConst');


const inst = new MapData();

module.exports.getInst = function() {
	let srvType = ServerMgr.getCurrentServer().type;
	if ( srvType != "player" && srvType != "map" ) {
		aux.log("Error: Use map data not in [player] or [map] process !!");
		return;
	}
	return inst;
};

module.exports.initSync = function() {
	let buffer = fs.readFileSync(ROOT_DIR +'data/MapData.txt');
	inst.buffer = buffer;
};



function MapData() {
	this.buffer = null;
}

const pro = MapData.prototype;


pro.getCfg = function(x, y) {
	let index = MapConst.uniqueIndex(x, y);
	let cfgId = this.buffer.readInt8(index);
	return LandCfg[cfgId];
}

