"use strict";

const HeroCfg      = require(ROOT_DIR +'data/HeroCfg.json');
const HeroLevelCfg = require(ROOT_DIR +'data/HeroLevelCfg.json');


const MAX_LEVEL = 50;


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
	this.woundArmy = 0; // 受伤士兵
	this.stamina = 100; // 体力（需要时间戳）
	this.grade   = 0; // 阶级
	this.points  = new Array(0,0,0,0,0); // 配点
	this.skills  = new Array({cfgId:0, level:0}, {cfgId:0, level:0}, {cfgId:0, level:0});
	this.cfg     = null;
	//
	this.phyAtt = 0;
	this.phyDef = 0;
	this.magAtt = 0;
	this.magDef = 0;
	this.speed  = 0;
}

const pro = Hero.prototype;

pro.cloneBattleData = function() {
	let ret = {
		id     : this.id,
		cfgId  : this.cfg.id,
		army   : this.army,
		range  : this.getRange(),
		phyAtt : this.phyAtt,
		phyDef : this.phyDef,
		magAtt : this.magAtt,
		magDef : this.magDef,
		speed  : this.speed
	};
	return ret;
}

pro.getId = function() {
	return this.id;
}

pro.getCfgId = function() {
	return this.cfg.id;
}

pro.getSpeed = function() {
	return this.speed;
}

pro.getRange = function() {
	return this.cfg.range;
}

pro.setArmy = function(value) {
	this.army = value || 0;
}

pro.getArmy = function() {
	return this.army;
}

pro.setWoundArmy = function(value) {
	this.woundArmy = value || 0;
}

pro.cureArmy = function() {
	this.army += this.woundArmy;
	if (this.army < 100) {
		this.army = 100;
	}
}

pro.plusExp = function(value) {
	if (this.level >= MAX_LEVEL) {
		return;
	}
	this.exp += value || 0;
	let upNeedExp = HeroLevelCfg[this.level];
	//
	while (this.exp >= upNeedExp) {
		this.level++;
		if (this.level == MAX_LEVEL) {
			this.exp = upNeedExp;
			break;
		}
		else {
			this.exp -= upNeedExp;
			upNeedExp = HeroLevelCfg[this.level];
		}
	}
}

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
	let skillData = this.skills[0];
	skillData.cfgId = cfg.baseSkill;
	skillData.level = 1;
}

pro.load = function(data) {
	let level = data.level;
	let cfg = HeroCfg[data.cfgId];
	this.cfg = cfg;
	//
	this.id     = data.id;
	this.level  = level;
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
	this.points  = data.points;
	this.skills = data.skills;
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

