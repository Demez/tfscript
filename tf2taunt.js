var argv = require('process').argv;
var _ = require('underscore');
var jsonfile = require('jsonfile');
var TFScriptExtender = require('./tfse.js');

var buffer = [];

var config = jsonfile.readFileSync('./config.json');
var groups = jsonfile.readFileSync('./groups.json');
var language = jsonfile.readFileSync('./' + config.language + '.json');
var name = 0;

var ScriptExtender = new TFScriptExtender();

var STATUS_RE = /"(.+)"\s+(\[U\:\d\:\d+\])/;

ScriptExtender.on('line', function(line) {
	if (typeof name === 'string') return;
	if (line.indexOf(config.uid) > 0) {
		var x = STATUS_RE.exec(line);
		console.log('Got name!', x[1]);
		name = x[1];
	}
});

ScriptExtender.on('kill', function(killer, victim, weapon, crit) {
	if (typeof name !== 'string') {
		ScriptExtender.send('status');
	}
	if (killer == name) {
		var msg = generate_kill_message(killer, victim, weapon, crit);
		if (msg != '')
			push_message(msg);
	}
});

function push_message(msg) {
	buffer.push(msg);
}

function pop_message() {
	if (buffer.length) {
		ScriptExtender.send('say "' + buffer.pop().replace(/"/g, '\'') + '"');
	}
}

setInterval(pop_message, config.bufferFlushRate);

var maps = {};

for (var group in groups) {
	_.each(groups[group], function(weapon) {
		if (language[group]) {
			if (!maps[weapon])
				maps[weapon] = [];
			maps[weapon].push(group);
		}
		if (language[group + '&']) {
			if (!maps[weapon + '&'])
				maps[weapon + '&'] = [];
			maps[weapon + '&'].push(group + '&');
		}
	});
}

function generate_kill_message(killer, victim, weapon, crit) {
	var format = '';
	if (crit) {
		if (language[weapon + '&'] && Math.random() < config.phaseSkipChance) {
			format = _.sample(language[weapon + '&']);
		} else if (maps[weapon + '&'] && Math.random() < config.phaseSkipChance) {
			format = _.sample(language[_.sample(maps[weapon + '&'])]);
		} else if (language['*&']) {
			format = _.sample(language['*&']);
		}
	} else {
		if (language[weapon] && Math.random() < config.phaseSkipChance) {
			format = _.sample(language[weapon]);
		} else if (maps[weapon] && Math.random() < config.phaseSkipChance) {
			format = _.sample(language[_.sample(maps[weapon])]);
		} else if (language['*']) {
			format = _.sample(language['*']);
		}
	}
	return format.replace(/\$1/g, victim).replace(/\$2/g, weapon).replace(/\$3/g, killer);
}
