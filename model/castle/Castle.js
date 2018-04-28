"use strict";

const Dict  = require(ROOT_DIR +'lib/collection/Dict');


module.exports.createInit = function(x, y) {
	let castle = new Castle();
	castle.init(x, y);
	return castle;
}

module.exports.createLoad = function(data) {
	let castle = new Castle();
	castle.load(data);
	return castle;
}


function Castle() {
	this.x = 0;
	this.y = 0;
	this.builds = new Dict();
}

const pro = Castle.prototype;


pro.getX = function() {
	return this.x;
}

pro.getY = function() {
	return this.y;
}

pro.init = function(x, y) {
	this.x = x;
	this.y = y;
}

pro.pack = function() {
	let ret = {
		x : this.x,
		y : this.y
	};
	return ret;
}

pro.toData = function() {
	let ret = {
		x : this.x,
		y : this.y
	};
	return ret;
}

