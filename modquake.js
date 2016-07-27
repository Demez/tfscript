function ModQuake(se, config) {
	var that = this;
	this.se = se;
	this.streakSounds = '0 doublekill triplekill 0 multikill rampage killingspree 0 dominating 0 unstoppable 0 megakill 0 ultrakill eagleeye ownage ludicrouskill headhunter whickedsick monsterkill 0 holyshit godlike'.split(' ');
	function playSound() {
		console.log(se.killStreak);
		if (se.killStreak > 24 || that.streakSounds[se.killStreak - 1] != '0') {
			if (se.killStreak > 24) {
				se.send('play ' + that.streakSounds[23]);
			} else {
				se.send('play ' + that.streakSounds[se.killStreak - 1]);
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
