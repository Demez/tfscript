var jsonfile = require('jsonfile');

var Config = function Config(name, defaults) {
	var that = this;
	this.name = name;
	this.data = defaults || {};
	this.read = function read() {
		try {
			var cfg = jsonfile.readFileSync('data/' + name + '.json');
			for (key in cfg) {
				that.data[key] = cfg[key];
			}
		} catch (e) {
			return;
		}
	}
	that.save = function save() {
		jsonfile.writeFileSync('data/' + name + '.json', that.data, { spaces: 4 });
	}
}

module.exports = Config;
