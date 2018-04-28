"use strict";

const HeroCfg  = require(ROOT_DIR +'data/HeroCfg.json');
const CardPool = require(ROOT_DIR +'model/hero/CardPool');


const instance = new CardPoolCmgr();

module.exports.getInst = function () {
	return instance;
};


function CardPoolCmgr() {
	this.pool = [];
	let cardPool;
	//
	cardPool = new CardPool(1);
	for (let i in HeroCfg) {
		let cfg = HeroCfg[i];
		cardPool.add(cfg);
	}
	// 
	this.pool.push(cardPool);
	//
}

const pro = CardPoolCmgr.prototype;


pro.get = function(index) {
	return this.pool[index-1];
}




