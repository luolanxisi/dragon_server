"use strict";

// const iconv = require('iconv-lite');
const fs = require('fs');
const csv = require("fast-csv");

const aux = require("../../lib/Auxiliary");

const DATA_LAND_CFG = "../../../dragon_config/LandCfg.csv";
const DATA_HERO_CFG = "../../../dragon_config/HeroCfg.csv";
// const DATA_ROBOT            = "../../../config/RoBotAttributesData.csv";
// const DATA_ROBOT_CHARACTER  = "../../../config/RoBotSkeletonData.csv";
// const DATA_TALENT_TREE      = "../../../config/RobotTalentData.csv";
// const DATA_TALENT_BASE      = "../../../config/TalentData.csv"

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
						console.log(row[i], parseFloat(row[i]));
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


// // 机器人基础数据
// allNameDict[DATA_ROBOT] = {
// 	'id_'             : 'id',
// 	'armor_'          : 'hp',       // 护甲（生命）
// 	'attack_'         : 'atk',      // 攻击力
// 	'defense_'        : 'def',      // 防御力
// 	'energy_'         : 'eng',      // 能量
// 	'energy_recover_' : 'engRec',   // 能量恢复
// 	'critrate_'       : 'critRate', // 暴击率
// 	'immune_crit_'    : 'critDef'   // 防爆率
// };

// allProcDict[DATA_ROBOT] = function(data) {
// 	let dict = {};
// 	for (let i in data) {
// 		let row = data[i];
// 		for (let key in row) {
// 			row[key] = parseInt(row[key]);
// 		}
// 		dict[row.id] = row;
// 	}
// 	data = dict;
// 	fs.open('../../data/RobotBaseCfg.json', 'w', (err, fd) => {
// 		if (err) {
// 			console.error(err);
// 			return;
// 		}
// 		fs.write(fd, JSON.stringify(data));
// 	});
// };

// // 机器人角色数据
// allNameDict[DATA_ROBOT_CHARACTER] = {
// 	'id_'                : 'id',
// 	'left_hand_id_'      : 'lHandId',    // 左手装备
// 	'right_hand_id_'     : 'rHandId',   // 右手装备
// 	'head_id_'           : 'headId',      // 头部装备
// 	'body_id_'           : 'bodyId',      // 胸部装备
// 	'left_arm_id_'       : 'lArmId',     // 左肩装备
// 	'right_arm_id_'      : 'rArmId',    // 右肩装备
// 	'left_leg_id_'       : 'lLegId',     // 左脚装备
// 	'right_leg_id_'      : 'rLegId',    // 右脚装备
// 	'characteristic_id_' : 'firstTalentId', // 初始天赋
// 	'proficiency_id_'    : 'degreeId',      // 熟练度索引
// 	'talent_id_'         : 'talentTreeId',  // 天赋树每层3选1（类似魔兽世界）
// 	'attributes_id_'     : 'attributesId' // 属性表索引（DATA_ROBOT）
// };

// allProcDict[DATA_ROBOT_CHARACTER] = function(data) {
// 	let dict = {};
// 	for (let i in data) {
// 		let row = data[i];
// 		for (let key in row) {
// 			row[key] = parseInt(row[key]);
// 		}
// 		dict[row.id] = row;
// 	}
// 	data = dict;
// 	fs.open('../../data/RobotCfg.json', 'w', (err, fd) => {
// 		if (err) {
// 			console.error(err);
// 			return;
// 		}
// 		fs.write(fd, JSON.stringify(data));
// 	});
// };

// // 机器人天赋数据
// allNameDict[DATA_TALENT_TREE] = {
// 	'id_'        : 'id',
// 	'value_1_1_' : 'value_1_1', // 第一层天赋（索引到DATA_TALENT_BASE）
// 	'value_1_2_' : 'value_1_2',
// 	'value_1_3_' : 'value_1_3',
// 	'value_2_1_' : 'value_2_1', // 第二层天赋
// 	'value_2_2_' : 'value_2_2',
// 	'value_2_3_' : 'value_2_3',
// 	'value_3_1_' : 'value_3_1', // 第三层天赋
// 	'value_3_2_' : 'value_3_2',
// 	'value_3_3_' : 'value_3_3',
// 	'value_4_1_' : 'value_4_1', // 第四层天赋
// 	'value_4_2_' : 'value_4_2',
// 	'value_4_3_' : 'value_4_3',
// 	'value_5_1_' : 'value_5_1', // 第五层天赋
// 	'value_5_2_' : 'value_5_2',
// 	'value_5_3_' : 'value_5_3',
// 	'value_6_1_' : 'value_6_1', // 第六层天赋
// 	'value_6_2_' : 'value_6_2',
// 	'value_6_3_' : 'value_6_3'
// };

// allProcDict[DATA_TALENT_TREE] = function(data) {
// 	let dict = {};
// 	for (let i in data) {
// 		let row = data[i];
// 		dict[row.id] = [
// 			parseInt(row['value_1_1']), parseInt(row['value_1_2']), parseInt(row['value_1_3']),
// 			parseInt(row['value_2_1']), parseInt(row['value_2_2']), parseInt(row['value_2_3']),
// 			parseInt(row['value_3_1']), parseInt(row['value_3_2']), parseInt(row['value_3_3']),
// 			parseInt(row['value_4_1']), parseInt(row['value_4_2']), parseInt(row['value_4_3']),
// 			parseInt(row['value_5_1']), parseInt(row['value_5_2']), parseInt(row['value_5_3']),
// 			parseInt(row['value_6_1']), parseInt(row['value_6_2']), parseInt(row['value_6_3'])
// 		];
// 	}
// 	data = dict;
// 	fs.open('../../data/TalentTreeCfg.json', 'w', (err, fd) => {
// 		if (err) {
// 			console.error(err);
// 			return;
// 		}
// 		fs.write(fd, JSON.stringify(data));
// 	});
// };

// // 天赋最终属性加成表
// allNameDict[DATA_TALENT_BASE] = {
// 	'id_'      : 'id',
// 	'type_1_'  : 'type_1',  // 属性类型
// 	'value_1_' : 'value_1', // 增加值
// 	'type_2_'  : 'type_2',
// 	'value_2_' : 'value_2',
// 	'type_3_'  : 'type_3',
// 	'value_3_' : 'value_3'
// };

// allProcDict[DATA_TALENT_BASE] = function(data) {
// 	let dict = {};
// 	for (let i in data) {
// 		let row = data[i];
// 		let newRow = [];
// 		if ( row['type_1'] != "" ) {
// 			newRow.push(parseInt(row['type_1']));
// 			newRow.push(parseInt(row['value_1']));
// 		}
// 		if ( row['type_2'] != "" ) {
// 			newRow.push(parseInt(row['type_2']));
// 			newRow.push(parseInt(row['value_2']));
// 		}
// 		if ( row['type_3'] != "" ) {
// 			newRow.push(parseInt(row['type_3']));
// 			newRow.push(parseInt(row['value_3']));
// 		}
// 		dict[row.id] = newRow;
// 	}
// 	data = dict;
// 	fs.open('../../data/TalentCfg.json', 'w', (err, fd) => {
// 		if (err) {
// 			console.error(err);
// 			return;
// 		}
// 		fs.write(fd, JSON.stringify(data));
// 	});
// };

parseAllConfig();

