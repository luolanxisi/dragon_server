"use strict";

const https = require('https');


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.WEB_TICKET = function(_null, msg, cb) {
	let ticket = msg.ticket; // 电话号码
	let platformId = ticket;
	//
	MysqlExtend.query('SELECT pid FROM tbl_platform WHERE id=? LIMIT 1', [platformId], function (err, res) {
		if (err) {
			aux.log(null, err);
			return cb(Auxiliary.createError(ErrorCode.CREATE_ROLE), null, true);
		}
		if ( res.length == 0 ) { // 新建账号
			let regTime = aux.now();
			let name = 'Guest#'+aux.randomRange(1000, 9999);
			MysqlExtend.query("INSERT INTO tbl_player(name, regTime, lastLogin) VALUES(?, ?, ?)", [name, regTime, regTime], function (err, res) {
				if (err) {
					aux.log(null, err);
					return cb(Auxiliary.createError(ErrorCode.CREATE_ROLE), null, true);
				}
				let pid = res.insertId;
				MysqlExtend.query('INSERT INTO tbl_platform(id, pid) VALUES(?, ?)', [platformId, pid], function (err, res) {
					if (err) {
						aux.log(null, err);
						return cb(Auxiliary.createError(ErrorCode.CREATE_ROLE), null, true);
					}
					loginSucc(pid, ticket, cb);
				});
			});
		}
		else {
			let pid = res[0].pid;
			loginSucc(pid, ticket, cb);
		}
	});
}

function loginSucc(pid, ticket, cb) {
	// 分服
	let server = ServerMgr.getByDispatch('connector', pid);
	let args = {
		ticket : ticket,
		pid : pid
	};
	App.callRemote("connector.PlayerRemote.webLogin", pid, args, function(err, res) {
		if ( err ) {
			return cb(Auxiliary.createError(ErrorCode.CREATE_ROLE), null, true);
		}
		cb(null, {host:server.getHost(), port:server.getClientPort()}, true);
	});
}

