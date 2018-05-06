"use strict";

const Tile = require(ROOT_DIR +'model/map/Tile.js');


const instance = new MapCmgr();

module.exports.getInst = function () {
	if (ServerMgr.getCurrentServer().type != "map") {
		aux.log(null, "Use map cmgr not in map process !!");
		return;
	}
	return instance;
};


function MapCmgr() {
	this.MAP_TILE_LINE = 1500;
	this.MAP_TILE_COLUMN = 1500;
	this.SCREEN_TILE_LINE = 32; // 正方行
	this.SCREEN_TILE_COLUMN = 16;
	//
	this.MAP_BUILD_CASTLE = 1;
	this.MAP_BUILD_FORT = 2;
	//
	this.mapDatas = [];
	for (let y=0; y<this.MAP_TILE_LINE; ++y) {
		this.mapDatas[y] = [];
		for (let x=0; x<this.MAP_TILE_COLUMN; ++x) {
			this.mapDatas[y][x] = new Tile(x, y, aux.randomRange(1, 13));
		}
	}
}

const pro = MapCmgr.prototype;


pro.getTile = function(x, y) {
	return this.mapDatas[y][x];
}

pro.addCastle = function(pid, x, y) {
	this.fillCastle(pid, x, y, this.mapDatas[y+1][x+1]);
	this.fillCastle(pid, x, y, this.mapDatas[y+1][x]);
	this.fillCastle(pid, x, y, this.mapDatas[y+1][x-1]);
	//
	this.fillCastle(pid, x, y, this.mapDatas[y][x+1]);
	this.fillCastle(pid, x, y, this.mapDatas[y][x]);
	this.fillCastle(pid, x, y, this.mapDatas[y][x-1]);
	//
	this.fillCastle(pid, x, y, this.mapDatas[y-1][x+1]);
	this.fillCastle(pid, x, y, this.mapDatas[y-1][x]);
	this.fillCastle(pid, x, y, this.mapDatas[y-1][x-1]);
}

pro.fillCastle = function(pid, x, y, tileData) {
	tileData.pid = pid;
	if (x == tileData.x && y == tileData.y ) {
		tileData.mb = 1; // map build type
		// tileData.rg = 2; // range
	}
	else {
		tileData.cx = x;
		tileData.cy = y;
	}
	return tileData;
}


pro.findRangeTile = function(centerX, centerY) {
	let arr = [];
	let x = centerX - this.SCREEN_TILE_COLUMN;
	let y = centerY;
	let line = 0;
	let size = Math.floor(this.SCREEN_TILE_LINE / 2);
	for (let i=0; i<size; ++i) {
		this.fetchTileLine(x, y, line, arr);
		++line;
		++x;
		this.fetchTileLine(x, y, line, arr);
		++y;
		++line;
	}
	return arr;
}

pro.fetchTileLine = function(originX, originY, line, arr) {
	let x = originX;
	let y = originY;
	for (let i=0; i<this.SCREEN_TILE_COLUMN; ++i) {
		if (x < 0 || y < 0 || x >= this.MAP_TILE_COLUMN || y >= this.MAP_TILE_LINE) {
			++x;
			--y;
			continue;
		}
		let tileData = this.mapDatas[y][x];
		if ( tileData.pid != 0 ) {
			if ( tileData.cx != null ) {
				let centerTile = this.mapDatas[tileData.cy][tileData.cx];
				if (tileData.pid != centerTile.pid) {
					arr.push(tileData);
				}
			}
			else {
				arr.push(tileData);
			}
		}
		++x;
		--y;
	}
}



