var exec = require('child_process').exec;

function ModQuake(se, config) {
	var that = this;
	this.playsound = (process.platform == 'win32' ? 'playsound' : 'aplay');
	this.se = se;
	this.streakSounds = '0 doublekill triplekill 0 multikill rampage killingspree 0 dominating 0 unstoppable 0 megakill 0 ultrakill eagleeye ownage ludicrouskill headhunter whickedsick monsterkill 0 holyshit godlike'.split(' ');
	function playSound() {
		console.log(se.killStreak);
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
