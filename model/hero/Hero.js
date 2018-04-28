"use strict";

const HeroCfg = require(ROOT_DIR +'data/HeroCfg.json');


module.exports.createInit = function(cfgId, level) {
	let cfg = HeroCfg[cfgId];
	let hero = new Hero();
	hero.init(cfg, level);
	return hero;
}

module.exports.createLoad = function(data) {
	let hero = new Hero();
	hero.load(data);
	return hero;
}


function Hero() {
	this.id      = 0; // 加入容器后反填
	this.level   = 1;
	this.exp     = 0;
	this.army    = 100; // 兵力（需计算离线招兵时间）
	this.stamina = 100; // 体力（需要时间戳）
	this.grade   = 0; // 阶级
	this.points  = new Array(0,0,0,0,0); // 配点
	this.skills  = new Array(null, null, null);
	this.cfg     = null;
	//
	this.phyAtt = 0;
	this.phyDef = 0;
	this.magAtt = 0;
	this.magDef = 0;
	this.speed  = 0;
}

const pro = Hero.prototype;


pro.hasSkill = function(cfgId) {
}

pro.addSkill = function(cfgId) {
}

pro.removeSkill = function(cfgId) {
}

pro.upgradeSkill = function(cfgId) {
}

pro.init = function(cfg, level) {
	this.cfg = cfg;
	//
	this.level = level;
	this.phyAtt = cfg.phyAtt + (level-1)*cfg.phyAttUp;
	this.phyDef = cfg.phyDef + (level-1)*cfg.phyDefUp;
	this.magAtt = cfg.magAtt + (level-1)*cfg.magAttUp;
	this.magDef = cfg.magDef + (level-1)*cfg.magDefUp;
	this.speed  = cfg.speed  + (level-1)*cfg.speedUp;
	// 初始化第一个技能
}

pro.load = function(data) {
	let cfg = HeroCfg[data.cfgId];
	this.cfg = cfg;
	//
	this.id = data.id;
	this.level = level;
	this.phyAtt = cfg.phyAtt + (level-1)*cfg.phyAttUp;
	this.phyDef = cfg.phyDef + (level-1)*cfg.phyDefUp;
	this.magAtt = cfg.magAtt + (level-1)*cfg.magAttUp;
	this.magDef = cfg.magDef + (level-1)*cfg.magDefUp;
	this.speed  = cfg.speed  + (level-1)*cfg.speedUp;
	//
	this.exp     = data.exp;
	this.army    = data.army;
	this.stamina = data.stamina;
	this.grade   = data.grade;
	// points, skills
}

pro.pack = function() {
	let ret = {
		id      : this.id,
		cfgId   : this.cfg.id,
		level   : this.level,
		exp     : this.exp,
		army    : this.army,
		stamina : this.stamina,
		grade   : this.grade,
		points  : this.points,
		skills  : this.skills
	};
	return ret;
}

pro.toData = function() {
	let ret = {
		id      : this.id,
		cfgId   : this.cfg.id,
		level   : this.level,
		exp     : this.exp,
		army    : this.army,
		stamina : this.stamina,
		grade   : this.grade,
		points  : this.points,
		skills  : this.skills
	};
	return ret;
}

