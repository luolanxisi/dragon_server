"use strict";

require(ROOT_DIR +'model/map/MapData').initSync(); // 同步预载入
const mapCmgr = require(ROOT_DIR +'model/map/MapCmgr').getInst();


var mapSaveTick;

// exports.beforeStartup = function(app, cb) {
// 	aux.log("beforeStartup");
// 	cb();
// }

exports.afterStartup = function(app, cb) {
	mapSaveTick = setInterval(function(err) {
		try {
			mapCmgr.save(aux.logError);
			aux.log("Save map db finish");
		} catch (e) {
			aux.log("Save map error", e);
		}
	}, 3600 * 1000);
	//
	mapCmgr.load(function(err) {
		if (err) {
			aux.log("Error afterStartup:", err);
		}
		cb();
	});
}

// exports.afterStartAll = function(app) {
// 	aux.log("afterStartAll");
// }

exports.beforeShutdown = function(app, cb) {
	clearInterval(mapSaveTick);
	mapCmgr.save(function(err) {
		if (err) {
			aux.log("Error beforeShutdown:", err);
		}
		cb();
	});
}
