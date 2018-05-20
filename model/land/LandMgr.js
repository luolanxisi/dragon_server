"use strict";

const util         = require('util');
// const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const Dict         = require(ROOT_DIR +'lib/collection/Dict');
const Land         = require(ROOT_DIR +'model/land/Land');
const MapConst     = require(ROOT_DIR +'model/map/MapConst');
const MapData      = require(ROOT_DIR +'model/map/MapData').getInst();


module.exports = LandMgr;

function LandMgr(pid) {
	// DbPackEntity.call(this, "tbl_player", {"id":pid}, "landData");
	this.pid = pid;
	this.pool = [];
}

// util.inherits(LandMgr, DbPackEntity);

const pro = LandMgr.prototype;


pro.add = function(land) {
	this.pool.push(land);
}

pro.countWoodProduce = function() {
	let count = 0;
	for (let i in this.pool) {
		let land = this.pool[i];
		count += land.getWoodProduce();
	}
	return count;
}

pro.countStoneProduce = function() {
	let count = 0;
	for (let i in this.pool) {
		let land = this.pool[i];
		count += land.getStoneProduce();
	}
	return count;
}

pro.countIronProduce = function() {
	let count = 0;
	for (let i in this.pool) {
		let land = this.pool[i];
		count += land.getIronProduce();
	}
	return count;
}

pro.countFoodProduce = function() {
	let count = 0;
	for (let i in this.pool) {
		let land = this.pool[i];
		count += land.getFoodProduce();
	}
	return count;
}

// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	cb();
}

// save在DbPackEntity中实现
pro.load = function(cb) {
	cb();
}

pro.afterAllLoad = function(cb) {
	let self = this;
	App.callRemote("map.MapRemote.fetchPlayerTile", this.pid, { pid : this.pid }, function(err, res) {
		if ( err ) {
			return cb(err);
		}
		let tileList = res.tileList;
		for (let i in tileList) {
			let data = tileList[i];
			let land = Land.createLoad(data);
			self.add(land);
		}
		cb();
	});
}

pro.online = function(cb) {
	cb();
}

pro.offline = function(cb) {
	cb();
}

pro.destory = function(cb) {
	cb();
}

pro.pack = function() {
	let arr = [];
	for (let i in this.pool) {
		let land = this.pool[i];
		arr.push(land.pack());
	}
	//
	let ret = {
		lands : arr
	};
	return ret;
}

pro.save = function(cb) {
	cb();
}


