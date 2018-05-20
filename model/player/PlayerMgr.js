"use strict";

const Player = require(ROOT_DIR +'model/player/Player')
const Dict = require(ROOT_DIR +'lib/collection/Dict')

const playerMgr = new PlayerMgr();

module.exports.getInst = function() {
	if (ServerMgr.getCurrentServer().type != "player") {
		aux.log("Use player mgr not in player process !!");
		return;
	}
	return playerMgr;
};

function PlayerMgr() {
	let self = this;
	this.saveLock = false;
	this.saveWaitList = [];
	//
	this.pool = new Dict();
	this.waitQueueDict = {};
	this.tickId = setInterval(function() {
		try {
			self.save(function() {
				let server = ServerMgr.getCurrentServer();
				aux.log("save end >>>>>>", server.getType(), server.getId());
			});
		} catch (e) {
			aux.log("Save tick error:", e);
		}		
	}, 3600 * 1000);
}

const pro = PlayerMgr.prototype;


pro.get = function(pid, cb) {
	let self = this;
	let player = this.pool.get(pid);
	if ( ! player ) {
		if ( ! this.waitQueueDict[pid] ) {
			this.waitQueueDict[pid] = [];
		}
		let waitQueue = this.waitQueueDict[pid];
		waitQueue.push(cb);
		if ( waitQueue.length > 1 ) {
			return;
		}
		let player = new Player(pid);
		player.load(function(err, res) {
			if (err) {
				self.waitQueueDict[pid] = [];
				return aux.cbAll(waitQueue, [err]);
			}
			self.waitQueueDict[pid] = [];
			self.pool.add(pid, player);
			aux.cbAll(waitQueue, [null, player]);
		});
	}
	else {
		player.stampLastUse();
		cb(null, player);
	}
}

pro.remove = function(pid, cb) {
	this.pool.remove(pid);
	cb();
}


pro.save = function(cb) {
	if ( this.saveLock ) {
		this.saveWaitList.push(cb);
		return;
	}
	this.saveLock = true;
	let self = this;
	this.saveDb(function(err) {
		self.saveLock = false;
		cb(err);
		aux.cbAll(self.saveWaitList, [err]);
	});
}

// 定时保存
pro.saveDb = function(cb) {
	let self = this;
	let now = Auxiliary.now();
	let size = this.pool.getSize();
	let count = 0;
	if (this.pool.getSize() <= 0) {
		return cb();
	}
	let players = this.pool.getRaw();
	for (let i in players) {
		let player = players[i];
		player.save(function(err) {
			self.checkGc(player, now);
			if (err) {
				aux.error("save player fail!!", err);
			}
			++count;
			if (count >= size) {
				cb();
			}
		});
	}
}

pro.checkGc = function(player, now) {
	if ( now - player.getLastUse() > 300 ) { // 300
		this.remove(player.getId(), Auxiliary.normalCb);
		player.destory(Auxiliary.normalCb);
	}
}

pro.destory = function(cb) {
	clearInterval(this.tickId);
	this.save(function(err) {
		if (err) {
			aux.log("playerMgr destory", err);
		}
		let server = ServerMgr.getCurrentServer();
		aux.log("Close save end >>>>>>", server.getType(), server.getId());
		cb();
	});
}

