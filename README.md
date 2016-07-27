NOTE: Script is unfinished. More lines and groups should be added. Contributions are welcome!
Report all issues here on github, or send PM to nullifiedcat on reddit

# Edgy Killfeed Script
_that's what a lime scout would use!_

All lines are configurable. You can easily add new weapon groups, new lines for groups/specific weapons. Upcoming features include more customization, like weapon blacklists/whitelists, killstreaks, kill counters, etc.

If you want help me spreading the script, set `promotion` to `true` in `config.json`! (disabled by default) That will send promotional messages every 60 seconds (can be configured)

Windows version of script uses compiled AutoHotKey script to send keystrokes to Team Fortress 2 window

# Step-by-Step

## Windows

1. [Download package](https://github.com/nullifiedcat/tfscript/releases) with nodejs executable and script itself
2. Unzip the package to any folder
3. Run `install.bat`. It will ask for your `tf` folder (if your steam library is installed in non-default location). `tf` it should be located at `SteamLibrary\steamapps\common\Team Fortress 2\tf`
4. Put your `uid` in `data/uid.txt` file. Instructions on finding your `uid` are below
5. You are ready, but you might want to customize your messages or settings
6. Run the script with `start.bat`

## Linux (Ubuntu/Debian)

1. Install `nodejs` package (`sudo apt-get install nodejs`)
2. Install `xdotool` package (`sudo apt-get install xdotool`)
2. Clone this repository into any folder
3. Run `npm install` in that folder
4. Set your uid in `config.json` file. A method to find uid is described below
5. Right-click on Team Fortress 2 in Steam client, go to Properties, then Set Launch Options. Add `-condebug` there.
6. Open console in Team Fortress 2, type `bind F11 "exec stdin"`
7. If Team Fortress 2 is installed in non-default location, edit `gameDirectory` in `config.json` so it will point to right location
8. You are ready, but you might want to customize your messages or settings
9. Run the script with `node tfscript`

# How to find UID

1. Join any server or create your own (`map itemtest` in console)
2. Type `status` in console
3. Find a line with your name
4. Get your uid from that line
5. Put it into `config.json`

`uid` looks like `[U:1:111111111]`

# Updating the script

Just [download ZIP](https://github.com/nullifiedcat/tfscript/archive/master.zip) and unpack everything to your script folder (replace old files)

# Configuration

Configs are stored in `data` folder

`uid.txt` should contain your `uid`
`config.json` file contains tfse settings, like game folder and interaction key (don't change it unless you know what you are doing)
`modtaunt.json` contains tftaunt settings
`modquake.json` contains quake sounds settings
`english.json` file contains all the lines you'll say when killing someone
`groups.json` file contains weapon groups to use in language file (example: group `rockets` contains The Direct Hit, Black Box, etc..)

_note: & symbol means crit kill_

# Special Thanks

* __Sam__ for testing the script on Windows
* __Dragonisser__ for testing the script on Windows

# Planned features

* Killstreak announcing
* Weapon whitelist and blacklist modes, for example, announce only headshot-penetrate kills or melee kills
* Localization files updates
* Kill counters (soon)
* Rough class detection based on weapon used for last kill and triggers for it (not very soon)
* Possibly even more
* Proper weapon names as $2 (for example `Stickybomb Launcher` instead of `tf_projectile_pipe_remote`)

Stay tuned!
