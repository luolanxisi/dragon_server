"use strict";


module.exports = Team;


function Team() {
	this.pool = Array(3);
	this.lock = false;
	//
	for (let i=0; i<this.pool.length; ++i) {
		this.pool[i] = 0;
	}
}

const pro = Team.prototype;


pro.get = function(pos) {
	return this.pool[pos-1];
}

pro.getSize = function() {
	return this.pool.length;
}

pro.fill = function(heroIds) {
	for (let i=0; i<3; ++i) {
		this.pool[i] = heroIds[i];
	}
}

pro.pack = function(heroIds) {
	return this.pool;
}

pro.isLock = function() {
	return this.lock;
}

pro.tryLock = function() {
	if ( this.lock ) {
		return false;
	}
	this.lock = true;
	return true;
}

pro.setFree = function() {
	this.lock = false;
}
