"use strict";


const mapCmgr = require(ROOT_DIR +'model/map/MapCmgr').getInst();


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.MAP_SCREEN_DATA = function(_null, msg, cb, clientSocket) {
	let pid = msg.pid;
	let centerTileX = msg.x;
	let centerTileY = msg.y;
	let ret = mapCmgr.findRangeTile(centerTileX, centerTileY);
	cb(null, { cx:centerTileX, cy:centerTileY, tiles:ret });
}



