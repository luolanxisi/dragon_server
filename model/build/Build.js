"use strict";


module.exports.createInit = function(cfgId) {
	let build = new Build();
	build.init(cfgId);
	return build;
}

module.exports.createLoad = function(data) {
	let build = new Build();
	build.load(data);
	return build;
}


function Build() {
}

const pro = Build.prototype;


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

