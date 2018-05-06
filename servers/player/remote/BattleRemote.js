"use strict";

const PlayerMgr = require(ROOT_DIR +'model/player/PlayerMgr').getInst();
const Battle    = require(ROOT_DIR +'model/battle/Battle');


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.battleCalc = function(msg, cb) {
	let pid        = msg.pid;
	let teamId     = msg.teamId;
	let guardCfgId = msg.guardCfgId;
	let costSec    = msg.costSec;
	let tileX      = msg.tileX;
	let tileY      = msg.tileY;
	//
	PlayerMgr.get(pid, function(err, player) {
		if (err) {
			return cb(err);
		}
		player.getCastleMgr(function(err, castleMgr) {
			if (err) {
				return cb(err);
			}
			player.getHeroMgr(function(err, heroMgr) {
				if (err) {
					return cb(err);
				}
				let team = castleMgr.findTeam(teamId);
				let attackTeam = Battle.playerFormTeam(heroMgr, team, Battle.FLAG_ATTACKER);
				let defendTeam = Battle.guardFormTeam(guardCfgId, Battle.FLAG_DEFNEDER);
				let battle = new Battle(attackTeam, defendTeam);
				battle.calc();
				// 还未完成伤兵
				let attackReaminArmies = battle.getAttackRemain();
				for (let i in attackReaminArmies) {
					let heroData = attackReaminArmies[i];
					let hero = heroMgr.get(heroData.id);
					hero.setArmy(heroData.army);
				}
				//
				switch ( battle.getAttackResult() ) {
					case Battle.RESULT_SUCC: // 占领
					case Battle.RESULT_FAIL: // 失败
						setTimeout(function() {
							backToCamp(pid, teamId);
						}, costSec * 1000);
						break;
					case Battle.RESULT_DRAW: // 平局
						break;
				}
				//
				App.callRemote("connector.PlayerRemote.sendByPid", pid, {
					pid  : pid,
					cmd  : App.Proto.BATTLE_RESULT,
					data : battle.packClientData(tileX, tileY)
				}, aux.logError);
				//
				cb(null, {data : battle.packServerData()});
			});
		});
	});
}

function backToCamp(pid, teamId) {
	PlayerMgr.get(pid, function(err, player) {
		if (err) {
			return aux.log(null, err);
		}
		player.getCastleMgr(function(err, castleMgr) {
			if (err) {
				return aux.log(null, err);
			}
			player.getHeroMgr(function(err, heroMgr) {
				if (err) {
					return aux.log(null, err);
				}
				let team = castleMgr.findTeam(teamId);
				team.setFree();
				//
				let size = team.getSize();
				for (let i=0; i<size; ++i) {
					let heroId = team.get(i+1);
					let hero = heroMgr.get(heroId);
					if (hero != null) {
						hero.cureArmy();
					}
				}
			});
		});
	});
}


