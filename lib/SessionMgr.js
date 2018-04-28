"use strict";

const protocolType = require(ROOT_DIR +'model/network/Proto').getTypeDict();

const instance = new SessionMgr();

module.exports.getInst = function() {
	if (ServerMgr.getCurrentServer().type != "connector") {
		console.error("Use session mgr not in [connector] process !!");
		return;
	}
	return instance;
};

// SessionMgr只能在connector使用
function SessionMgr() {
	this.ticketDict = {};
	this.idPool = {};
}

const pro = SessionMgr.prototype;



pro.addTicket = function(pid, ticket) {
	let session = {
		pid    : pid,
		ticket : ticket,
		time   : aux.now()
	};
	this.ticketDict[ticket] = session;
	this.idPool[pid] = session;
}

pro.checkTicket = function(ticket) {
	return this.ticketDict[ticket] != null;
}

pro.completeSession = function(ticket, socket) {
	let session = this.ticketDict[ticket];
	delete session.ticket;
	delete this.ticketDict[ticket];
	//
	socket.pid = session.pid;
	return session;
}

pro.get = function(pid) {
	return this.idPool[pid];
}


