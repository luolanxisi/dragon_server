"use strict";

const fs = require('fs');
const aux = require("../../lib/Auxiliary");

const serverTargetFile = "../../data/MapData.txt";
const clientTargetFile = "../../../dragon_client/2dProject/Assets/MyGame/data/MapData.txt";

const totalTile = 1500 * 1500;
const clipLine = 100;
const clipColumn = 100;
const clipTile = clipLine * clipColumn;
const buff = Buffer.alloc(totalTile);

// 
const landDistribute = [
	1500, 1500, // level 1
	500, 500, 500, 500, 500,
	500, 500, 500, 500,
	375, 375, 375, 375,
	125, 125, 125, 125,
	50, 50, 50, 50,
	38, 38, 38, 38,
	25, 25, 25, 25,
	12, 12, 12, 12 // level 9
];

const clipList = [];

function main() {
	if ( fs.existsSync(serverTargetFile) ) {
		fs.unlinkSync(serverTargetFile);
	}
	if ( fs.existsSync(clientTargetFile) ) {
		fs.unlinkSync(clientTargetFile);
	}
	//
	let size = Math.floor(totalTile / clipTile);
	for (let i=0; i<size; ++i) {
		genClip();
	}
	writeData();
	console.log("Write successful!");
}

function genClip() {
	let arr = [];
	let size = landDistribute.length;
	for (let i=0; i<size; ++i) {
		let num = landDistribute[i];
		for (let j=0; j<num; ++j) {
			arr.push(i+1);
		}
	}
	//
	aux.shuffleAlgorithm(arr);
	clipList.push(arr);
}

var buffIdx = 0;

function writeData() {
	for (let i=0; i<clipLine; ++i) { // all line
		writeLine(i);
	}
	//
	writeFile(buff);
}

function writeLine(curLine) {
	for (let i=0; i<clipList.length; ++i) {
		let clip = clipList[i];
		writeClipLine(clip, curLine);
	}
}

function writeClipLine(clip, curLine) {
	for (let i=0; i<clipColumn; ++i) {
		let index = curLine * clipColumn + i;
		buff.writeInt8(clip[index], buffIdx);
		++buffIdx;
	}
}

function writeFile(buffer) {
	fs.writeFileSync(serverTargetFile, buffer, {flag:'a'});
	fs.writeFileSync(clientTargetFile, buffer, {flag:'a'});
}

// function writeClip(buff) {
// 	fs.writeFileSync(serverTargetFile, buff, {flag:'a'});
// 	fs.writeFileSync(clientTargetFile, buff, {flag:'a'});
// }

main();
