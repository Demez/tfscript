var exec = require('child_process').exec;
var ScriptExtender = require('./../tfse');

var ModQuake = {
	init: function init() {
		this.playsound = (process.platform == 'win32' ? 'playsound' : 'aplay');
		this.streakSounds = '0 doublekill triplekill 0 multikill rampage killingspree 0 dominating 0 unstoppable 0 megakill 0 ultrakill eagleeye ownage ludicrouskill headhunter whickedsick monsterkill 0 holyshit godlike'.split(' ');
		ScriptExtender.on('kill', (function(killer, victim, weapon, crit) {
			if (killer == ScriptExtender.name) {
				this.playSound();
			}
		}).bind(this));
	},
	playSound: function playSound() {
		if (ScriptExtender.killStreak > 24 || this.streakSounds[ScriptExtender.killStreak - 1] != '0') {
			if (ScriptExtender.killStreak > 24) {
				exec(this.playsound + ' sound/' + this.streakSounds[23] + '.wav');
			} else {
				exec(this.playsound + ' sound/' + this.streakSounds[ScriptExtender.killStreak - 1] + '.wav');
			}
		}
	}
};

function ModQuake(se) {
	function playSound() {
		console.log('streak> ' + se.killStreak);
		if (se.killStreak > 24 || that.streakSounds[se.killStreak - 1] != '0') {
			if (se.killStreak > 24) {
				// Sanitize? phew
				exec(that.playsound + ' sound/' + that.streakSounds[23] + '.wav');
			} else {
				exec(that.playsound + ' sound/' + that.streakSounds[se.killStreak - 1] + '.wav');
			}
		}
	}
	se.on('kill', function(killer, victim, weapon, crit) {
		if (killer == se.username) {
			playSound();
		}
	});
}

module.exports = ModQuake;
