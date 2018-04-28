"use strict";

const net = require('net');
const fs = require('fs');
const childProcess = require('child_process');
const WebSocket = require('ws');

global.ROOT_DIR = __dirname +"/";

global.Auxiliary   = require(ROOT_DIR +'lib/Auxiliary');
global.aux         = global.Auxiliary;

const serverMgr = require(ROOT_DIR +'lib/ServerMgr.js').getInst();
const instruct = require(ROOT_DIR +'lib/ServerInstruct.js').getDict();
const masterCfg = require(ROOT_DIR +'config/master_config.json');
const srvCfg = require(ROOT_DIR +'config/server_config.json');


function Master() {
	this.srvDict = {};
	this.msgCount = 0;
	this.init();
}

const pro = Master.prototype;

pro.init = function() {
	let srvId = 0;
	for (let srvType in srvCfg) {
		let servers = srvCfg[srvType];
		for ( let i in servers ) {
			let cfg = servers[i];
			this.srvDict[cfg.port] = childProcess.spawn("node", [ROOT_DIR +"Application.js", srvId, srvType, cfg.port, cfg.clientPort], {stdio:[process.stdin, process.stdout, process.stderr, 'ipc']});
			serverMgr.add(srvId, srvType, cfg);
			++srvId;
			this.regMessage(this.srvDict[cfg.port], cfg.port);
		}
	}
}

pro.regMessage = function(child, port) {
	let self = this;
	child.on('message', (msg) => {
		switch (msg.ins) {
			case instruct.START_SERVER_FINISH:
				let server = serverMgr.getById(msg.srvId);
				server.setRunning(true);
				if ( serverMgr.isAllRunning() ) {
					// 给所有子进程发送服务器列表，并互相建立
					for (let i in this.srvDict) {
						let srv = this.srvDict[i];
						srv.send({ins: instruct.SYNC_SERVER_LIST, servers: serverMgr.toData()});
					}
				}
				break;
			case instruct.STOP:
				++this.msgCount;
				if (this.msgCount == serverMgr.getSize()) {
					aux.log('close all server', this.msgCount);
					process.exit(1)
				}
				break;
		}
	});
}

// // 与控制台通讯接口
// const server = net.createServer((client) => {
// 	aux.log('client connected');

// 	client.on('end', () => {
// 		aux.log('client disconnected');
// 	});

// 	client.on('error', (err) => {
// 		aux.log('client error:', err);
// 	});

// 	client.on('data', (data) => {
// 		try {
// 			switch (data.toString()) {
// 				case 'stop':
// 					for (let i in master.srvDict) {
// 						let srv = master.srvDict[i];
// 						aux.log('stop port:', i);
// 						srv.send({ins: instruct.STOP});
// 						// srv.kill('SIGHUP');
// 					}
// 					break;
// 			}
// 		} catch (e) {
// 			aux.log(e);
// 		}
// 	});

// 	//client.setNoDelay(true);
// });

// server.on('error', (err) => {
// 	aux.log('master server error:', err);
// });

// server.listen(masterCfg.port, () => {
// 	aux.log('master start listen', masterCfg.port);
// });

const ws = new WebSocket.Server({ port: masterCfg.port });
ws.on('connection', function(client, req) {
	aux.log(null, 'console admin connected');
	//
	client.on('message', function(msgStr) {
		try {
			switch (msgStr) {
				case 'stop':
					for (let i in master.srvDict) {
						aux.log(null, 'stop port:', i);
						let srv = master.srvDict[i];
						srv.send({ins: instruct.STOP});
					}
					break;
			}
		} catch (e) {
			aux.log(null, 'master server error:', e);
		}
	});
});
aux.log(null, 'master start listen', masterCfg.port);


process.on('close', (code, signal) => {
	aux.log(`master process terminated due to receipt of signal ${signal}`);
});


const master = new Master();

module.exports.getInst = function() {
	return master;
}
