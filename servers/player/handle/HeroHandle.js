"use strict";

const PlayerMgr    = require(ROOT_DIR +'model/player/PlayerMgr').getInst();
const CardPoolCmgr = require(ROOT_DIR +'model/hero/CardPoolCmgr.js');


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.HERO_HIRE = function(pid, msg, cb) {
	let poolId = msg.poolId;
	let hireType = msg.hireType;
	PlayerMgr.get(pid, function(err, player) {
		if (err) {
			return cb(err);
		}
		let cardPool = CardPoolCmgr.getInst().get(poolId); // 需要验证权限
		let heroCfgIds = cardPool.random(hireType);
		player.getHeroMgr(function(err, heroMgr) {
			if (err) {
				return cb(err);
			}
			let heroes = [];
			let level = cardPool.getLevel();
			for (let i in heroCfgIds) {
				let heroCfgId = heroCfgIds[i];
				let hero = heroMgr.addByCfgId(heroCfgId, level);
				heroes.push({ id:hero.getId(), cfgId:heroCfgId });
			}
			cb(null, { heroes:heroes, level:level });
		});
	});
}

pro.HERO_MAKE_TEAM = function(pid, msg, cb) {
	let teamId = msg.teamId;
	let heroIds = msg.heroIds;
	PlayerMgr.get(pid, function(err, player) {
		if (err) {
			return cb(err);
		}
		player.getCastleMgr(function(err, castleMgr) {
			if (err) {
				return cb(err);
			}
			let castle = castleMgr.getCapital();
			let team = castle.getTeam(teamId);
			if ( team.isLock() ) {
				return cb(aux.createError(ErrorCode.SERVER_ERROR, "Team has already locked!"));
			}
			team.fill(heroIds);
			cb(null, {});
		});
	});
}

