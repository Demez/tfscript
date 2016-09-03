var _ = require('underscore');
var jsonfile = require('jsonfile');
var config = require('./../config');
var ScriptExtender = require('./../tfse')

var cfg = config.initSub('modtaunt', {
	phaseSkipChance: 0.85,
	bufferFlushRate: 800,
	promotion: false,
	promotionInterval: 60000,
	promotionMinFrags: 3,
	language: 'english',
	voiceAfterKillEnabled: true,
	voiceAfterKill: '2 6'
});

var ModTaunt = {
	init: function() {
		ScriptExtender.on('kill', (function(killer, victim, weapon, crit) {
			if (killer != ScriptExtender.name) return;
			var msg = this.generateKillMessage(killer, victim, weapon, crit);
			if (msg != '')
				this.buffer.push(msg);
			if (cfg.voiceAfterKillEnabled) {
				ScriptExtender.send('voicemenu ' + cfg.voiceAfterKill);
			}
		}).bind(this));
		var groups = this.groups;
		var language = this.language;
		var maps = this.maps;
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
		setInterval(this.nextMessage.bind(this), cfg.bufferFlushRate);
		if (cfg.promotion === true) {
			setInterval(this.sendSpam.bind(this), cfg.promotionInterval);
		}
	},
	buffer: [],
	groups: jsonfile.readFileSync('data/groups.json'),
	language: jsonfile.readFileSync('data/' + cfg.language + '.json'),
	killsOnServer: 0,
	maps: {},
	nextMessage: function nextMessage() {
		if (this.buffer.length)
			ScriptExtender.send('say "' + this.buffer.pop().replace(/"/g, "'") + '"');
	},
	sendSpam: function sendSpam() {
		if (this.killsOnServer > cfg.promotionMinFrags)
			this.buffer.push(_.sample(this.language.promotion));
	},
	format: function format(string, stuff) {
		return string.replace(/(%)?%(!)?({(.+?)}|.)(?:\((.+?)\))?/g, function(match, c0, c1, c2, c3, c4, offset, string) {
			if (c0) return match;
			if (c3) c2 = c3;
			if (!stuff.hasOwnProperty(c2)) return match;
			var x = (typeof stuff[c2] == 'function') ? stuff[c2](c4 ? c4.split(';;') : []) : stuff[c2];
			return c1 ? x.toUpperCase() : x;
		});
	},
	generateKillMessage: function generateKillMessage(killer, victim, weapon, crit) {
		var str = '';
		var language = this.language;
		var maps = this.maps;
		if (crit) {
			if (language[weapon + '&'] && Math.random() < cfg.phaseSkipChance) {
				str = _.sample(language[weapon + '&']);
			} else if (maps[weapon + '&'] && Math.random() < cfg.phaseSkipChance) {
				str = _.sample(language[_.sample(maps[weapon + '&'])]);
			} else if (language['*&']) {
				str = _.sample(language['*&']);
			}
		} else {
			if (language[weapon] && Math.random() < cfg.phaseSkipChance) {
				str = _.sample(language[weapon]);
			} else if (maps[weapon] && Math.random() < cfg.phaseSkipChance) {
				str = _.sample(language[_.sample(maps[weapon])]);
			} else if (language['*']) {
				str = _.sample(language['*']);
			}
		}
		return this.format(str, {
			"v": victim,
			"k": killer,
			"w": weapon,
			"rand": (arg) => { var min = parseInt(arg[0]), max = parseInt(arg[1]); return Math.floor(Math.random() * (max - min) + min); },
			"chance": (arg) => { var ch = parseFloat(arg[1]); return (Math.random() < ch) ? arg[0] : ''; }
		});
		//return '';
		//return format.replace(/\$1/g, victim).replace(/\$2/g, weapon).replace(/\$3/g, killer);
	}
}

module.exports = ModTaunt;
