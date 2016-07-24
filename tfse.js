var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var writeFile = require('fs').writeFile;
var Tail = require('tail').Tail;
var EventEmitter = require('events').EventEmitter;

var LINUX = (process.platform == 'linux');
var WIN32 = (process.platform == 'win32');

var TF2_FOLDER = process.env.HOME + '/.local/share/Steam/steamapps/common/Team Fortress 2/tf';
var TF2_STDOUT = TF2_FOLDER + '/console.log';
var TF2_STDIN  = TF2_FOLDER + '/cfg/stdin.cfg';

var KILL_REGEX = /(.+) killed (.+) with (.+)\.( \(crit\))?/;

function TFScriptExtender() {
	EventEmitter.call(this);
	var that = this;
	this.broken = false;
	console.log('TF2 Script Extender by nullifiedcat');
	if (!LINUX && !WIN32) {
		console.log('TF2 Script Extender cannot be run on that operating system:', process.platform);
		this.broken = true;
		return;
	}
	if (LINUX) {
		this.window = execSync('xdotool search --class hl2_linux').toString().replace('\n', '');
		if (that.window) {
			console.log('TF2 Window found:', that.window);
		} else {
			console.log('TF2 Script Extender could not locate Team Fortress 2 window');
			this.broken = true;
			return;
		}
	}
	// Console I/O
	this.tail = new Tail(TF2_STDOUT);
	that.tail.on('line', function(data) {
		that.emit('line', data);
		if (KILL_REGEX.test(data)) {
			var x = KILL_REGEX.exec(data);
			that.emit('kill', x[1], x[2], x[3], !!x[4]);
		}
	});
	this.send = function send(command) {
		writeFile(TF2_STDIN, command);
		if (LINUX) {
			exec('xdotool type --window ' + that.window + ' =');
		} else {
			exec('cscript win32sendkeys.vbs =');
		}
	}
}

TFScriptExtender.prototype.__proto__ = EventEmitter.prototype;

module.exports = TFScriptExtender;


