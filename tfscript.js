var ModTaunt = require('./modtaunt');
var ModQuake = require('./modquake');
var TFScriptExtender = require('./tfse');

var jsonfile = require('jsonfile');

var ScriptExtender = new TFScriptExtender();

var CfgTaunt = jsonfile.readFileSync('data/modtaunt.json');
var CfgQuake = jsonfile.readFileSync('data/modquake.json');

if (CfgTaunt.enabled)
	var taunt = new ModTaunt(ScriptExtender, CfgTaunt);
if (CfgQuake.enabled)
	var quake = new ModQuake(ScriptExtender, CfgQuake);
