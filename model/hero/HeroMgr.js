"use strict";

const util         = require('util');
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const BucketArray  = require(ROOT_DIR +'lib/collection/BucketArray');
const Hero         = require(ROOT_DIR +'model/hero/Hero');
const HeroCfg      = require(ROOT_DIR +'data/HeroCfg.json');


module.exports = HeroMgr;

function HeroMgr(pid) {
	DbPackEntity.call(this, "tbl_player", {"id":pid}, "heroData");
	this.pid = pid;
	this.pool = new BucketArray();
}

util.inherits(HeroMgr, DbPackEntity);

const pro = HeroMgr.prototype;


pro.add = function(hero) {
	this.pool.add(hero);
	return hero;
}

pro.addByCfgId = function(cfgId, level) {
	this.add(Hero.createInit(cfgId, level));
}

pro.get = function(id) {
	return this.pool.get(id);
}

pro.remove = function(id) {
	return this.pool.remove(id);
}

// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	this.add(Hero.createInit(1401, 1));
	this.add(Hero.createInit(4401, 1));
	cb();
}

// save在DbPackEntity中实现

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT heroData FROM tbl_player WHERE id=? LIMIT 1', [this.pid], function (err, res) {
		if (err) {
			return cb(err);
		}
		if (res.length <= 0) {
			return cb();
		}
	// 	let obj = JSON.parse(res[0].heroData);
	// 	for (let i in obj.heroes) {
	// 		let heroData = obj.heroes[i];
	// 		let hero = Hero.createLoad(heroData);
	// 		self.pool.add(hero.getId(), hero);
	// 	}
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
	let arr = [];
	this.pool.each(function(hero) {
		arr.push(hero.pack());
	});
	let ret = {
		heroes : arr
	};
	return ret;
}

pro.toData = function() {
	let arr = [];
	this.pool.each(function(hero) {
		arr.push(hero.pack());
	});
	let ret = {
		heroes : arr
	};
	return ret;
}


