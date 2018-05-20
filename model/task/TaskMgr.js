"use strict";

const util         = require('util');
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const Dict         = require(ROOT_DIR +'lib/collection/Dict');
const Task         = require(ROOT_DIR +'model/task/Task');


module.exports = TaskMgr;

function TaskMgr(pid) {
	DbPackEntity.call(this, "tbl_player", {"id":pid}, "taskData");
	this.pid = pid;
	this.pool = new Dict();
}

util.inherits(TaskMgr, DbPackEntity);

const pro = TaskMgr.prototype;


pro.add = function(cfgId) {
}

pro.get = function(id) {
}

pro.remove = function(id) {
}


// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	// 初始任务
	cb();
}

// save在DbPackEntity中实现

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT taskData FROM tbl_player WHERE id=? LIMIT 1', [this.pid], function (err, res) {
		if (err) {
			return cb(err);
		}
		if (res.length <= 0) {
			return cb();
		}
		cb();
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


