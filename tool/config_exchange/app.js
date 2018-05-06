"use strict";

// const iconv = require('iconv-lite');
const fs = require('fs');
const csv = require("fast-csv");

const aux = require("../../lib/Auxiliary");

const DATA_LAND_CFG = "../../../dragon_config/LandCfg.csv";
const DATA_HERO_CFG = "../../../dragon_config/HeroCfg.csv";
const DATA_GUARD_CFG = "../../../dragon_config/GuardCfg.csv";

const allNameDict = {}; // 文件表
const allIdxDict = {};  // 各文件字段索引表
const allProcDict = {}; // 各文件后续处理表
const allResultDict = {}; // 供其他文件引用


function parseAllConfig() {
	for (let key in allNameDict) {
		let nameDict = allNameDict[key];
		let firstRow = true;
		let result = {};
		csv.fromPath(key)
			.on("data", function(data){
				if ( firstRow ) {
					console.error(key);
					firstRow = false;
					parseHead(data, key, nameDict);
				}
				else {
					parseRow(data, key, result);
				}
			})
			.on("end", function(){
				allProcDict[key](result);
				allResultDict[key] = result;
				console.error('end', key);
			});
	}
}

function parseHead(row, key, nameDict) {
	let idxDict = {};
	for ( let i in row ) {
		let colName = row[i];
		if ( nameDict[colName] != null ) {
			nameDict[colName].name = colName;
			idxDict[i] = nameDict[colName];
		}
	}
	allIdxDict[key] = idxDict;
}

function parseRow(row, key, table) {
	let idxDict = allIdxDict[key];
	let obj = {};
	for (let i in row) {
		if ( idxDict[i] != null ) {
			let colInfo = idxDict[i];
			switch (colInfo.type) {
				case 'int':
					if (row[i] != "") {
						obj[colInfo.name] = parseInt(row[i]);
					}
					break;
				case 'string':
					if (colInfo.change != null) {
						obj[colInfo.name] = colInfo.change[row[i]];
					}
					else {
						obj[colInfo.name] = row[i];
					}
					break;
				case 'float':
					if (row[i] != "") {
						obj[colInfo.name] = parseFloat(row[i]);
					}
					break;
			}
		}
	}
	table[obj.id] = obj;
}


// 土地配置表
allNameDict[DATA_LAND_CFG] = {
	'id'    : {type:'int'}, // 
	'level' : {type:'int'}, // 
	'food'  : {type:'int'}, // 
	'wood'  : {type:'int'}, // 
	'stone' : {type:'int'}, // 
	'iron'  : {type:'int'}  // 
};

allProcDict[DATA_LAND_CFG] = function(data) {
	fs.open('../../data/LandCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};


// 英雄配置表
allNameDict[DATA_HERO_CFG] = {
	'id'     : {type:'int'}, // 
	'name'   : {type:'string'}, // 
	'career' : {type:'string', change:{warrior:1, minister:2, rider:3, archer:4, rogue:5, tactician:6, wizard:7, warlock:8}}, // 
	'realm'  : {type:'int'}, // 
	'star'   : {type:'int'}, // 
	'phyAtt' : {type:'int'}, // 
	'phyDef' : {type:'int'}, // 
	'magAtt' : {type:'int'}, // 
	'magDef' : {type:'int'}, // 
	'speed'  : {type:'int'}, // 
	'phyAttUp' : {type:'float'}, // 
	'phyDefUp' : {type:'float'}, // 
	'magAttUp' : {type:'float'}, // 
	'magDefUp' : {type:'float'}, // 
	'speedUp'  : {type:'float'}, // 
	'cost'   : {type:'float'}, // 
	'range'  : {type:'int'}  // 
};

allProcDict[DATA_HERO_CFG] = function(data) {
	fs.open('../../data/HeroCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

// 守军配置
allNameDict[DATA_GUARD_CFG] = {
	'id'             : {type:'int'}, // 
	'guardLevel'     : {type:'int'}, // 
	'heroLevel'      : {type:'int'}, // 
	'army'           : {type:'int'}, // 
	'member1'        : {type:'int'}, // 
	'member1Skill1'  : {type:'int'}, // 
	'member1Skill2'  : {type:'int'}, // 
	'member1Skill3'  : {type:'int'}, // 
	'member2'        : {type:'int'}, // 
	'member2Skill1'  : {type:'int'}, // 
	'member2Skill2'  : {type:'int'}, // 
	'member2Skill3'  : {type:'int'}, // 
	'member3'        : {type:'int'}, // 
	'member3Skill1'  : {type:'int'}, // 
	'member3Skill2'  : {type:'int'}, // 
	'member3Skill3'  : {type:'int'} // 
};

allProcDict[DATA_GUARD_CFG] = function(data) {
	for (let i in data) {
		let cfg = data[i];
		cfg.heroes = [];
		//
		let newObj = exchangeDict(cfg, "member1", "cfgId");
		if (newObj != null) {
			newObj.skills = [];
			exchangeList(newObj.skills, cfg, "member1Skill1");
			exchangeList(newObj.skills, cfg, "member1Skill2");
			exchangeList(newObj.skills, cfg, "member1Skill3");
			cfg.heroes.push(newObj);
		}
		//
		newObj = exchangeDict(cfg, "member2", "cfgId");
		if (newObj != null) {
			newObj.skills = [];
			exchangeList(newObj.skills, cfg, "member2Skill1");
			exchangeList(newObj.skills, cfg, "member2Skill2");
			exchangeList(newObj.skills, cfg, "member2Skill3");
			cfg.heroes.push(newObj);
		}
		//
		newObj = exchangeDict(cfg, "member3", "cfgId");
		if (newObj != null) {
			newObj.skills = [];
			exchangeList(newObj.skills, cfg, "member3Skill1");
			exchangeList(newObj.skills, cfg, "member3Skill2");
			exchangeList(newObj.skills, cfg, "member3Skill3");
			cfg.heroes.push(newObj);
		}
	}
	//
	fs.open('../../data/GuardCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};


parseAllConfig();


function exchangeDict(oldObj, oldKey, newKey) {
	if (oldObj[oldKey] != null) {
		let newObj = {};
		newObj[newKey] = oldObj[oldKey]
		delete oldObj[oldKey];
		return newObj;
	}
	return null;
}

function exchangeList(list, obj, key) {
	if (obj[key] != null) {
		list.push(obj[key]);
		delete obj[key];
	}
}

