NOTE: Script is unfinished. More lines and groups should be added. Contributions are welcome!

# tf2taunt
A single script to make salt pour from everyone you play with

# Installation

Add ```-condebug``` into your Team Fortress 2 launch options in Steam client (Right-Click on Team Fortress 2 -> Properties -> Set Launch Options)

If Steam is installed in non-default location, tf2taunt will ask you to provide path to ```tf``` folder
The application will also ask you for your UID. It looks like [U:1:306902***]. To retrieve your UID, join any server and type ```status``` in console, find the line with your name and get the UID from it

Also you'll need to write ```bind = "exec stdin"``` (note: key '=' can be changed to any other key in ```config.json```)

## Windows
Note: tf2taunt uses Windows Shell Host script to communicate with Team Fortress 2. Script can be found at ```win32sendkeys.vbs```
## Linux (Debian/Ubuntu)
tf2taunt requires ```xdotool``` to be installed. To install it, simply write ```sudo apt-get install xdotool``` in your terminal.

# Configuration

```config.json``` file contains tf2taunt settings
```english.json``` file contains all the lines you'll say when killing someone
```groups.json``` file contains weapon groups to use in language file (example: group ```rockets``` contains The Direct Hit, Black Box, etc..)
