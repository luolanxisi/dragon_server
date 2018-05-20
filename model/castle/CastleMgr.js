"use strict";

const util         = require('util');
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const BucketArray  = require(ROOT_DIR +'lib/collection/BucketArray');
const Castle       = require(ROOT_DIR +'model/castle/Castle');


module.exports = CastleMgr;

function CastleMgr(pid) {
	DbPackEntity.call(this, "tbl_player", {"id":pid}, "castleData");
	this.pid = pid;
	this.pool = new BucketArray();
}

util.inherits(CastleMgr, DbPackEntity);

const pro = CastleMgr.prototype;


pro.add = function(castle) {
	this.pool.add(castle);
	return castle;
}

pro.get = function(id) {
	return this.pool.get(id);
}

pro.getCapital = function() {
	return this.pool.get(1);
}

pro.remove = function(id) {
	return this.pool.remove(id);
}

pro.findTeam = function(teamId) {
	let team = this.pool.eachBreak(function(castle) {
		if (castle.getTeam(teamId) != null) {
			return castle.getTeam(teamId);
		}
	});
	return team;
}

// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	// 主城初始出生地，需要符合某些原则
	let castle = this.add(Castle.createInit(aux.randomRange(0, 1500), aux.randomRange(0, 1500)));
	App.callRemote("map.MapRemote.birth", null, {pid:this.pid, x:castle.getX(), y:castle.getY()}, function(err, res) {
		if (err) {
			return cb(err);
		}
		cb();
	});
}

// save在DbPackEntity中实现
pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT castleData FROM tbl_player WHERE id=? LIMIT 1', [this.pid], function (err, res) {
		if (err) {
			return cb(err);
		}
		if (res.length <= 0) {
			return cb();
		}
		let castleData = JSON.parse(res[0].castleData);
		if (castleData == null) { // register
			self.register(cb);
		}
		else {
			let castleList = castleData.castles;
			for (let i in castleList) {
				let data = castleList[i];
				let castle = Castle.createLoad(data);
				self.pool.resume(castle);
			}
			cb();
		}
	});
}

pro.afterAllLoad = function(cb) {
	cb();
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
	this.pool.each(function(castle) {
		arr.push(castle.pack());
	});
	let ret = {
		castles : arr
	};
	return ret;
}

pro.toData = function() {
	return this.pack();
}


