var config = require('./config');

config.init();
var cfg = config.initSub('tfscript', {
	mods: 'taunt quake'
});

if (process.argv[2] == 'setup') {
	cfg.gameDirectory = process.argv[3];
	process.exit(0);
}

var TFScriptExtender = require('./tfse');
TFScriptExtender.init();

var mods = cfg.mods.split(' ');
for (var i = 0; i < mods.length; i++) {
	console.log('Loading mod ' + mods[i]);
	var mod = require('./mods/' + mods[i]);
	mod.init();
}
