"use strict";

const util         = require('util');
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const Dict         = require(ROOT_DIR +'lib/collection/Dict');
const Land         = require(ROOT_DIR +'model/land/Land');


module.exports = LandMgr;

function LandMgr(pid) {
	DbPackEntity.call(this, "tbl_player", {"id":pid}, "landData");
	this.pid = pid;
	this.pool = new Dict();
}

util.inherits(LandMgr, DbPackEntity);

const pro = LandMgr.prototype;


pro.add = function(cfgId) {
	// if (this.pool.has(cfgId)) {
	// 	return;
	// }
	// let robot = Robot.createInit(cfgId);
	// this.pool.add(robot.getId(), robot);
	// return robot;
}

pro.get = function(id) {
	// return this.pool.get(cfgId);
}

pro.remove = function(id) {
}


// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	// 主城城区
	cb();
}

// save在DbPackEntity中实现

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT landData FROM tbl_player WHERE id=? LIMIT 1', [this.pid], function (err, res) {
		if (err) {
			return cb(err);
		}
		if (res.length <= 0) {
			return cb();
		}
		cb();
	});
}

pro.afterLoad = function(cb) {
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
	// let elements = this.pool.getRaw();
	// let arr = [];
	// for (let i in elements) {
	// 	let element = elements[i];
	// 	arr.push(element.pack());
	// }
	// let ret = {
	// 	curRobotId : this.curRobot != null ? this.curRobot.getId() : 0,
	// 	elements   : arr,
	// 	warList    : this.warList
	// };
	// return ret;
}

pro.toData = function() {
	// let elements = this.pool.getRaw();
	// let arr = [];
	// for (let i in elements) {
	// 	let element = elements[i];
	// 	arr.push(element.toData());
	// }
	// let ret = {
	// 	curRobotId : this.curRobot != null ? this.curRobot.getId() : 0,
	// 	elements   : arr,
	// 	warList    : this.warList
	// };
	// return ret;
}


