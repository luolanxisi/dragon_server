"use strict";


class MapBuild {
	constructor(type) {
		this.type = type;
	}

	pack() {
		let ret = {
			type : this.type
		};
		return ret;
	}
}

MapBuild.TYPE_CASTLE = 1;
MapBuild.TYPE_CASTLE_WALL = 2;
MapBuild.TYPE_FORT = 3;

module.exports = MapBuild;

