var Config = require('./config');

var jsonfile = require('jsonfile');

if (process.argv[2] == 'setup') {
	var cfg = new Config('config');
	cfg.read();
	cfg.data.gameDirectory = process.argv[3];
	cfg.save();
	process.exit(0);
}

var TFScriptExtender = require('./tfse');
var ModTaunt = require('./modtaunt');
var ModQuake = require('./modquake');

var ScriptExtender = new TFScriptExtender();

var taunt = new ModTaunt(ScriptExtender);
var quake = new ModQuake(ScriptExtender);
