NOTE: Script is unfinished. More lines and groups should be added. Contributions are welcome!

# tf2taunt
A single script to make salt pour from everyone you play with

# Download

[Releases page](https://github.com/nullifiedcat/tf2taunt/releases) contains ZIP archive with already packaged ready-to-go windows release. If you don't want to run questionable exe files or are using linux, clone this repository and run ```npm install``` in that folder. Also you'll need to have [node.js](https://nodejs.org/) installed. Click the link to download node.js package or install it using apt package manager on linux:
```sudo apt-get install nodejs```

# Installation

Add ```-condebug``` into your Team Fortress 2 launch options in Steam client (Right-Click on Team Fortress 2 -> Properties -> Set Launch Options)

If Steam is installed in non-default location, tf2taunt will ask you to provide path to ```tf``` folder

You'll need to write ```bind = "exec stdin"``` (note: key '=' can be changed to any other key in ```config.json```)

To run the script from cloned repository, type ```nodejs tf2taunt``` or ```node tf2taunt``` in terminal or cmd (windows). To open cmd, press ```Win+R``` and type ```cmd```.
Then, follow the steps in console.

## Windows
Note: tf2taunt uses Windows Shell Host script to communicate with Team Fortress 2. Script can be found at ```win32sendkeys.vbs```
## Linux (Debian/Ubuntu)
tf2taunt requires ```xdotool``` to be installed. To install it, simply write ```sudo apt-get install xdotool``` in your terminal.

# Configuration

The application will ask you for your UID. It looks like [U:1:306902***]. To retrieve your UID, join any server and type ```status``` in console, find the line with your name and get the UID from it

```config.json``` file contains tf2taunt settings
```english.json``` file contains all the lines you'll say when killing someone
```groups.json``` file contains weapon groups to use in language file (example: group ```rockets``` contains The Direct Hit, Black Box, etc..)

# Upcoming features

* Localization files updates
* Kill counters (soon)
* Rough class detection based on weapon used for last kill and triggers for it (not very soon)
* Possibly even more

Stay tuned!
