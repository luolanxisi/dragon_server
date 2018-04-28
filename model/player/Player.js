"use strict";

const Dict = require(ROOT_DIR +'lib/collection/Dict');
const LandMgr   = require(ROOT_DIR +'model/land/LandMgr');
const HeroMgr   = require(ROOT_DIR +'model/hero/HeroMgr');
const SkillMgr  = require(ROOT_DIR +'model/skill/SkillMgr');
const CastleMgr = require(ROOT_DIR +'model/castle/CastleMgr');
const TaskMgr   = require(ROOT_DIR +'model/task/TaskMgr');

const LAND_MGR = 1; // 领土
const HERO_MGR = 2; // 英雄
const SKILL_MGR = 3; // 技能
const CASTLE_MGR = 4; // 城池
const TASK_MGR = 5; // 任务

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
	this.mgrDict = new Dict();
	this.mgrDict.add(LAND_MGR,   {class:LandMgr,   obj:null, waitQueue:[]});
	this.mgrDict.add(HERO_MGR,   {class:HeroMgr,   obj:null, waitQueue:[]});
	this.mgrDict.add(SKILL_MGR,  {class:SkillMgr,  obj:null, waitQueue:[]});
	this.mgrDict.add(CASTLE_MGR, {class:CastleMgr, obj:null, waitQueue:[]});
	this.mgrDict.add(TASK_MGR,   {class:TaskMgr,   obj:null, waitQueue:[]});
	//
	// this.online = false;
	// this.lastUse = Auxiliary.now(); // for gc
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
	let mgr = this.mgrDict.get(key);
	if ( mgr.obj === null ) {
		mgr.waitQueue.push(cb);
		if ( mgr.waitQueue.length > 1 ) {
			return;
		}
		let obj = new mgr.class(this.id);
		let waitQueue = mgr.waitQueue;
		obj.load(function(err, res) {
			if (err) {
				aux.log(null, err);
				mgr.waitQueue = [];
				return Auxiliary.cbAll(waitQueue, [err]);
			}
			obj.afterLoad(function(err, res) {
				if (err) {
					aux.log(null, err);
					mgr.waitQueue = [];
					return Auxiliary.cbAll(waitQueue, [err]);
				}
				mgr.waitQueue = [];
				mgr.obj = obj;
				Auxiliary.cbAll(waitQueue, [null, mgr.obj]);
			});
		});
	}
	else {
		cb(null, mgr.obj);
	}
}


// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	let self = this;
	let total = this.mgrDict.getSize();
	//
	let count = 0;
	let mgrDict = this.mgrDict.getRaw();
	for ( let key in mgrDict ) {
		this.getMgr(key, function(err, mgr) {
			if (err) {
				aux.log(null, err);
			}
			mgr.register(function(err, res) {
				if (err) {
					aux.log(null, err);
				}
				++count;
				if (count >= total) {
					cb(null, self);
				}
			});
		});
	}
}

// pro.save = function(cb) {
// 	let self = this;
// 	let total = this.mgrDict.getSize() + 1;
// 	let count = 0;
// 	//
// 	MysqlExtend.query('UPDATE tbl_role SET rank=?, money=?, gem=?, lastLogin=? WHERE id=?', [this.rank, this.money, this.gem, this.lastLogin, this.id], function (err, res) {
// 		if (err) {
// 			console.error(err);
// 		}
// 		++count;
// 		if (count >= total) {
// 			cb(null, self);
// 		}
// 	});
// 	//

// 	let mgrDict = this.mgrDict.getRaw();
// 	for ( let key in mgrDict ) {
// 		this.getMgr(key, function(err, mgr) {
// 			if (err) {
// 				console.error(err);
// 				++count;
// 				if (count >= total) {
// 					cb(null, self);
// 				}
// 				return;
// 			}
// 			mgr.save(function(err, res) {
// 				if (err) {
// 					console.error(err);
// 				}
// 				++count;
// 				if (count >= total) {
// 					cb(null, self);
// 				}
// 			});
// 		});
// 	}
// }

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT name, gold, gem, wood, stone, iron, food, repute, skillExp, leagueId, regTime, lastLogin FROM tbl_player WHERE id=? LIMIT 1', [this.id], function (err, res) {
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
		// 需要计算离线收入
		self.regTime   = row.regTime || 0;
		self.lastLogin = row.lastLogin || 0;
		//
		if (self.regTime == self.lastLogin) {
			self.register(function(err, res) {
				if ( err ) {
					return cb(err);
				}
				self.afterLoad(cb);
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
					self.afterLoad(cb);
				});
			});
		}
	});
}

// load之后执行，数据之间有依赖的放在此处（如：机器人之间有队伍组合加成）
pro.afterLoad = function(cb) {
	this.lastLogin = Auxiliary.now();
	cb(null, this);
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

// pro.setFirst = function() {
// 	this.first = false;
// }

// pro.destory = function(cb) {
// 	cb();
// }

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
			cb(null, ret);
		});
	});
	// 缺乏仓库容量
	// self.getRobotMgr(function(err, robotMgr) {
	// 	if (err) {
	// 		return cb(err);
	// 	}
	// 	ret.robotData = robotMgr.toData();
	// 	self.getMissionMgr(function(err, missionMgr) {
	// 		if (err) {
	// 			return cb(err);
	// 		}
	// 		ret.missionData = missionMgr.toData();
	// 		self.getItemMgr(function(err, itemMgr) {
	// 			if (err) {
	// 				return cb(err);
	// 			}
	// 			ret.itemData = itemMgr.toData();
	// 			cb(null, ret);
	// 		});
	// 	});
	// });
}

pro.stampLastUse = function() {
	this.lastUse = aux.now();
}

// pro.setLastUse = function(value) {
// 	this.lastUse = value;
// }

// pro.getLastUse = function() {
// 	return this.lastUse;
// }


