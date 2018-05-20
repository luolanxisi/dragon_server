"use strict";

const PlayerMgr = require(ROOT_DIR +'model/player/PlayerMgr').getInst();
require(ROOT_DIR +'model/map/MapData').initSync(); // 同步预载入

var playerSaveTick = null;

// exports.beforeStartup = function(app, cb) {
// 	cb();
// }

exports.afterStartup = function(app, cb) {
	//
	cb();
}

// exports.afterStartAll = function(app) {
// }

exports.beforeShutdown = function(app, cb) {
	PlayerMgr.destory(cb);
}


