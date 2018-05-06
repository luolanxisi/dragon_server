"use strict";


module.exports = Tile;

function Tile(x, y, cfgId) {
	this.x = x;
	this.y = y;
	this.cfgId = cfgId;
	this.pid = 0;
	//
	this.occupyTime = 0; // 免战倒计时
}

const pro = Tile.prototype;

pro.occupy = function(pid) {
	this.pid = pid;
	this.occupyTime = aux.now();
}

pro.isPeace = function() {
	return aux.now() < this.occupyTime + 3600;
}
