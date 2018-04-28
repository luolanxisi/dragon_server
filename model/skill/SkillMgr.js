"use strict";

const util         = require('util');
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const BucketArray  = require(ROOT_DIR +'lib/collection/BucketArray');
const Skill        = require(ROOT_DIR +'model/skill/Skill');


module.exports = SkillMgr;

function SkillMgr(pid) {
	DbPackEntity.call(this, "tbl_player", {"id":pid}, "skillData");
	this.pid = pid;
	this.pool = new BucketArray();
}

util.inherits(SkillMgr, DbPackEntity);

const pro = SkillMgr.prototype;


pro.add = function(skill) {
	this.pool.add(skill);
	return skill;
}

pro.get = function(id) {
	return this.pool.get(id);
}

pro.remove = function(id) {
	return this.pool.remove(id);
}


// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	// this.add(Skill.createInit(4000101)); // 攻击强化
	// this.add(Skill.createInit(4000101)); // 防御强化
	// this.add(Skill.createInit(4000101)); // 速度强化
	// this.add(Skill.createInit(4000101)); // 冲车
	cb();
}

// save在DbPackEntity中实现

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT skillData FROM tbl_player WHERE id=? LIMIT 1', [this.pid], function (err, res) {
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


