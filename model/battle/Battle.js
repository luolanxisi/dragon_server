"use strict";

const GuardCfg = require(ROOT_DIR +'data/GuardCfg.json');
const Hero     = require(ROOT_DIR +'model/hero/Hero');


module.exports = Battle;

function Battle(atkPid, defPid, attackTeam, defendTeam, tileX, tileY, teamId, battleTime) {
	this.atkPid = atkPid;
	this.defPid = defPid;
	this.teamId = teamId;
	this.tileX = tileX;
	this.tileY = tileY;
	this.battleTime = battleTime;
	//
	this.currentTurn = 0;
	this.winTeam = 0; // 0代表平局
	this.originAttackTeam = attackTeam;
	this.originDefendTeam = defendTeam;
	this.attackTeam = cloneNotNull(attackTeam);
	this.defendTeam = cloneNotNull(defendTeam);
	this.priorityQueue = [];
	this.actionData = [];
	for (let i=0; i<Battle.TOTAL_TURN; ++i) {
		this.actionData.push([]);
	}
	//
	this.atkTotalArmy = countTotalArmy(this.attackTeam);
	this.defTotalArmy = countTotalArmy(this.defendTeam);
}

const pro = Battle.prototype;

Battle.FLAG_ATTACKER = 1;
Battle.FLAG_DEFNEDER = 2;

Battle.TOTAL_TURN = 8;

Battle.RESULT_NO_BATTLE = 0;
Battle.RESULT_SUCC = 1; // 占领
Battle.RESULT_FAIL = 2; // 败退
Battle.RESULT_DRAW = 3; // 平局


Battle.playerFormTeam = function(heroMgr, team, flag) {
	let arr = [];
	let size = team.getSize();
	for (let i=0; i<size; ++i) {
		let heroId = team.get(i+1);
		let hero = heroMgr.get(heroId);
		if (hero != null) {
			let heroData = hero.cloneBattleData();
			heroData.flag = flag;
			arr.push(heroData);
		}
		else {
			arr.push({flag:flag});
		}
	}
	return arr;
}

Battle.guardFormTeam = function(guardId, flag) {
	let arr = [];
	let cfg = GuardCfg[guardId];
	for ( let i in cfg.heroes ) {
		let heroCfg = cfg.heroes[i];
		let hero = Hero.createInit(heroCfg.cfgId, cfg.heroLevel);
		let heroData = hero.cloneBattleData();
		heroData.id = parseInt(i) + 1;
		heroData.flag = flag;
		heroData.army = cfg.army;
		arr.push(heroData);
	}
	for (let i=arr.length; i<3; ++i) {
		arr.push({flag:flag});
	}
	return arr;
}


pro.calc = function() {
	for (let i in this.attackTeam) {
		if ( this.attackTeam[i].id != null ) {
			this.priorityQueue.push(this.attackTeam[i]);
		}
	}
	for (let i in this.defendTeam) {
		if ( this.defendTeam[i].id != null ) {
			this.priorityQueue.push(this.defendTeam[i]);
		}
	}
	//
	for (let i=1; i<=Battle.TOTAL_TURN; ++i) {
		this.currentTurn = i;
		let isEnd = this.calcTurn();
		if ( isEnd ) {
			break;
		}
	}
}


pro.calcTurn = function() {
	// 计算本回合出手先后
	this.priorityQueue.sort(function(heroA, heroB) {
		if ( heroA.speed > heroB.speed ) {
			return -1;
		}
		else if ( heroA.speed < heroB.speed ) {
			return 1;
		}
		else {
			return 0;
		}
	});
	//
	for (let i in this.priorityQueue) {
		let hero = this.priorityQueue[i];
		let isEnd = this.actionFlowline(hero, this.getFriendTeam(hero), this.getEnemeyTeam(hero));
		if (isEnd) {
			return isEnd;
		}
	}
	// 回收死亡将领，死亡将领还有指挥技能
	for (let i=this.priorityQueue.length-1; i>=0; --i) {
		let hero = this.priorityQueue[i];
		if ( hero.army <= 0 ) {
			this.priorityQueue.splice(i, 1);
		}
	}
}

// （被动、指挥、主动、普攻、追击）
pro.actionFlowline = function(hero, firends, enemies) {
	this.passiveSkill();
	this.commandSkill();
	if ( this.normalAttack(hero, enemies) ) {
		return true; // 结束
	}
	this.activeSkill();
	this.attachSkill();
	return false;
}

pro.passiveSkill = function() {

}

pro.commandSkill = function() {
	
}

pro.normalAttack = function(hero, enemies) {
	let targets = findEnemyTargets(hero.range, 1, enemies);
	let targetHero = targets[0];
	let damage = countDamage(hero.phyAtt, targetHero.phyDef, hero.army);
	let realityDamage = this.minusDamage(targetHero, damage);
	let actionData = [
		1, // 普攻
		hero.id,
		targetHero.id,
		realityDamage
	];
	this.addAction(actionData);
	if (damage != realityDamage) {
		return this.isFriendAllDead(targetHero);
	}
	return false;
}

pro.activeSkill = function() {
	
}

pro.attachSkill = function() {
	
}

pro.addAction = function(data) {
	let turnActions = this.actionData[this.currentTurn-1];
	turnActions.push(data);
}

pro.minusDamage = function(hero, damage) {
	if ( hero.army <= damage ) {
		let ret = hero.army;
		hero.army = 0;
		return ret;
	}
	else {
		hero.army -= damage;
		return damage;
	}
}

pro.isFriendAllDead = function(findHero) {
	let team = this.getFriendTeam(findHero);
	for (let i=0; i<team.length; ++i) {
		let hero = team[i];
		if (hero.army > 0) {
			return false;
		}
	}
	this.winTeam = getEnemyFlag(findHero);
	return true;
}

pro.getFriendTeam = function(hero) {
	if ( hero.flag == Battle.FLAG_ATTACKER ) {
		return this.attackTeam;
	}
	else {
		return this.defendTeam;
	}
}

pro.getEnemeyTeam = function(hero) {
	if ( hero.flag == Battle.FLAG_ATTACKER ) {
		return this.defendTeam;
	}
	else {
		return this.attackTeam;
	}
}

pro.getAttackResult = function() {
	switch ( this.winTeam ) {
		case Battle.FLAG_ATTACKER: // 占领
			return Battle.RESULT_SUCC;
		case Battle.FLAG_DEFNEDER: // 失败
			return Battle.RESULT_FAIL;
		default: // 平局
			return Battle.RESULT_DRAW;
	}
}

pro.getAttackRemain = function() {
	return extractRemainArmy(this.attackTeam);
}

pro.packServerData = function() {
	let result = this.getAttackResult();
	let ret = {
		result     : result,
		occupyTime : this.battleTime
	};
	if (result == Battle.RESULT_DRAW) {
		ret["remainArmies"] = extractRemainArmy(this.defendTeam);
	}
	return ret;
}

pro.packClientData = function() {
	let result = this.getAttackResult();
	let ret = {
		result : result,
		tileX  : this.tileX,
		tileY  : this.tileY,
		occupyTime : this.battleTime,
		attackTeam : this.originAttackTeam,
		defendTeam : this.originDefendTeam,
		actionData : this.actionData.slice(0, this.currentTurn)
	};
	return ret;
}

pro.packReportData = function() {
	let result = this.getAttackResult();
	let atkLeaderData = this.originAttackTeam[0];
	let defLeaderData = this.originDefendTeam[0];
	let atkInfo = {
		cfgId : atkLeaderData.cfgId,
		level : atkLeaderData.level,
		totalArmy : this.atkTotalArmy
	};
	let defInfo = {
		cfgId : defLeaderData.cfgId,
		level : defLeaderData.level,
		totalArmy : this.defTotalArmy
	};
	//
	let ret = {
		atkPid   : this.atkPid,
		defPid   : this.defPid,
		baseInfo : {
			result : result,
			tileX  : this.tileX,
			tileY  : this.tileY,
			atkInfo : atkInfo,
			defInfo : defInfo
		},
		teamId     : this.teamId,
		groupTime  : this.battleTime, // 实际时间并非这个（多次战斗情况）
		battleData : {
			attackTeam : this.originAttackTeam,
			defendTeam : this.originDefendTeam,
			actionData : this.actionData.slice(0, this.currentTurn)
		}
	};
	return ret;
}

pro.getOccupyTime = function() {
	return this.battleTime;
}


function extractRemainArmy(list) {
	let arr = [];
	for (let i in list) {
		let heroData = list[i];
		arr.push({
			id   : heroData.id,
			army : heroData.army
		});
	}
	return arr;
}

function countDamage(atk, def, atkArmy) {
	let damage = Math.floor(4.8 * Math.sqrt(atkArmy) * (200 + atk) / (200 + def));
	return damage;
}

function findEnemyTargets(range, num, enemies) {
	if (range < 1) {
		return null;
	}
	else if (range == 1) {
		return [findFirstAvailable(enemies)];
	}
	else {
		let optionList = cloneInRange(range, enemies);
		aux.shuffleAlgorithm(optionList);
		if (optionList.length <= num) {
			return optionList;
		}
		else {
			return optionList.slice(0, num);
		}
	}
}

function findFirstAvailable(enemies) {
	// 从前锋开始找第一个
	for (let i=enemies.length-1; i>=0; --i) {
		let hero = enemies[i];
		if ( hero.army > 0 ) {
			return enemies[i];
		}
	}
	return null;
}

function cloneInRange(range, list) {
	let arr = [];
	for (let i=list.length-1; i>=0; --i) {
		let hero = list[i];
		if ( hero.army > 0 ) {
			arr.push(list[i]);
		}
	}
	return arr;
}

function cloneNotNull(list) {
	let ret = [];
	for (let i in list) {
		if ( list[i].id != null ) {
			ret.push(aux.cloneObject(list[i]));
		}
	}
	return ret;
}

function getEnemyFlag(hero) {
	if ( hero.flag == Battle.FLAG_ATTACKER ) {
		return  Battle.FLAG_DEFNEDER;
	}
	else {
		return Battle.FLAG_ATTACKER
	}
}

function countTotalArmy(team) {
	let total = 0;
	for (let i in team) {
		let hero = team[i];
		total += hero.army;
	}
	return total;
}
