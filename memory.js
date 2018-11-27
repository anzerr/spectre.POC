/* eslint no-unused-vars: 0*/

module.exports = (stdlib, forgein, heap) => {
	'use asm';
	let simpleByteArray = new stdlib.Uint8Array(heap);
	let probeTable = new stdlib.Uint8Array(heap);
	let junk = 0;

	const init = () => {
		let i = 0;
		let j = 0;
		for (i = 0; (i | 0) < 16; i = (i + 1) | 0) {
			simpleByteArray[i | 0] = ((i | 0) + 1) | 0;
		}
		for (i = 0; (i | 0) < 30; i = (i + 1) | 0) {
			j = ((((i | 0) * 8192) | 0) + 0x1000000) | 0;
			simpleByteArray[(j | 0)] = 0x10;
		}
	};

	const vulCall = (index, sIndex) => {
		index = index | 0;
		sIndex = sIndex | 0;
		let arrSize = 0,
			j = 0;

		junk = probeTable[0] | 0;
		j = ((((sIndex | 0) * 8192) | 0) + 0x1000000) | 0;
		arrSize = simpleByteArray[(j | 0)] | 0;
		if ((index | 0) < (arrSize | 0)) {
			index = simpleByteArray[index | 0] | 0;
			index = ((index * 0x1000) | 0);
			junk = (junk ^ (probeTable[index] | 0)) | 0;
		}
	};

	const flush = () => {
		let i = 0, current = 0;
		for (i = 256; (i | 0) < 16640; i = (i + 1) | 0) {
			current = probeTable[((i | 0) * 512) | 0] | 0;
		}
	};
	return {vulCall: vulCall, init: init, flush: flush};
};
