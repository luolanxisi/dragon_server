"use strict";

const Dict = require(ROOT_DIR +'lib/collection/Dict');
const LandMgr   = require(ROOT_DIR +'model/land/LandMgr');
const HeroMgr   = require(ROOT_DIR +'model/hero/HeroMgr');
const SkillMgr  = require(ROOT_DIR +'model/skill/SkillMgr');
const CastleMgr = require(ROOT_DIR +'model/castle/CastleMgr');
const TaskMgr   = require(ROOT_DIR +'model/task/TaskMgr');

const LAND_MGR = 0; // 领土
const HERO_MGR = 1; // 英雄
const SKILL_MGR = 2; // 技能
const CASTLE_MGR = 3; // 城池
const TASK_MGR = 4; // 任务

const RES_ADD_INV = 60; // 资源1分钟加一次

module.exports = Player;

function Player(id) {
	this.id = id;
	this.name = null;
	this.gold = 0;
	this.gem = 0;
	//
	this.wood  = 100; // 当前拥有木材
	this.stone = 100; // 石料
	this.iron  = 100; // 铁矿
	this.food  = 100; // 粮草
	//
	this.woodProduce  = 1000; // 根据建筑与地块计算总产量
	this.stoneProduce = 1000;
	this.ironProduce  = 1000;
	this.foodProduce  = 1000;
	this.lastHarvest = 0; // 使用资源、登录时计算
	//
	this.storeMax = 20000; // 根据仓库计算容量
	//
	this.repute = 0; // 当前声望
	this.reputeMax = 15000; // 声望上限，根据建筑算出
	//
	this.leagueId = 0;
	this.leagueName = null; // 登录读取
	//
	this.skillExp = 200;
	//
	this.mgrDict = [];
	this.mgrDict.push({class:LandMgr,   obj:null, waitQueue:[]});
	this.mgrDict.push({class:HeroMgr,   obj:null, waitQueue:[]});
	this.mgrDict.push({class:SkillMgr,  obj:null, waitQueue:[]});
	this.mgrDict.push({class:CastleMgr, obj:null, waitQueue:[]});
	// this.mgrDict.push({class:TaskMgr,   obj:null, waitQueue:[]});
	//
	// this.online = false;
	this.stampLastUse();
}

const pro = Player.prototype;

pro.getId = function() {
	return this.id;
}

pro.getName = function() {
	return this.name;
}

pro.setGold = function(value) {
	this.gold = value || 0;
}

pro.setGem = function(value) {
	this.gem = value || 0;
}

pro.addGem = function(value) {
	value = value || 0;
	this.gem += value;
}

pro.minusGem = function(value) {
	value = value || 0;
	if (this.gem < value) {
		return false;
	}
	else {
		this.gem -= value;
		return true;
	}
}

pro.getGem = function() {
	return this.gem;
}

pro.addGold = function(value) {
	value = value || 0;
	this.gold += value;
}

pro.minusGold = function(value) {
	value = value || 0;
	if (this.gold < value) {
		return false;
	}
	else {
		this.gold -= value;
		return true;
	}
}

pro.getGold = function() {
	return this.gold;
}


pro.getLandMgr = function(cb) {
	this.getMgr(LAND_MGR, cb);
}

pro.getHeroMgr = function(cb) {
	this.getMgr(HERO_MGR, cb);
}

pro.getSkillMgr = function(cb) {
	this.getMgr(SKILL_MGR, cb);
}

pro.getCastleMgr = function(cb) {
	this.getMgr(CASTLE_MGR, cb);
}

pro.getTaskMgr = function(cb) {
	this.getMgr(TASK_MGR, cb);
}


pro.getMgr = function(key, cb) {
	let mgr = this.mgrDict[key];
	if ( mgr.obj === null ) {
		mgr.waitQueue.push(cb);
		if ( mgr.waitQueue.length > 1 ) {
			return;
		}
		let obj = new mgr.class(this.id);
		let waitQueue = mgr.waitQueue;
		obj.load(function(err, res) {
			if (err) {
				aux.log(err);
				mgr.waitQueue = [];
				return Auxiliary.cbAll(waitQueue, [err]);
			}
			mgr.waitQueue = [];
			mgr.obj = obj;
			Auxiliary.cbAll(waitQueue, [null, mgr.obj]);
		});
	}
	else {
		cb(null, mgr.obj);
	}
}


// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	let self = this;
	//
	aux.parallelEach(this.mgrDict, function(item, nextCb, key) {
		self.getMgr(key, function(err, mgr) {
			nextCb(err);
		});
	}, function(err) {
		if (err) {
			aux.log("load mgr error", err);
		}
		cb();
	});
}

pro.save = function(cb) {
	let mgrSaveList = [];
	for ( let key in this.mgrDict ) {
		if (this.mgrDict[key].obj != null) {
			mgrSaveList.push(this.mgrDict[key].obj);
		}
	}
	//
	let self = this;
	let total = mgrSaveList.length + 1;
	let count = 0;
	//
	MysqlExtend.query('UPDATE tbl_player SET name=?, gold=?, gem=?, wood=?, stone=?, iron=?, food=?, lastHarvest=?, repute=?, skillExp=?, leagueId=?, lastLogin=? WHERE id=?', [
		this.name, this.gold, this.gem, this.wood, this.stone, this.iron, this.food, this.lastHarvest, this.repute, this.skillExp, this.leagueId, this.lastLogin, this.id], function (err, res) {
		if (err) {
			console.error(err);
		}
		++count;
		if (count >= total) {
			cb(null, self);
		}
	});
	//
	for (let i in mgrSaveList) {
		let mgr = mgrSaveList[i];
		mgr.save(function(err, res) {
			if (err) {
				console.error(err);
			}
			++count;
			if (count >= total) {
				cb(null, self);
			}
		});
	}
}

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT name, gold, gem, wood, stone, iron, food, lastHarvest, repute, skillExp, leagueId, regTime, lastLogin FROM tbl_player WHERE id=? LIMIT 1', [this.id], function (err, res) {
		if (err) {
			return cb(err);
		}
		if ( res.length <= 0 ) {
			return cb(aux.createError(0, "No player record!"));
		}
		//
		let row       = res[0];
		self.name     = row.name;
		self.gold     = row.gold || 0;
		self.gem      = row.gem || 0;
		self.wood     = row.wood || 0;
		self.stone    = row.stone || 0;
		self.iron     = row.iron || 0;
		self.food     = row.food || 0;
		self.repute   = row.repute || 0;
		self.skillExp = row.skillExp || 0;
		self.leagueId = row.leagueId || 0;
		self.lastHarvest = row.lastHarvest || aux.now();
		// 需要计算离线收入
		self.regTime   = row.regTime || 0;
		self.lastLogin = row.lastLogin || 0;
		//
		if (self.regTime == self.lastLogin) {
			self.register(function(err, res) {
				if ( err ) {
					return cb(err);
				}
				self.afterAllLoad(cb);
			});
		}
		else {
			//
			self.getLandMgr(function(err, landMgr) {
				if ( err ) {
					return cb(err);
				}
				self.getCastleMgr(function(err, castleMgr) {
					if ( err ) {
						return cb(err);
					}
					self.afterAllLoad(cb);
				});
			});
		}
	});
}

// 
pro.afterAllLoad = function(cb) {
	let self = this;
	//
	aux.parallelEach(this.mgrDict, function(item, nextCb) {
		if (item.obj == null) {
			return nextCb();
		}
		item.obj.afterAllLoad(function(err) {
			nextCb(err);
		});
	}, function(err) {
		if (err) {
			aux.log("after all load error", err);
		}
		self.loadLastProc(cb);
	});
}

pro.loadLastProc = function(cb) {
	let self = this;
	this.lastLogin = aux.now();
	this.getLandMgr(function(err, landMgr) {
		if ( err ) {
			return cb(err);
		}
		self.woodProduce  = landMgr.countWoodProduce(); // 根据建筑与地块计算总产量
		self.stoneProduce = landMgr.countStoneProduce();
		self.ironProduce  = landMgr.countIronProduce();
		self.foodProduce  = landMgr.countFoodProduce();
		//
		let now = aux.now();
		let diffSec = now - self.lastHarvest;
		let leftSec = diffSec % RES_ADD_INV; // 不够1分钟部分
		let minTimes = Math.floor(diffSec / RES_ADD_INV);
		self.wood  = Math.min(self.wood + self.woodProduce * minTimes, self.storeMax);
		self.stone = Math.min(self.stone + self.stoneProduce * minTimes, self.storeMax);
		self.iron  = Math.min(self.iron + self.ironProduce * minTimes, self.storeMax);
		self.food  = Math.min(self.food + self.foodProduce * minTimes, self.storeMax);
		//
		self.lastHarvest = now - leftSec;
		cb(null, self);
	});
}

pro.setOnline = function(cb) {
	this.online = true;
	cb();
}

// pro.setOffline = function(cb) {
// 	this.online = false;
// 	App.callRemote("pvp.PvpRemote.quit", this.id, {roleId:this.id}, Auxiliary.normalCb);
// 	cb();
// }

pro.destory = function(cb) {
	cb();
}

pro.packLogin = function(cb) {
	let self = this;
	let ret = {
		id     : this.id,
		name   : this.name,
		gold   : this.gold,
		gem    : this.gem,
		wood   : this.wood,
		stone  : this.stone,
		iron   : this.iron,
		food   : this.food,
		woodProduce  : this.woodProduce,
		stoneProduce : this.stoneProduce,
		ironProduce  : this.ironProduce,
		foodProduce  : this.foodProduce,
		storeMax     : this.storeMax,
		repute       : this.repute,
		reputeMax    : this.reputeMax,
		skillExp     : this.skillExp,
		leagueId     : this.leagueId
	};
	self.getHeroMgr(function(err, heroMgr) {
		if ( err ) {
			return cb(err);
		}
		ret['heroData'] = heroMgr.pack();
		//
		self.getCastleMgr(function(err, castleMgr) {
			if ( err ) {
				return cb(err);
			}
			ret['castleData'] = castleMgr.pack();
			//
			self.getLandMgr(function(err, landMgr) {
				if ( err ) {
					return cb(err);
				}
				ret['landData'] = landMgr.pack();
				//
				cb(null, ret);
			});
		});
	});
}

pro.stampLastUse = function() {
	this.lastUse = aux.now();
}

pro.getLastUse = function() {
	return this.lastUse;
}


