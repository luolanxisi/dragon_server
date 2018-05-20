"use strict";

// const LandCfg = require(ROOT_DIR +'data/LandCfg.json');
const MapData  = require(ROOT_DIR +'model/map/MapData').getInst();


module.exports.createLoad = function(data) {
	let land = new Land(data);
	return land;
}


function Land(data) {
	this.x = data.x;
	this.y = data.y;
	this.cfg = MapData.getCfg(this.x, this.y);
	//
	if (data.occupyTime != null) {
		this.occupyTime = data.occupyTime;
	}
	if (data.mapBuild != null) {
		this.mapBuild = data.mapBuild;
	}
}

const pro = Land.prototype;


pro.getWoodProduce = function() {
	return this.cfg.wood || 0;
}

pro.getStoneProduce = function() {
	return this.cfg.stone || 0;
}

pro.getIronProduce = function() {
	return this.cfg.iron || 0;
}

pro.getFoodProduce = function() {
	return this.cfg.food || 0;
}

pro.init = function(cfgId) {
	return {};
}

pro.pack = function() {
	let ret = {
		x : this.x,
		y : this.y
	};
	if (this.occupyTime != null) {
		ret.occupyTime = this.occupyTime;
	}
	if (this.mapBuild != null) {
		ret.mapBuild = this.mapBuild;
	}
	return ret;
}

pro.toData = function() {
	return {};
}

