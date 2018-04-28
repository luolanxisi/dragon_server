"use strict";

const Player = require(ROOT_DIR +'model/player/Player')
const Dict = require(ROOT_DIR +'lib/collection/Dict')

const playerMgr = new PlayerMgr();

module.exports.getInst = function() {
	if (ServerMgr.getCurrentServer().type != "player") {
		aux.log(null, "Use player mgr not in player process !!");
		return;
	}
	return playerMgr;
};

function PlayerMgr() {
	let self = this;
	this.pool = new Dict();
	this.waitQueueDict = {};
	this.tickId = setInterval(function() {
		try {
			self.save(function() {
				let server = ServerMgr.getCurrentServer();
				console.log("save end >>>>>>", server.getType(), server.getId());
			});
		} catch (e) {
			console.log("Save tick error:", e);
		}		
	}, 300 * 1000);
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

// 定时保存
pro.save = function(cb) {
	let self = this;
	let now = Auxiliary.now();
	let size = this.pool.getSize();
	let count = 0;
	if (this.pool.getSize() <= 0) {
		return cb();
	}
	let roles = this.pool.getRaw();
	for (let i in roles) {
		let role = roles[i];
		role.save(function(err) {
			self.checkGc(role, now);
			if (err) {
				console.error("save role fail!!", err);
			}
			++count;
			if (count >= size) {
				cb();
			}
		});
	}
}

pro.checkGc = function(role, now) {
	if ( now - role.getLastUse() > 300 ) { // 300
		this.remove(role.getId(), Auxiliary.normalCb);
		role.destory(Auxiliary.normalCb);
	}
}

pro.destory = function(cb) {
	clearInterval(this.tickId);
	try {
		this.save(function() {
			let server = ServerMgr.getCurrentServer();
			console.log("Close save end >>>>>>", server.getType(), server.getId());
		});
	} catch (e) {
		console.log("Close save error:", e);
	} finally {
		cb();
	}
}

