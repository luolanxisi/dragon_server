"use strict";



module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.REPORT_FETCH_LIST = function(pid, msg, cb) {
	let page = msg.page;
	App.reportSqlite.getList(pid, page, function(err, res) {
		if (err) {
			return cb(err);
		}
		cb(null, {list:res});
	});
}

pro.REPORT_FETCH_DATA = function(pid, msg, cb) {
	let reportId = msg.reportId;
	App.reportSqlite.getData(reportId, function(err, res) {
		if (err) {
			return cb(err);
		}
		cb(null, {battleData:res});
	});
}

