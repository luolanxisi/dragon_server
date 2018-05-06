"use strict";


const mapCmgr = require(ROOT_DIR +'model/map/MapCmgr').getInst();
const Battle  = require(ROOT_DIR +'model/battle/Battle');


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.birth = function(msg, cb) {
	let pid = msg.pid;
	let x = msg.x;
	let y = msg.y;
	mapCmgr.addCastle(pid, x, y);
	cb(null, {});
}

pro.attackTile = function(msg, cb) {
	let pid = msg.pid;
	let teamId = msg.teamId;
	let speed  = msg.speed;
	let startX = msg.startX;
	let startY = msg.startY;
	let endX = msg.endX;
	let endY = msg.endY;
	// 最终需要判断该地块不属于同盟友军
	let tile = mapCmgr.getTile(endX, endY);
	// 算法需要在像素级而非格子级（先假设一个格子100速度需要走60秒）
	let tileDist = Math.sqrt(Math.pow(Math.abs(endX - startX), 2) + Math.pow(Math.abs(endY - startY), 2));
	let costSec = Math.ceil(tileDist * (speed * 60 / (100*5))); // 临时加5倍
	// 
	setTimeout(function() {
		// 如果是免战期间直接返回
		if ( tile.isPeace() ) {
			App.callRemote("connector.PlayerRemote.sendByPid", pid, {
				pid  : pid,
				cmd  : App.Proto.BATTLE_RESULT,
				data : { result : Battle.RESULT_NO_BATTLE } 
			}, aux.logError);
			return;
		}
		//
		let para = {
			pid    : pid,
			teamId : teamId,
			guardCfgId : aux.randomRange(1, 8),
			costSec : costSec,
			tileX : endX,
			tileY : endY
		};
		App.callRemote("player.BattleRemote.battleCalc", pid, para, function(err, res) {
			if (err) {
				return aux.log(null, err);
			}
			let retMsg = res.data;
			switch ( retMsg.result ) {
				case Battle.RESULT_SUCC: // 占领
					tile.occupy(pid);
					break;
				case Battle.RESULT_FAIL: // 失败
					break;
				case Battle.RESULT_DRAW: // 平局
					break;
			}
		});
	}, costSec * 1000);
	//
	cb(null, {costSec:costSec});
}


