"use strict";

const util     = require('util');
const MapBuild = require(ROOT_DIR +'model/map/MapBuild');


class MapCastle extends MapBuild {
	constructor() {
		super(MapBuild.TYPE_CASTLE);
		this.hp = 0;
		this.lastAtkTime = 0;
	}

	pack() {
		let ret = super.pack();
		ret.hp = this.hp;
		ret.lastAtkTime = this.lastAtkTime;
		return ret;
	}
}

module.exports = MapCastle;

