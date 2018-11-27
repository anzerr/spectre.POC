
class Time {

	constructor() {
		this._time = process.hrtime.bigint();
	}

	now() {
		return Number(process.hrtime.bigint() - this._time);
	}

	reset() {
		this._time = process.hrtime.bigint();
		return this;
	}

	start() {
		return this.reset().now();
	}

}

module.exports = {
	log: (...arg) => {
		return console.log(...arg);
	},

	Time: Time
};
