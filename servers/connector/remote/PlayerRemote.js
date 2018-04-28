"use strict";

module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.webLogin = function(msg, cb) {
	let ticket = msg.ticket;
	let pid = msg.pid;
	SessionMgr.addTicket(pid, ticket);
	cb(null, {});
}


