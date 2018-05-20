"use strict";

const fs       = require('fs');
const Tile     = require(ROOT_DIR +'model/map/Tile');
const MapConst = require(ROOT_DIR +'model/map/MapConst');
const MapBuild = require(ROOT_DIR +'model/map/MapBuild');
const LandCfg  = require(ROOT_DIR +'data/LandCfg.json');
const MapData  = require(ROOT_DIR +'model/map/MapData').getInst();
const ExBuffer = require(ROOT_DIR +'lib/ExBuffer');

const MAP_DB_FILE      = ROOT_DIR +'db/MapDb.db';
const MAP_DB_TEMP_FILE = ROOT_DIR +'db/MapDb.db.temp';


module.exports.getInst = function () {
	if (ServerMgr.getCurrentServer().type != "map") {
		aux.log("Use map cmgr not in map process !!");
		return;
	}
	return instance;
};


function MapCmgr() {
	this.saveLock = false;
	this.saveWaitList = [];
	this.mapDatas = [];
	for (let y=0; y<MapConst.MAP_TILE_LINE; ++y) {
		this.mapDatas[y] = [];
		for (let x=0; x<MapConst.MAP_TILE_COLUMN; ++x) {
			this.mapDatas[y][x] = new Tile(x, y, MapData.getCfg(x, y));
		}
	}
	// 所属记录
	this.belongs = {}; // pid : { index : tile }
}

const pro = MapCmgr.prototype;

pro.fetchPlayerTile = function(pid) {
	let dict = this.belongs[pid];
	let arr = [];
	for (let i in dict) {
		let tile = dict[i];
		arr.push(tile.packLogin());
	}
	return arr;
}

pro.occupyTile = function(tile, pid) {
	this.removeBelongTile(tile);
	tile.occupy(pid);
	this.addBelongTile(tile);
}

pro.removeBelongTile = function(tile) {
	let dict = this.belongs[tile.pid];
	if (dict != null) {
		delete dict[tile.getIndex()];
	}
}

pro.addBelongTile = function(tile) {
	let dict = this.belongs[tile.pid];
	if (dict == null) {
		dict = {};
		this.belongs[tile.pid] = dict;
	}
	dict[tile.getIndex()] = tile;
}

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

pro.fillCastle = function(pid, x, y, tile) {
	tile.setPid(pid);
	if ( x == tile.x && y == tile.y ) {
		tile.createMapBuild(MapBuild.TYPE_CASTLE);
	}
	else {
		tile.createMapBuild(MapBuild.TYPE_CASTLE_WALL);
	}
	this.addBelongTile(tile);
	return tile;
}

pro.findRangeTile = function(centerX, centerY) {
	let arr = [];
	let x = centerX - MapConst.SCREEN_TILE_COLUMN;
	let y = centerY;
	let line = 0;
	let size = Math.floor(MapConst.SCREEN_TILE_LINE / 2);
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
	for (let i=0; i<MapConst.SCREEN_TILE_COLUMN; ++i) {
		if (x < 0 || y < 0 || x >= MapConst.MAP_TILE_COLUMN || y >= MapConst.MAP_TILE_LINE) {
			++x;
			--y;
			continue;
		}
		let tile = this.mapDatas[y][x];
		if ( tile.pid != 0 ) {
			arr.push(tile.pack());
		}
		++x;
		--y;
	}
}

pro.save = function(cb) {
	if ( this.saveLock ) {
		this.saveWaitList.push(cb);
		return;
	}
	this.saveLock = true;
	let self = this;
	this.saveDb(function(err) {
		self.saveLock = false;
		cb(err);
		aux.cbAll(self.saveWaitList, [err]);
	});
}

pro.saveDb = function(cb) {
	let self = this;
	let buffer = ExBuffer.create(Tile.packSize() * MapConst.MAP_TILE_COLUMN);
	//
	fs.open(MAP_DB_TEMP_FILE, 'w', function(err, fd) {
		if (err) {
			return cb();
		}
		//
		aux.serialEach(self.mapDatas, function(line, nextCb) {
			buffer.reset();
			let size = line.length;
			for (let i=0; i<size; ++i) {
				let tile = line[i];
				tile.toBuffer(buffer);
			}
			fs.write(fd, buffer.getRawBuffer(), function(err, res) {
				nextCb(err);
			});
		}, function(err) {
			if (err) {
				return cb(err);
			}
			fs.close(fd, function(err) {
				if (err) {
					return cb(err);
				}
				self.exchangeDb(cb);
			});
		});
	});
}

pro.exchangeDb = function(cb) {
	fs.rename(MAP_DB_TEMP_FILE, MAP_DB_FILE, function(err) {
		if (err) {
			return cb(err);
		}
		cb();
	});
}

// 只在lifeCyc调用
pro.load = function(cb) {
	let self = this;
	let buffer = Buffer.allocUnsafe(Tile.packSize() * MapConst.MAP_TILE_COLUMN);
	//
	fs.open(MAP_DB_FILE, 'r', function(err, fd) {
		if (err) {
			return cb(err);
		}
		aux.serialFor(0, MapConst.MAP_TILE_LINE, function(i, nextCb) {
			fs.read(fd, buffer, 0, buffer.length, null, function(err, bytesRead, data) {
				if (err) {
					return cb(err);
				}
				let exbuffer = ExBuffer.decorate(buffer);
				let line = self.mapDatas[i];
				let size = line.length;
				for (let j=0; j<size; ++j) {
					let tile = line[j];
					tile.fromBuffer(exbuffer);
				}
				nextCb();
			});
		}, function(err) {
			if (err) {
				return cb(err);
			}
			fs.close(fd, function(err) {
				if (err) {
					return cb(err);
				}
				cb();
			});
		});
	});
}


const instance = new MapCmgr();

