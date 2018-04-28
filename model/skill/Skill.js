"use strict";


module.exports.createInit = function(cfgId) {
	let skill = new Skill();
	skill.init(cfgId);
	return skill;
}

module.exports.createLoad = function(data) {
	let skill = new Skill();
	skill.load(data);
	return skill;
}


function Skill() {
}

const pro = Skill.prototype;




pro.pack = function() {
	return {};
}

pro.toData = function() {
	return {};
}

