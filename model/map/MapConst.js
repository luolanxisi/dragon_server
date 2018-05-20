"use strict";


module.exports.MAP_TILE_LINE = 1500;
module.exports.MAP_TILE_COLUMN = 1500;
module.exports.MAP_TOTAL_TILE = this.MAP_TILE_LINE * this.MAP_TILE_COLUMN;

module.exports.SCREEN_TILE_LINE = 32;
module.exports.SCREEN_TILE_COLUMN = 16;

module.exports.MAP_BUILD_CASTLE = 1;
module.exports.MAP_BUILD_FORT = 2;

module.exports.uniqueIndex = function(x, y) {
	return y * this.MAP_TILE_COLUMN + x;
}
