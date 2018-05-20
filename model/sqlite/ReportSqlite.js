"use strict";

const fs = require('fs');
const SqliteExtend = require(ROOT_DIR +'lib/SqliteExtend');


module.exports.create = function(file, cb) {
	fs.access(file, function(err) {
		let dbExists = false;
		if (!err) {
			dbExists = true;
		}
		//
		SqliteExtend.createFileDbg(file, function(err, db) {
			if (err) {
				return cb(err);
			}
			let reportSqlite = new ReportSqlite(db);
			reportSqlite.init(dbExists, function(err) {
				if (err) {
					return cb(err);
				}
				cb(null, reportSqlite);
			});
		});
	});
}

function ReportSqlite(db) {
	this.db = db;
	this.saveSql = "INSERT INTO report(atkPid, defPid, baseInfo, teamId, groupTime, battleData) VALUES(?, ?, ?, ?, ?, ?)";
	this.saveInv = 1000;
	this.updateList = [];
	this.tick = null;
}

const pro = ReportSqlite.prototype;


pro.init = function(dbExists, cb) {
	let self = this;
	this.db.serialize(function() {
		if (!dbExists) {
			self.createDb();
		}
		//
		self.tick = setInterval(function() {
			self.save();
		}, self.saveInv);
		//
		cb();
	});
}

pro.createDb = function() {
	let arr = [];
	arr.push("CREATE TABLE report (");
	arr.push("id INTEGER PRIMARY KEY,");
	arr.push("atkPid INTEGER NOT NULL,"); // 进攻方pid（只会进攻方记录）
	arr.push("defPid INTEGER NOT NULL,"); // 防守方pid（npc为0）
	arr.push("baseInfo TEXT NOT NULL,"); // 基础信息（胜负、地块、双方队长、实际战斗时间）
	arr.push("teamId INTEGER NOT NULL,"); // 联合查找队伍id（通常是进攻方，除非进攻方是NPC）
	arr.push("groupTime INTEGER NOT NULL,"); // 连续战斗（5分钟间隔）开始时间
	arr.push("battleData TEXT NOT NULL"); // 战斗数据
	arr.push(");");
	this.db.run(arr.join(''));
	this.db.run("CREATE INDEX index_atkPid ON report (atkPid);");
	this.db.run("CREATE INDEX index_defPid ON report (defPid);");
	this.db.run("CREATE INDEX index_groupTime ON report (groupTime);");
	this.db.run("CREATE INDEX index_teamId ON report (teamId);");
}


pro.add = function(param, cb) {
	this.updateList.push(param);
	cb();
}

pro.getList = function(pid, page, cb) {
	let sql = "SELECT id, atkPid, defPid, baseInfo, groupTime FROM report WHERE atkPid=? ORDER BY id DESC LIMIT ? OFFSET ?";
	let offset = (page - 1) * 10;
	this.db.all(sql, [pid, 10, offset], function(err, row) {
		if (err) {
			return cb(err);
		}
		for (let i=0; i<row.length; ++i) {
			let data = row[i];
			data.baseInfo = JSON.parse(data.baseInfo);
		}
		cb(null, row);
	});
}

pro.getData = function(reportId, cb) {
	let sql = "SELECT battleData FROM report WHERE id=? LIMIT 1";
	this.db.all(sql, [reportId], function(err, row) {
		if (err) {
			return cb(err);
		}
		let battleData = JSON.parse(row[0].battleData);
		cb(null, battleData);
	});
}

pro.save = function() {
	if (this.updateList.length > 0) {
		let updateList = this.updateList;
		this.updateList = [];
		let self = this;
		this.db.serialize(function() {
			let stmt = self.db.prepare(self.saveSql);
			let size = updateList.length;
			for (let i=0; i<size; ++i) {
				stmt.run(updateList[i]);
			}
			stmt.finalize();
		});
	}
}

pro.close = function(cb) {
	this.db.close(cb);
}

