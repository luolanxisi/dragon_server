"use strict";

const sqlite3 = require('sqlite3').verbose();


module.exports.createFileDbg = function(fileName, cb) { // ROOT_DIR +"db/BattleReport.db"
	let db = new sqlite3.Database(fileName, function(err, res) { // OPEN_READWRITE | OPEN_CREATE
		cb(err, db);
	});
}

module.exports.createMemoryDbg = function(cb) {
	let db = new sqlite3.Database(':memory:', function(err, res) {
		cb(err, db);
	});
}


// function SqliteExtend() {
// 	let self = this;
// 	this.db = null;
// }

// const pro = SqliteExtend.prototype;


// pro.serialize = function(cb) {
// 	this.db.serialize(cb);
// }

// pro.prepare = function(sql) {
// 	let stmt = this.db.prepare(sql);
// 	return stmt;
// }

// pro.run = function(stmt, param) {
// 	stmt.run(param);
// }

// pro.finalize = function(stmt) {
// 	stmt.finalize();
// }

// pro.each = function(sql, param, cb) {
// 	this.db.each(sql, param, cb);
// }

// pro.close = function(cb) {
// 	this.db.close(cb);
// }

// 定时更新，大量读取模型


// db.serialize(function() {
// 	db.run("CREATE TABLE lorem (info TEXT)");

// 	var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
// 	for (var i = 0; i < 10; i++) {
// 		stmt.run("Ipsum " + i);
// 	}
// 	stmt.finalize();

// 	db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
// 		console.log(row.id + ": " + row.info);
// 	});
// });

