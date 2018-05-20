"use strict";

const Dict = require(ROOT_DIR +'lib/collection/Dict');
const Team = require(ROOT_DIR +'model/team/Team');


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
	this.id = 0;
	this.x = 0;
	this.y = 0;
	this.builds = new Dict();
	this.teams = new Array(5);
	for (let i=0; i<5; ++i) {
		this.teams[i] = new Team();
	}
}

const pro = Castle.prototype;


pro.getX = function() {
	return this.x;
}

pro.getY = function() {
	return this.y;
}

pro.getTeam = function(teamId) {
	return this.teams[teamId-1];
}

pro.packTeam = function() {
	let arr = [];
	for (let i in this.teams) {
		let team = this.teams[i];
		arr.push(team.pack());
	}
	return arr;
}

pro.init = function(x, y) {
	this.x = x;
	this.y = y;
}

pro.load = function(data) {
	this.id = data.id;
	this.x = data.x;
	this.y = data.y;
	let teams = data.teams;
	for (let i=0; i<teams.length; ++i) {
		let team = this.teams[i];
		team.fill(teams[i]);
	}
}

pro.pack = function() {
	let ret = {
		id : this.id,
		x : this.x,
		y : this.y,
		teams : this.packTeam()
	};
	return ret;
}

pro.toData = function() {
	return this.pack();
}

