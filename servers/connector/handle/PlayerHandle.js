"use strict";


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;



pro.PLAYER_LOGIN = function(_null, msg, cb, clientSocket) {
	let ticket = msg.ticket;
	if ( ! SessionMgr.checkTicket(ticket) ) {
		return cb(aux.createError(ErrorCode.CREATE_SESSION, 'Ticket not exist!'));
	}
	let session = SessionMgr.completeSession(ticket, clientSocket);
	let pid = session.pid;
	//
	App.callRemote("player.PlayerRemote.online", pid, {pid:pid}, function(err, res) {
		if (err) {
			return cb(aux.createError(ErrorCode.CREATE_SESSION));
		}
		cb(null, res);
	});
}


