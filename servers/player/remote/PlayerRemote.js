"use strict";

const PlayerMgr = require(ROOT_DIR +'model/player/PlayerMgr').getInst();


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.online = function(msg, cb) {
	let pid = msg.pid;
	// 
	PlayerMgr.get(pid, function(err, player) {
		if (err) {
			return cb(err);
		}
		// cb(null, res);
		player.setOnline(function(err, res) {
			if (err) {
				return cb(err);
			}
			player.packLogin(function(err, res) {
				if (err) {
					return cb(err);
				}
				cb(null, res);
			});
		});
	});
}

pro.offline = function(msg, cb) {
	let pid = msg.pid;
	PlayerMgr.get(pid, function(err, player) {
		if (err) {
			return cb(err);
		}
		player.setOffline(cb);
	});
}


