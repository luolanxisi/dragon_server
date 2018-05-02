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
	this.teams = new Array(5);
	for (let i=0; i<5; ++i) {
		let team = new Array(3);
		for (let j=0; j<3; ++j) {
			team[j] = 0;
		}
		this.teams[i] = team;
	}
}

const pro = Castle.prototype;


pro.getX = function() {
	return this.x;
}

pro.getY = function() {
	return this.y;
}

pro.setTeam = function(teamId, heroIds) {
	let team = this.teams[teamId-1];
	team[0] = heroIds[0];
	team[1] = heroIds[1];
	team[2] = heroIds[2];
}

pro.init = function(x, y) {
	this.x = x;
	this.y = y;
}

pro.pack = function() {
	let ret = {
		x : this.x,
		y : this.y,
		teams : this.teams
	};
	return ret;
}

pro.toData = function() {
	let ret = {
		x : this.x,
		y : this.y,
		teams : this.teams
	};
	return ret;
}

