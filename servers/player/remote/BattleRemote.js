"use strict";

const PlayerMgr = require(ROOT_DIR +'model/player/PlayerMgr').getInst();
const Battle    = require(ROOT_DIR +'model/battle/Battle');
const Land      = require(ROOT_DIR +'model/land/Land');


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.battleCalc = function(msg, cb) {
	let atkPid     = msg.atkPid;
	let defPid     = msg.defPid;
	let teamId     = msg.teamId;
	let guardCfgId = msg.guardCfgId;
	let costSec    = msg.costSec;
	let tileX      = msg.tileX;
	let tileY      = msg.tileY;
	let battleTime = msg.battleTime;
	//
	PlayerMgr.get(atkPid, function(err, player) {
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
				player.getLandMgr(function(err, landMgr) {
					if (err) {
						return cb(err);
					}
					let team = castleMgr.findTeam(teamId);
					let attackTeam = Battle.playerFormTeam(heroMgr, team, Battle.FLAG_ATTACKER);
					let defendTeam = Battle.guardFormTeam(guardCfgId, Battle.FLAG_DEFNEDER);
					let battle = new Battle(atkPid, defPid, attackTeam, defendTeam, tileX, tileY, teamId, battleTime);
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
							landMgr.add(Land.createLoad({
								x : tileX,
								y : tileY,
								occupyTime : battle.getOccupyTime()
							})); // 更新land
							setTimeout(function() {
								backToCamp(atkPid, teamId);
							}, costSec * 1000);
							break
						case Battle.RESULT_FAIL: // 失败
							setTimeout(function() {
								backToCamp(atkPid, teamId);
							}, costSec * 1000);
							break;
						case Battle.RESULT_DRAW: // 平局
							break;
					}
					// 如果defPid不为0，需要给对方也广播战斗
					App.callRemote("connector.PlayerRemote.sendByPid", atkPid, {
						pid  : atkPid,
						cmd  : App.Proto.BATTLE_RESULT,
						data : battle.packClientData()
					}, aux.logError);
					//
					App.callRemote("report.ReportRemote.saveReport", null, battle.packReportData(), aux.logError);
					//
					cb(null, {data : battle.packServerData()});
				});
			});
		});
	});
}

function backToCamp(pid, teamId) {
	PlayerMgr.get(pid, function(err, player) {
		if (err) {
			return aux.log(err);
		}
		player.getCastleMgr(function(err, castleMgr) {
			if (err) {
				return aux.log(err);
			}
			player.getHeroMgr(function(err, heroMgr) {
				if (err) {
					return aux.log(err);
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


