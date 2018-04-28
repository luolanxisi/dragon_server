"use strict";


const mapCmgr = require(ROOT_DIR +'model/map/MapCmgr').getInst();


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


