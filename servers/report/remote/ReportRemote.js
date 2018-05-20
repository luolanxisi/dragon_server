"use strict";


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.saveReport = function(msg, cb) {
	let atkPid     = msg.atkPid;
	let defPid     = msg.defPid;
	let baseInfo   = msg.baseInfo;
	let teamId     = msg.teamId;
	let groupTime  = msg.groupTime;
	let battleData = msg.battleData;
	App.reportSqlite.add([atkPid, defPid, JSON.stringify(baseInfo), teamId, groupTime, JSON.stringify(battleData)], function(err) {
		if (err) {
			aux.log(err);
		}
		cb(null, {});
	});
}


