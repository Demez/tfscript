tf_def="${HOME}/.local/share/Steam/steamapps/common/Team Fortress 2/tf"
tf_dir=$tf_def

echo "Welcome to tfscript installer!"
while [ ! -f "${tf_dir}/gameinfo.txt" ]
do
	echo "Please, enter path to tf folder (use /home/username instead of ~)"
	read tf_dir
done
echo "Found Team Fortress 2"
echo "Copying files..."
cp -r tf/* "${tf_dir}"
if [ ! -f "${tf_dir}/cfg/.tfse_installed" ]; then
	echo "exec tfscript" >> "${tf_dir}/cfg/autoexec.cfg"
	echo "echo tfse_class scout" >> "${tf_dir}/cfg/scout.cfg"
	echo "echo tfse_class soldier" >> "${tf_dir}/cfg/soldier.cfg"
	echo "echo tfse_class pyro" >> "${tf_dir}/cfg/pyro.cfg"
	echo "echo tfse_class demoman" >> "${tf_dir}/cfg/demoman.cfg"
	echo "echo tfse_class heavyweapons" >> "${tf_dir}/cfg/heavyweapons.cfg"
	echo "echo tfse_class engineer" >> "${tf_dir}/cfg/engineer.cfg"
	echo "echo tfse_class medic" >> "${tf_dir}/cfg/medic.cfg"
	echo "echo tfse_class sniper" >> "${tf_dir}/cfg/sniper.cfg"
	echo "echo tfse_class spy" >> "${tf_dir}/cfg/spy.cfg"
	echo "tfse class configs generated" > "${tf_dir}/cfg/.tfse_installed"
fi

npm install > install.log
node tfscript setup "${tf_dir}"
if [ ! -f "data/uid.txt" ]; then
	echo "[U:1:CHANGEME]" > "data/uid.txt"
fi
echo "Installation successful. Don't forget to set your UID"
