"use strict";


module.exports.createInit = function(cfgId) {
	let task = new Task();
	task.init(cfgId);
	return task;
}

module.exports.createLoad = function(data) {
	let task = new Task();
	task.load(data);
	return task;
}


function Task() {
	this.skills = [];
}

const pro = Task.prototype;


pro.hasSkill = function(cfgId) {
}

pro.addSkill = function(cfgId) {
}

pro.removeSkill = function(cfgId) {
}

pro.upgradeSkill = function(cfgId) {
}


pro.pack = function() {
	return {};
}

pro.toData = function() {
	return {};
}

