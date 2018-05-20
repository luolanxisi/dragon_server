"use strict";

const net = require('net');
const readline = require('readline');
const WebSocket = require('ws');

global.ROOT_DIR = __dirname +"/";

const masterCfg = require(ROOT_DIR +'config/master_config.json');




const ws = new WebSocket('ws://127.0.0.1:'+ masterCfg.port);
ws.on('open', function() {
	console.error("connenct to server:", masterCfg.port);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on('line', (input) => {
		console.log(`Received: ${input}`);
		switch (input) {
			case 'stop':
				console.error('close server');
				ws.send("stop");
				break;
		}
	});
});
ws.on('message', function(msgStr) { // rpc handle/remote back receive
	console.log(msgStr);
});


