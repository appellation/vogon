const EventEmitter = require('events');
const fsn = require('fs-nextra');
const path = require('path');

module.exports = class Loader extends Map {
	constructor(dir) {
		super();
		this.dir = dir;
		this.ready = false;
		this.e = new EventEmitter();

		this.load().then(() => {
			this.ready = true;
			this.e.emit('ready');
		}, e => this.e.emit('error', e));
	}

	async awaitReady() {
		if (!this.ready) await new Promise(r => this.e.once('ready', r));
	}

	async load(dir = this.dir) {
		const contents = await fsn.scan(dir);
		for (const [loc, stats] of contents) {
			if (stats.isFile() && path.extname(loc) === '.js') {
				this.set(path.basename(loc, '.js'), require(loc));
			}
		}
	}
};
