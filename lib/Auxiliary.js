"use strict";


exports.rttTime = function() {
	let myDate = new Date();
	return myDate.getTime() - time2017;
}

exports.retError = function(errCode, buf) {
	buf.writeUInt16BE(errCode, 0);
	return buf;
}

exports.netSend = function(role, buf) {
	role.getSocket().write(buf);
}

exports.cbAll = function(list, args) {
	for (let i in list) {
		list[i].apply(null, args);
	}
}

exports.normalCb = function(err, res) {
    if (err) {
    	console.error("rpc error:", err);
    }
}


var millsecond = Date.now();
var tickId = setInterval(function() {
	millsecond = Date.now();
}, 1000);

exports.now = function() {
    return Math.floor( millsecond / 1000 );
}

exports.createError = function(errCode, errDesc) {
	aux.log(errDesc);
    return {errCode:errCode, errDesc:errDesc};
}

exports.logError = function(err, res) {
	if (err) {
		return aux.log(err);
	}
}

exports.trace = function() {
	try {
		aa();
	} catch (err) {
		console.error(err);
	}
}

exports.log = function() {
	let date = new Date();
	date.setTime(millsecond);
	let dateStr = '['+ date.toLocaleString() +']';
	//
	let count = 0;
	let arr = [];
	arr.push(dateStr);
	for (let i in arguments) {
		arr.push(arguments[i]);
	}
	console.log.apply(console, arr);
}

exports.error = function() {
	if (arguments[0] == null) {
		let date = new Date();
		date.setTime(millsecond);
		arguments[0] = '['+ date.toLocaleString() +']';
	}
	console.error.apply(console, arguments);
}

// inclusive [min], exclusive [max]
exports.randomRange = function(max, min) {
	return Math.floor(Math.random()*(max-min)+min);
}


exports.cloneObject = function(obj) {
	let ret = {};
	for (let key in obj) {
		ret[key] = obj[key];
	}
	return ret;
}

exports.shuffleAlgorithm = function(list) {
	let size = list.length;
	for (let i=0; i<size; ++i) {
		let randVal = this.randomRange(0, size);
		let temp = list[i];
		list[i] = list[randVal];
		list[randVal] = temp;
	}
}

exports.parallelEach = function(list, eachCb, finalCb) {
	let count = 0;
	let firstErr = null;
	for (let i in list) {
		eachCb(list[i], function(err) {
			if (err != null && firstErr == null) {
				firstErr = err;
			}
			++count;
			if (count >= list.length) {
				finalCb(firstErr);
			}
		}, i);
	}
}


exports.serialEach = function(list, eachCb, finalCb) {
	serialEachRecursion(list, 0, list.length, eachCb, finalCb);
}

function serialEachRecursion(list, i, size, eachCb, finalCb) {
	if (i < size) {
		eachCb(list[i], function(err) {
			if (err) {
				finalCb(err);
			}
			else {
				serialEachRecursion(list, i+1, size, eachCb, finalCb);
			}
		});
	}
	else {
		finalCb();
	}
}


exports.serialFor = function(start, end, eachCb, finalCb) {
	serialForRecursion(start, end, eachCb, finalCb);
}

function serialForRecursion(i, end, eachCb, finalCb) {
	if (i < end) {
		eachCb(i, function(err) {
			if (err) {
				finalCb(err);
			}
			else {
				serialForRecursion(i+1, end, eachCb, finalCb)
			}
		});
	}
	else {
		finalCb();
	}
}

