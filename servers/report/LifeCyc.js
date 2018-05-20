"use strict";

const ReportSqlite = require(ROOT_DIR +'model/sqlite/ReportSqlite');



exports.afterStartup = function(app, cb) {
	ReportSqlite.create(ROOT_DIR +"db/BattleReport.db", function(err, reportSqlite) {
		if (err) {
			return cb(err);
		}
		app.reportSqlite = reportSqlite;
		cb();
	});
}

exports.beforeShutdown = function(app, cb) {
	app.reportSqlite.close(function(err) {
		if (err) {
			return cb(err);
		}
		cb();
	});
}

