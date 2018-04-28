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
			let level = cardPool.getLevel();
			for (let i in heroCfgIds) {
				let heroCfgId = heroCfgIds[i];
				heroMgr.addByCfgId(heroCfgId, level);
			}
			cb(null, { heroCfgIds : heroCfgIds });
		});
	});
}



