var _ = require('underscore');
var jsonfile = require('jsonfile');

function ModTaunt(se, config) {
	var that = this;
	this.se = se;
	this.config = config;
	this.buffer = [];
	this.groups = jsonfile.readFileSync('data/groups.json');
	this.language = jsonfile.readFileSync('data/' + config.language + '.json');
	this.killsOnServer = 0;
	this.maps = {};
	se.on('kill', function(killer, victim, weapon, crit) {
		if (killer != that.se.username) return;
		var msg = that.generateKillMessage(killer, victim, weapon, crit);
		if (msg != '')
			that.buffer.push(msg);
	});
	this.nextMessage = function nextMessage() {
		if (that.buffer.length)
			that.se.send('say "' + that.buffer.pop().replace(/"/g, "'") + '"');
	}
	this.sendSpam = function sendSpam() {
		if (that.killsOnServer > that.config.promotionMinFrags)
			that.buffer.push(_.sample(that.language.promotion));
	}
	var groups = this.groups;
	var maps = this.maps;
	var language = this.language;
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
	this.generateKillMessage = function generateKillMessage(killer, victim, weapon, crit) {
		var format = '';
		var language = that.language;
		var config = that.config;
		var maps = that.maps;
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
	setInterval(that.nextMessage, config.bufferFlushRate);
}

module.exports = ModTaunt;
