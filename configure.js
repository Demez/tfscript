var jsonfile = require('jsonfile');

var config = jsonfile.readFileSync('data/config.json');
config.gameDirectory.win32 = process.argv[2];
jsonfile.writeFileSync('data/config.json', config);
