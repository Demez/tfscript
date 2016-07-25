var argv = require('process').argv;
var _ = require('underscore');
var jsonfile = require('jsonfile');
var TFScriptExtender = require('./tfse.js');

var buffer = [];

var config = jsonfile.readFileSync('./config.json');
var groups = jsonfile.readFileSync('./groups.json');
var language = jsonfile.readFileSync('./' + config.language + '.json');
var name = 0;
var nameInvalidated = true;

console.log('TF2 Text Taunts by nullifiedcat');

if (config.uid == '') {
	console.log('uid not set! Please follow installation instructions in README');
	return;
}

var ScriptExtender = new TFScriptExtender();
if (ScriptExtender.broken) {
	console.log('Could not initialize TF2SE. The application will now exit.');
	process.exit(1);
}

var STATUS_RE = /"(.+)"\s+(\[U\:\d\:\d+\])/;

ScriptExtender.on('line', function(line) {
	if (line.indexOf('Server Number:') == 0) {
		nameInvalidated = true;
	}
	if (line.indexOf('recache_name') == 0) {
		ScriptExtender.send('status');
		nameInvalidated = true;
	}
	if (nameInvalidated) {
		if (line.indexOf(config.uid) > 0) {
			var x = STATUS_RE.exec(line);
			console.log('Got name!', x[1]);
			name = x[1];
			nameInvalidated = false;
		}
	}
});

ScriptExtender.on('kill', function(killer, victim, weapon, crit) {
	if (nameInvalidated) {
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

function send_spam() {
	push_message(_.sample(language.promotion));
}

setInterval(pop_message, config.bufferFlushRate);
if (config.promotion == true) {
	setInterval(send_spam, config.promotionInterval);	
}

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
