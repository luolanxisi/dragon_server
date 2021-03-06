"use strict";


const dict = {
	// 用户协议
	WEB_TICKET : 1,
	//
	PLAYER_LOGIN  : 2,
	// 地图协议
	MAP_SCREEN_DATA : 100,
	MAP_ATTACK      : 101,
	MAP_DEFEND      : 102,
	MAP_FARM        : 103,
	MAP_TRAIN       : 104,
	// 英雄协议
	HERO_HIRE : 200,
	HERO_MAKE_TEAM : 201,
	// 战斗协议
	BATTLE_RESULT : 300, // 派发战斗结果
	// 战报协议
	REPORT_FETCH_LIST : 400,
	REPORT_FETCH_DATA : 401
};

exports.getDict = function() {
	return dict;
}

// handle对应的字典可自行生成，关键是名字不能相同，且函数名要与key相同
const transDict = {};
//
transDict[dict.WEB_TICKET]     = "web.SteamHandle.WEB_TICKET";
//
transDict[dict.PLAYER_LOGIN]   = "connector.PlayerHandle.PLAYER_LOGIN";
//
transDict[dict.MAP_SCREEN_DATA] = "map.MapHandle.MAP_SCREEN_DATA";
transDict[dict.MAP_ATTACK]      = "player.MapHandle.MAP_ATTACK";
transDict[dict.MAP_DEFEND]      = "player.MapHandle.MAP_DEFEND";
transDict[dict.MAP_FARM]        = "player.MapHandle.MAP_FARM";
transDict[dict.MAP_TRAIN]       = "player.MapHandle.MAP_TRAIN";
//
transDict[dict.HERO_HIRE]      = "player.HeroHandle.HERO_HIRE";
transDict[dict.HERO_MAKE_TEAM] = "player.HeroHandle.HERO_MAKE_TEAM";
//
transDict[dict.REPORT_FETCH_LIST] = "report.ReportHandle.REPORT_FETCH_LIST";
transDict[dict.REPORT_FETCH_DATA] = "report.ReportHandle.REPORT_FETCH_DATA";


exports.getTransDict = function() {
	return transDict;
}


const typeDict = {
	CLIENT_REQUEST      : 1, // 正常客户端服务端通讯
	SERVER_HANDLE_CALL  : 10, // 转发handle调用
	SERVER_REMOTE_CALL  : 12 // 转发remote专用
};

exports.getTypeDict = function() {
	return typeDict;
}



