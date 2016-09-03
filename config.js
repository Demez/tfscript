var jsonfile = require('jsonfile');

var config = {
	cache: {},
	init: function init() {
		try {
			this.cache = jsonfile.readFileSync('data/config.json');
		} catch (error) {}
		process.on('exit', () => {
			jsonfile.writeFileSync('data/config.json', this.cache, { spaces: 4 });
		});
		process.on('SIGINT', () => {
			process.exit(2);
		});
		process.on('uncaughtException', (e) => {
			console.log(e.stack);
			process.exit(1);
		});
	},
	initSub: function initSub(name, defaults) {
		if (!this.cache[name])
			this.cache[name] = {};
		for (key in defaults) {
			if (!this.cache[name][key])
				this.cache[name][key] = defaults[key];
		}
		return this.cache[name];
	}
};

module.exports = config;
