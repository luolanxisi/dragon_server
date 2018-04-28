"use strict";

const net = require('net');
const fs = require('fs');
const child_process = require('child_process');
const WebSocket = require('ws');

global.ROOT_DIR = __dirname +"/";

const BucketArray = require(ROOT_DIR +'lib/collection/BucketArray.js');
const RpcCallback = require(ROOT_DIR +'lib/RpcCallback.js');
const instruct = require(ROOT_DIR +'lib/ServerInstruct.js').getDict();
const srvCfg = require(ROOT_DIR +'config/server_config.json');
const protoTrans = require(ROOT_DIR +'model/network/Proto').getTransDict();
const protocolType = require(ROOT_DIR +'model/network/Proto').getTypeDict();

global.ServerMgr = require(ROOT_DIR +'lib/ServerMgr.js').getInst();
global.proto = require(ROOT_DIR +'model/network/Proto').getDict();


// const port = process.argv[2];
// const srvId = process.argv[2];

// 每个Application代表一个服务端进程
function Application() {
	this.rpc = new Rpc();
	this.srvId = parseInt(process.argv[2]);
	let srvType = process.argv[3];
	let port = process.argv[4];
	let clientPort = process.argv[5];
	createRpcServer(port, function(err, res) {
		if (err) {
			aux.error(null, "start rpc server error", err);
			return;
		}
		aux.log(null, 'rpc server ['+ srvType +'] start listen', port);
		// 
		if ( clientPort != "undefined" ) {
			createClientServer(clientPort, function(err, res) {
				if (err) {
					aux.error(null, "start rpc server error", err);
					return;
				}
				aux.log(null, 'game server ['+ srvType +'] start listen', clientPort);
				process.send({ ins: instruct.START_SERVER_FINISH, srvId: App.srvId});
			});
		}
		else {
			process.send({ ins: instruct.START_SERVER_FINISH, srvId: App.srvId});
		}
	});
}

Application.prototype.callRemote = function(procChain, dispatchId, msg, cb) {
	let arr = procChain.split('.');
	let srvType = arr[0];
	let remoteName = arr[1];
	let funcName = arr[2];
	let server = ServerMgr.getByDispatch(srvType, dispatchId);
	if ( server.id == App.srvId ) {
		this.rpc.remoteTypeDict[srvType][remoteName][funcName](null, msg, cb);
	}
	else {
		packReply(msg, protocolType.SERVER_REMOTE_CALL, cb);
		msg._sr.pc = procChain;
		server.sendString(JSON.stringify(msg));
	}
}

function packReply(msg, type, cb) {
	let cbId = App.rpc.genCb(cb);
	msg._sr = {
		type : type,
		sid  : App.srvId,
		cbId : cbId
	};
	return msg;
}

// 分服、回掉处理
function Rpc() {
	// this.srvType = process.argv[3];
	this.handleTypeDict = {};
	this.remoteTypeDict = {};
	this.lifeCyc = null;
	this.cbList = new BucketArray(); // 远程调用回调函数
}

Rpc.prototype.init = function() {
	// 读取所有的handle和remote
	let server = ServerMgr.getById(App.srvId);
	this.readHandle(server.getType());
	this.readRemote(server.getType());
	this.readLifeCyc(server.getType());
	// server端rpc调用
	ServerMgr.regDispatch('web');
	ServerMgr.regDispatch('connector');
	ServerMgr.regDispatch('player');
	ServerMgr.regDispatch('map');
}

Rpc.prototype.readHandle = function(srvType) {
	let handleDict = {};
	this.handleTypeDict[srvType] = handleDict;
	let dir = ROOT_DIR +"servers/"+ srvType +"/handle";
	if (!fs.existsSync(dir)) {
		return;
	}
	let files = fs.readdirSync(dir);
	for (let i in files) {
		let file = files[i];
		if ( file.indexOf("\.js") == -1 ) {
			aux.error(null, "File in handle dir mush *.js :", file);
			continue;
		}
		let filePath = dir +"/"+ file;
		let Handle = require(filePath);
		let handleName = file.slice(0, -3);
		let handle = new Handle();
		handleDict[handleName] = handle;
	}
}

Rpc.prototype.readRemote = function(srvType) {
	let remoteDict = {};
	this.remoteTypeDict[srvType] = remoteDict;
	let dir = ROOT_DIR +"servers/"+ srvType +"/remote";
	if (!fs.existsSync(dir)) {
		return;
	}
	let files = fs.readdirSync(dir);
	for (let i in files) {
		let file = files[i];
		if ( file.indexOf("\.js") == -1 ) {
			aux.error(null, "File in remote dir mush *.js :", file);
			continue;
		}
		let filePath = dir +"/"+ file;
		let Remote = require(filePath);
		let remoteName = file.slice(0, -3);
		let remote = new Remote();
		remoteDict[remoteName] = remote;
		for (let funcName in remote) { // 以后需要分是否跨进程调用
			let orginFunc = remote[funcName];
			remote[funcName] = function(args) {
				orginFunc.apply(remote, args);
			}
		}
	}
}

Rpc.prototype.readLifeCyc = function(srvType) {
	let file = ROOT_DIR +"servers/"+ srvType +"/LifeCyc.js";
	if (!fs.existsSync(file)) {
		return;
	}
	this.lifeCyc = require(file);
}

Rpc.prototype.genCb = function(cb) {
	let rpcCallback = new RpcCallback();
	this.cbList.add(rpcCallback);
	rpcCallback.setCb(cb);
	return rpcCallback.getId();
}

Rpc.prototype.runCb = function(cbId, msg) { // 对于handle是buf，对于remote是msg
	let rpcCallback = this.cbList.remove(cbId);
	if ( msg.errCode ) {
		rpcCallback.cb(msg);
	}
	else {
		rpcCallback.cb(null, msg);
	}
}

function fitToServerHandle(clientSocket, session, buf, cmd) {
	let fitBuf = BufferPool.createBuffer();
	fitBuf.writeInt16BE(0); // len
	fitBuf.writeUInt8(protocolType.SERVER_HANDLE_CALL);
	fitBuf.writeInt16BE(cmd);
	// 新增协议，服务器id、回调函数id
	fitBuf.writeInt16BE(App.srvId);
	let cbId = App.rpc.genCb(function(err, buf) {
		if (err) {
			aux.error(null, "Error in fitToServerHandle", err);
		}
		clientSocket.write(buf.sliceRawBuffer());
	});
	fitBuf.writeInt16BE(cbId);
	fitBuf.writeUInt32BE(session.roleId); // 
	// 跳过客户端协议5字节头文件写入剩余内容
	fitBuf.writeBuffer(buf, 5);
	return fitBuf;
}

// ======== 与master进行管道通讯 ========

process.on('message', (msg) => {
	// aux.log(null, 'CHILD got message:', msg);
	switch (msg.ins) {
		case instruct.STOP:
			let lifeCyc = App.rpc.lifeCyc;
			if (lifeCyc == null || lifeCyc.beforeShutdown == null) {
				process.send({ ins: instruct.STOP, msg: 'close finish' });
				process.exit(1)
				return;
			}
			lifeCyc.beforeShutdown(App, function(err, res) {
				if (err) {
					aux.error(null, "Close server error:", err);
				}
				process.send({ ins: instruct.STOP, msg: 'close finish' });
				process.exit(1)
			});
			break;
		case instruct.SYNC_SERVER_LIST:
			ServerMgr.fromData(msg.servers);
			ServerMgr.setCurrentServer(App.srvId);
			App.rpc.init();
			ServerMgr.each(function(srv) {
				if ( srv.id == App.srvId ) {
					return;
				}
				// 与其他socket创建连接
				const ws = new WebSocket('ws://127.0.0.1:'+ srv.port);
				ws.on('open', function() {
					srv.setSocket(ws);
				});
				ws.on('message', function(msgStr) { // rpc handle/remote back receive
					let msg = JSON.parse(msgStr);
					let sysRpc = msg._sr;
					delete(msg._sr);
					App.rpc.runCb(sysRpc.cbId, msg);
				});
			});
			//
			if (ServerMgr.getCurrentServer().type == "connector") {
				global.SessionMgr = require(ROOT_DIR +'lib/SessionMgr.js').getInst();
			}
			break;
	}
});


function createRpcServer(port, cb) {
	const ws = new WebSocket.Server({ port: port });
	ws.on('connection', function(client, req) {
		//
		client.on('message', function(msgStr) {
			try {
				let msg = JSON.parse(msgStr);
				switch (msg._sr.type) {
					case protocolType.SERVER_REMOTE_CALL: // rpc call receive
						procRemoteWithSR(msg, client);
						break;
					case protocolType.SERVER_HANDLE_CALL:
						procHandleWithSR(msg, client);
						break;
				}
			} catch (e) {
				aux.log(null, 'rpc server ('+ port +') error:', e);
			}
		});
	});
	process.nextTick(cb);
}


function procRemoteWithSR(msg, client) {
	let sysRpc = msg._sr;
	delete(msg._sr);
	//
	let arr = sysRpc.pc.split('.');
	let srvType = arr[0];
	let remoteName = arr[1];
	let funcName = arr[2];
	let remote = App.rpc.remoteTypeDict[srvType][remoteName];
	remote[funcName]([msg, function(err, ret) { // 原remote已被包装
		if ( err ) {
			ret = err;
		}
		ret._sr = sysRpc;
		client.send(JSON.stringify(ret));
	}]);
}

function procHandleWithSR(msg, client) {
	let sysRpc = msg._sr;
	delete(msg._sr);
	//
	let arr = protoTrans[msg.cmd].split('.');
	let srvType = arr[0];
	let handleName = arr[1];
	let funcName = arr[2];
	let handle = App.rpc.handleTypeDict[srvType][handleName];
	handle[funcName].call(handle, sysRpc.pid, msg, function(err, ret, close) {
		if ( err ) {
			ret = err;
		}
		ret.cmd = msg.cmd;
		ret._sr = sysRpc;
		client.send(JSON.stringify(ret));
	}, client);
}

function procHandle(msg, client) {
	let arr = protoTrans[msg.cmd].split('.');
	let srvType = arr[0];
	let handleName = arr[1];
	let funcName = arr[2];
	let handle = App.rpc.handleTypeDict[srvType][handleName];
	handle[funcName].call(handle, client.pid, msg, function(err, ret, close) {
		if ( err ) {
			ret = err;
		}
		ret.cmd = msg.cmd;
		client.send(JSON.stringify(ret));
	}, client);
}


function createClientServer(port, cb) {
	const ws = new WebSocket.Server({ port: port });
	ws.on('connection', function(client, req) {
		//
		client.on('message', function(msgStr) {
			try {
				let msg = JSON.parse(msgStr);
				aux.log(null, msg, protoTrans[msg.cmd]);
				//
				if (global.SessionMgr != null) { // [connector]
					if ( client.pid == null ) { // [connector] 直连，如：login
						procHandle(msg, client);
					}
					else { // other
						let arr = protoTrans[msg.cmd].split('.');
						let srvType = arr[0];
						let server = ServerMgr.getByDispatch(srvType, client.pid);
						if (server.id == App.srvId) { // 直接处理
							procHandle(msg, client);
						}
						else { // [connector] rpc转发到其他 [server]
							packReply(msg, protocolType.SERVER_HANDLE_CALL, function(err, ret) {
								if ( err ) {
									ret = err;
								}
								ret.cmd = msg.cmd;
								delete ret._sr;
								client.send(JSON.stringify(ret));
							});
							msg._sr.pid = client.pid;
							server.sendString(JSON.stringify(msg));
						}
					}
				}
				else { // [web] 直连，如：ticket
					procHandle(msg, client);
				}
			} catch (e) {
				aux.log(null, 'client [game] error:', e);
			}
		});
	});
	process.nextTick(cb);
}

process.on('exit', (code) => {
	aux.log(null, `Child exited with code ${code}`);
});

process.on('close', (code, signal) => {
	aux.log(null, `child process terminated due to receipt of signal ${signal}`);
});


global.App = new Application();

// =================== 以下部分内容需要通过注册的形式给Application执行，因为GameServer只是在Master线程执行 ===================

// 游戏逻辑部分
global.Auxiliary   = require(ROOT_DIR +'lib/Auxiliary');
global.ErrorCode   = require(ROOT_DIR +'model/system/ErrorCode').getDict();
global.MysqlExtend = require(ROOT_DIR +'lib/MysqlExtend').getInst();

global.aux         = global.Auxiliary;

// ============================================================================================================================
