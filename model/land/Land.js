"use strict";


module.exports.createInit = function(cfgId) {
	let land = new Land();
	land.init(cfgId);
	return land;
}


function Land(x, y) {
	this.x = x;
	this.y = y;
}

const pro = Land.prototype;


pro.init = function(cfgId) {
	return {};
}

pro.pack = function() {
	return {};
}

pro.toData = function() {
	return {};
}

