
const Leak = require('./leak.js'),
	util = require('./util.js');

const main = () => {
	util.log('started');
	let tmp = 'cat'.split('');
	let buffer = [];
	for (let i in tmp) {
		buffer.push(tmp[i].charCodeAt(0));
	}
	util.log(buffer);
	let map = [];
	let run = (x) => {
		let a = new Leak(8).check(buffer);
		for (let i in a) {
			let data = a[i].data;
			if (!map[i]) {
				map[i] = {};
			}
			let c = data;
			map[i][c] = (map[i][c] || 0) + 1;
			util.log(x + ' leak off=0x' + a[i].key.toString(16) +
				', byte=0x' + data.toString(16) + ' \'' + String.fromCharCode(data) + '\'' +
				((data !== buffer[i]) ? ' (error)' : ''));
		}
	};
	for (let i = 0; i < 50; i++) {
		run(i);
	}
	util.log(map);
	let best = [];
	for (let i in map) {
		let key = null, max = 0;
		for (let x in map[i]) {
			if (map[i][x] > max && x > 31 && x < 127) {
				max = map[i][x];
				key = x;
			}
		}
		best[i] = String.fromCharCode(key);
	}
	util.log('best', best.join(''));
	util.log('real', Buffer.from(buffer).toString());
};

main();
