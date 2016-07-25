var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var writeFile = require('fs').writeFile;
var accessSync = require('fs').accessSync;
var Tail = require('tail').Tail;
var filetail = require('file-tail');
var EventEmitter = require('events').EventEmitter;
var jsonfile = require('jsonfile');

var LINUX = (process.platform == 'linux');
var WIN32 = (process.platform == 'win32');

var config = jsonfile.readFileSync('./config.json');
var TF2_FOLDER = LINUX ? config.gameDirectory.linux.replace('~', process.env.HOME) : config.gameDirectory.win32;
var TF2_STDOUT = TF2_FOLDER + '/console.log';
var TF2_STDIN  = TF2_FOLDER + '/cfg/stdin.cfg';

var KILL_REGEX = /(.+) killed (.+) with (.+)\.( \(crit\))?/;

function exists(name) {
	try {
		accessSync(name);
		return true;
	} catch (ex) {
		return false;
	}
}

function TFScriptExtender() {
	EventEmitter.call(this);
	var that = this;
	this.broken = false;
	if (!exists(TF2_STDOUT)) {
		console.log('Could not locate console.log! Check your tf2 folder path in config.json and -condebug option in Steam launch options!');
		this.broken = true;
		return;
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
		console.log('debug: got', data);
		that.emit('line', data);
		if (KILL_REGEX.test(data)) {
			var x = KILL_REGEX.exec(data);
			that.emit('kill', x[1], x[2], x[3], !!x[4]);
		}
	});
	this.send = function send(command) {
		writeFile(TF2_STDIN, command);
		if (LINUX) {
			exec('xdotool type --window ' + that.window + ' ' + config.interactionKey);
		} else {
			exec('keypress32 ' + config.interactionKey);
		}
	}
	console.log('TF2SE loaded');
}

TFScriptExtender.prototype.__proto__ = EventEmitter.prototype;

module.exports = TFScriptExtender;


