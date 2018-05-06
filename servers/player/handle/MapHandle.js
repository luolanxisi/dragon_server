"use strict";

const PlayerMgr = require(ROOT_DIR +'model/player/PlayerMgr').getInst();


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.MAP_ATTACK = function(pid, msg, cb) {
	let teamId = msg.teamId
	let x = msg.x;
	let y = msg.y;
	let campType = msg.campType;
	let campId = msg.campId;
	PlayerMgr.get(pid, function(err, player) {
		if (err) {
			return cb(err);
		}
		player.getCastleMgr(function(err, castleMgr) {
			if (err) {
				return cb(err);
			}
			// 实际出兵点有可能是要塞，还需要验证当前出兵点是否有该部队驻扎
			let castle = castleMgr.get(campId);
			let team = castle.getTeam(teamId);
			if ( ! team.tryLock() ) {
				return cb(aux.createError(ErrorCode.SERVER_ERROR, "Team has already locked!"));
			}
			// 
			player.getHeroMgr(function(err, heroMgr) {
				if (err) {
					return cb(err);
				}
				let minSpeed = 1000000;
				let size = team.getSize();
				for (let i=0; i<size; ++i) {
					let pos = i + 1;
					let heroId = team.get(pos);
					if (heroId != 0) {
						let hero = heroMgr.get(heroId);
						let speed = hero.getSpeed();
						if ( speed < minSpeed ) {
							minSpeed = speed;
						}
					}
				}
				//
				let para = {
					pid    : pid,
					teamId : teamId,
					speed  : minSpeed,
					startX : castle.getX(),
					startY : castle.getY(),
					endX   : x,
					endY   : y
				};
				App.callRemote("map.MapRemote.attackTile", null, para, function(err, res) {
					if (err) {
						return cb(err);
					}
					cb(null, res);
				});
			});
		});
	});
}

pro.MAP_DEFEND = function(pid, msg, cb) {
}

pro.MAP_FARM = function(pid, msg, cb) {
}

pro.MAP_TRAIN = function(pid, msg, cb) {
}


