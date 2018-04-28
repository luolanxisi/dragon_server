"use strict";


module.exports = CardPool;

function CardPool(level) {
	this.pool4 = []; // 90%
	this.pool5 = []; // 10%
	this.level = level;
}

const pro = CardPool.prototype;


pro.add = function(cfg) {
	switch (cfg.star) {
		case 4:
			this.pool4.push(cfg);
			break;
		case 5:
			this.pool5.push(cfg);
			break;
	}
}

pro.random = function(hireType) {
	let ret = [];
	let times = 0;
	switch (hireType) {
		case 1:
			times = 1;
			break;
		case 2:
			times = 5;
			break;
	}
	//
	for (let i=0; i<times; ++i) {
		let randStar = aux.randomRange(0, 10) >= 9 ? 5 : 4;
		let cfg;
		switch (randStar) {
			case 4:
				cfg = this.pool4[aux.randomRange(0, this.pool4.length)];
				ret.push(cfg.id);
				break;
			case 5:
				cfg = this.pool5[aux.randomRange(0, this.pool5.length)]; 
				ret.push(cfg.id);
				break;
		}
	}
	return ret;
}

pro.getLevel = function() {
	return this.level;
}
