var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var fs = require('fs');
var Tail = require('tail').Tail;
var filetail = require('file-tail');
var EventEmitter = require('events').EventEmitter;
var jsonfile = require('jsonfile');
var config = require('./config');

var LINUX = (process.platform == 'linux');
var WIN32 = (process.platform == 'win32');

var cfg = config.initSub('tfse', {
	gameDirectory: 'UNSET',
	interactionKey: 'F11',
	resetStreakOnClassChange: true
});

var TF2_FOLDER = cfg.gameDirectory;
var TF2_OUT = TF2_FOLDER + '/console.log';
var TF2_IN  = TF2_FOLDER + '/cfg/stdin.cfg';

var RE_KILL = /^(.+) killed (.+) with (.+)\.( \(crit\))?$/;
var RE_SUICIDE = /^(.+) (suicided|died)\.$/;
var RE_UID = /(\[U:\d:\d+\])/
var	RE_STATUS = /"(.+)"\s+(\[U\:\d\:\d+\])/;
var RE_CLASS = /^tfse_class (scout|soldier|pyro|demoman|heavyweapons|engineer|medic|sniper|spy)$/;

var RE_STATUS_ADV = [
	/^hostname: (.+)$/, /* 1:hostname */
	/^version : \d+\/\d+ \d+ (?:in)?secure$/,
	/^udp\/ip  : [0-9:\.]+:(\d{1,5})  \(public ip: ([0-9\.]+)\)$/, /* 1:port,2:ip */
	/^steamid : \[.+\] \(\d+\)$/,
	/^account : (?:not )?logged in  \(.+\)$/,
	/^map     : (.+) at: -?\d+ x, -?\d+ y, -?\d+ z$/, /* 1:map */
	/^players : (\d+) humans, (\d+) bots \((\d+) max\)$/, /* 1:humans,2:bots,3:max */
	/^edicts  : \d+ used of \d+ max$/,
	/^tags    : (.+)$/, /* 1:tags */
	/^         Spawns Points Kills Deaths Assists$/,
	/^(?:Scout|Soldier|Pyro|Demoman|Heavy|Engineer|Medic|Sniper|Spy)(?:\s+\d+){5}$/,
	/^# userid name                uniqueid            connected ping loss state(?:  adr)?$/,
	/^# ([0-9 ]{6}) "(.+)"\s+(?:(\[U:\d:\d+\])\s+([0-9:]+)\s+\d+\s+\d+ |(BOT)\s+)(?:[a-z]+)(?:\s+[0-9\.:a-z]+)?$/ /* 1:id,2:name,3:steamid,4:bot,5:time */
];

var SERVERCHANGE = 'Team Fortress\nMap:\nPlayers:\nBuild:\nServer Number:'.split('\n');

var MSG_NO_OUT = 'Could not locate TF2\'s output file! Make sure you\'ve installed the script correctly.';
var MSG_NO_UID = 'Could not locate uid.txt file. Please follow README!';
var MSG_INVALID_UID = 'uid set in uid.txt is invalid! Please follow README!';
var MSG_PLATFORM = 'Platform not supported: ';
var MSG_NO_WINDOW = 'Could not locate TF2 window. Make sure TF2 is running and you have xdotool installed';

function exists(name) {
	try {
		fs.accessSync(name);
		return true;
	} catch (ex) {
		return false;
	}
}

var TFScriptExtender = {
	status: {
		_state: 0,
		_unsafe: {}
	},
	lineHandler: function(data) {
		this.emit('line', data);
		/* Parsing status data */
		var status = this.status;
		(function () {
			if (status._state < 4) {
				var m = data.match(RE_STATUS_ADV[status._state]);
				if (!m) {
					status._state = 0;
					return;
				}
				switch (status._state) {
				case 0:
					status._unsafe.hostname = m[1]; break;
				case 2:
					status._unsafe.port = m[1];
					status._unsafe.ip = m[2]; break;
				}
				status._state++;
			} else {
				if (status._state == 4) {
					status.hostname = status._unsafe.hostname;
					status.port = status._unsafe.port;
					status.ip = status._unsafe.ip;
					status.players = [];
				}
				for (var i = 4; i < RE_STATUS_ADV.length; i++) {
					var m = data.match(RE_STATUS_ADV[i]);
					if (!m && data != '') continue;
					switch (i) {
					case 5:
						status.map = m[1]; break;
					case 6:
						status.numPlayers = parseInt(m[1]);
						status.numBots = parseInt(m[2]);
						status.maxPlayers = parseInt(m[3]); break;
					case 8:
						status.tags = m[1]; break;
					case 12:
						if (m[5]) {
							status.players.push({
								id: parseInt(m[1]),
								name: m[2],
								bot: true
							});
						} else {
							status.players.push({
								id: parseInt(m[1]),
								name: m[2],
								steamid: m[3],
								time: m[4]
							});
						}
						break;
					}
					status._state++;
					return;
				}
				console.log('line break:'+data);
				status._state = 0;
				console.log(status);
			}
		})();
		
		if (data.indexOf('tfse_class ') == 0) {
			var x = RE_CLASS.exec(data);
			if (!x) return;
			this.emit('class', x[1]);
			if (cfg.resetStreakOnClassChange) {
				this.killStreak = 0;
			}
		}
		if (this.nameDirty && data.indexOf(this.uid) > 0 && RE_STATUS.test(data)) {
			var x = RE_STATUS.exec(data);
			this.name = x[1];
			this.nameDirty = false;
			console.log('name>', this.name);
		}
		if (data.indexOf(SERVERCHANGE[this.serverChangeStage]) >= 0) {
			this.serverChangeStage++;
			if (this.serverChangeStage >= SERVERCHANGE.length) {
				// You've joined a new server
				this.emit('server-change');
				console.log('tfse> Server changed');
				this.serverChangeStage = 0;
				this.nameDirty = true;
				this.killStreak = 0;
			}
		} else {
			this.serverChangeState = 0;
		}
		if (RE_KILL.test(data)) {
			if (this.nameDirty)
				this.send('status');
			var x = RE_KILL.exec(data);
			if (x[2] == this.name) {
				this.killStreak = 0;
			}
			if (x[1] == this.name) {
				this.killStreak++;
			}
			this.emit('kill', x[1], x[2], x[3], !!x[4]);
		}
		if (RE_SUICIDE.test(data)) {
			var x = RE_SUICIDE.exec(data);
			if (x[1] == this.name) {
				this.killStreak = 0;
			}
			this.emit('suicide', x[1]);
		}
	},
	init: function init() {
		EventEmitter.call(this);
		if (!LINUX && !WIN32)
			return this.die(MSG_PLATFORM + process.platform);
		if (!exists(TF2_OUT))
			return this.die(MSG_NO_OUT);
		if (!exists('data/uid.txt'))
			return this.die(MSG_NO_UID);
		var uidRaw = fs.readFileSync('data/uid.txt').toString();
		if (!RE_UID.test(uidRaw))
			this.die(MSG_INVALID_UID);
		else
			this.uid = RE_UID.exec(uidRaw)[1];
		if (LINUX) {
			try {
				this.window = execSync('xdotool search --class hl2_linux').toString().replace('\n', '');
			} catch (e) {
				return this.die(MSG_NO_WINDOW);
			}
		}
		if (LINUX)
			var tail = new Tail(TF2_OUT);
		else
			var tail = filetail.startTailing(TF2_OUT);
		tail.on('line', this.lineHandler.bind(this)); 
	},
	send: function(command) {
		console.log('send>', command);
		fs.writeFile(TF2_IN, command);
		if (LINUX) {
			exec('xdotool key --window ' + this.window + ' ' + cfg.interactionKey);
		} else {
			exec('keypress32 ' + cfg.interactionKey);
		}
	},
	die: function(reason) {
		console.log('fatal>', reason);
		this.broken = true;
	},
	broken: false,
	serverChangeStage: 0,
	killStreak: 0,
	nameDirty: true,
	name: '',
	uid: '',
	window: '' /* only on linux */
};

TFScriptExtender.__proto__ = EventEmitter.prototype;

module.exports = TFScriptExtender;


