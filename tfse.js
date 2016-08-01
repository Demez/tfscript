var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var fs = require('fs');
var Tail = require('tail').Tail;
var filetail = require('file-tail');
var EventEmitter = require('events').EventEmitter;
var jsonfile = require('jsonfile');
var Config = require('./config');

var LINUX = (process.platform == 'linux');
var WIN32 = (process.platform == 'win32');

var cfg = new Config('config', {
	gameDirectory: 'UNSET',
	interactionKey: 'F11',
	resetStreakOnClassChange: true
});
cfg.read();
cfg.save();
var TF2_FOLDER = cfg.data.gameDirectory;
var TF2_STDOUT = TF2_FOLDER + '/console.log';
var TF2_STDIN  = TF2_FOLDER + '/cfg/stdin.cfg';

var KILL_REGEX = /(.+) killed (.+) with (.+)\.( \(crit\))?/;
var SUIC_REGEX = /(.+) suicided\./;
var UID_REGEX = /(\[U:\d:\d+\])/
var STATUS_REGEX = /"(.+)"\s+(\[U\:\d\:\d+\])/;
var CLASS_REGEX = /^tfse_class (scout|soldier|pyro|demoman|heavyweapons|engineer|medic|sniper|spy)$/;

var SERVERCHANGE = 'Team Fortress\nMap:\nPlayers:\nBuild:\nServer Number:'.split('\n');

function exists(name) {
	try {
		fs.accessSync(name);
		return true;
	} catch (ex) {
		return false;
	}
}

function TFScriptExtender() {
	EventEmitter.call(this);
	
	var that = this;
	this.broken = false;
	this.serverChangeStage = 0;
	this.killStreak = 0;
	this.usernameRecache = true;
	this.username = '';
	var config = cfg.data;
	
	if (!exists(TF2_STDOUT)) {
		console.log('Could not locate console.log! Check your tf2 folder path in config.json and -condebug option in Steam launch options!');
		this.broken = true;
		return;
	}
	if (!exists('data/uid.txt')) {
		console.log('uid.txt file not present; Please set your uid in uid.txt file! Instructions can be found in README.md');
		this.broken = true;
		return;
	}
	this.uid = fs.readFileSync('data/uid.txt').toString();
	if (!UID_REGEX.test(this.uid)) {
		console.log('Please set your uid in uid.txt file! Instructions can be found in README.md');
		this.broken = true;
		return;
	} else {
		var uidm = UID_REGEX.exec(that.uid);
		that.uid = uidm[1];
	}
	if (!LINUX && !WIN32) {
		console.log('Platform not supported:', process.platform);
		this.broken = true;
		return;
	}
	if (LINUX) {
		try {
			this.window = execSync('xdotool search --class hl2_linux').toString().replace('\n', '');
			console.log('TF2 Window found:', that.window);
		} catch (ex) {
			console.log('Could not locate Team Fortress 2 window');
			this.broken = true;
			return;
		}
	}
	// Console I/O
	if (LINUX) {
		this.tail = new Tail(TF2_STDOUT);
	} else {
		this.tail = filetail.startTailing(TF2_STDOUT);
	}
	that.tail.on('line', function(data) {	
		that.emit('line', data);
		if (data.indexOf('tfse_class ') == 0) {
			var x = CLASS_REGEX.exec(data);
			if (!x) return;
			that.emit('class', x[1]);
			if (that.config.resetStreakOnClassChange) {
				that.killStreak = 0;
			}
		}
		if (that.usernameRecache && data.indexOf(that.uid) > 0 && STATUS_REGEX.test(data)) {
			var x = STATUS_REGEX.exec(data);
			that.username = x[1];
			console.log('tfse> Username is', that.username);
			that.usernameRecache = false;
		}
		if (data.indexOf(SERVERCHANGE[that.serverChangeStage]) >= 0) {
			that.serverChangeStage++;
			if (that.serverChangeStage >= SERVERCHANGE.length) {
				// You've joined a new server
				that.emit('server-change');
				console.log('Server changed!');
				that.serverChangeStage = 0;
				that.usernameRecache = true;
				that.killStreak = 0;
			}
		} else {
			serverChangeState = 0;
		}
		if (KILL_REGEX.test(data)) {
			if (that.usernameRecache)
				that.send('status');
			var x = KILL_REGEX.exec(data);
			if (x[2] == that.username) {
				that.killStreak = 0;
			}
			if (x[1] == that.username) {
				that.killStreak++;
			}
			that.emit('kill', x[1], x[2], x[3], !!x[4]);
		}
		if (SUIC_REGEX.test(data)) {
			var x = SUIC_REGEX.exec(data);
			if (x[1] == that.username) {
				that.killStreak = 0;
			}
			that.emit('suicide', x[1]);
		}
	});
	this.send = function send(command) {
		console.log(' in>', command);
		fs.writeFile(TF2_STDIN, command);
		if (LINUX) {
			exec('xdotool key --window ' + that.window + ' ' + config.interactionKey);
		} else {
			exec('keypress32 ' + config.interactionKey);
		}
	}
	
	console.log('TF2SE loaded');
}

TFScriptExtender.prototype.__proto__ = EventEmitter.prototype;

module.exports = TFScriptExtender;


