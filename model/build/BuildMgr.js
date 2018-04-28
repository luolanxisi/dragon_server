"use strict";

const util         = require('util');
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const Dict         = require(ROOT_DIR +'lib/collection/Dict');
const Build        = require(ROOT_DIR +'model/build/Build');


module.exports = BuildMgr;

function BuildMgr(pid) {
	// DbPackEntity.call(this, "tbl_player", {"id":"pid"}, "buildData");
	// this.pool = new Dict();
}

// util.inherits(BuildMgr, DbPackEntity);

const pro = BuildMgr.prototype;


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
	// let arr = [10001]; // , 10002, 10003
	// for (let i in arr) {
	// 	let cfgId = arr[i];
	// 	let robot = this.add(cfgId);
	// 	if (i == 0) {
	// 		this.curRobot = robot;
	// 	}
	// }
	cb();
}

// save在DbPackEntity中实现

pro.load = function(cb) {
	// let self = this;
	// MysqlExtend.query('SELECT robotData FROM tbl_role WHERE id=? LIMIT 1', [this.roleId], function (err, res) {
	// 	if (err) {
	// 		return cb(err);
	// 	}
	// 	let obj = JSON.parse(res[0].robotData);
	// 	self.setCurRobot(obj.curRobotId);
	// 	self.warList = obj.warList || [];
	// 	for (let i in obj.elements) {
	// 		let robotData = obj.elements[i];
	// 		let robot = Robot.createLoad(robotData);
	// 		self.pool.add(robot.getId(), robot);
	// 	}
	// 	cb();
	// });
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


