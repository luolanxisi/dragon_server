"use strict";

const PlayerMgr = require(ROOT_DIR +'model/player/PlayerMgr').getInst();


exports.beforeStartup = function(app, cb) {
	cb();
}

exports.afterStartup = function(app, cb) {
	cb();
}

exports.afterStartAll = function(app) {
}

exports.beforeShutdown = function(app, cb) {
	PlayerMgr.destory(cb);
}
