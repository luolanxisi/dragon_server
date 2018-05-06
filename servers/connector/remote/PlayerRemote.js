"use strict";

module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.webLogin = function(msg, cb) {
	let ticket = msg.ticket;
	let pid = msg.pid;
	App.SessionMgr.addTicket(pid, ticket);
	cb(null, {});
}

pro.sendByPid = function(msg, cb) {
	let pid = msg.pid;
	let cmd = msg.cmd;
	let data = msg.data;
	App.SessionMgr.sendByPid(pid, cmd, data);
	cb(null, {});
}

