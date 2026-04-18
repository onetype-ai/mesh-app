import scripts from '#shared/scripts/addon.js';

scripts.Item(
{
	id: 'system.information',
	name: 'Collect system information',
	description: 'OS, kernel, arch, CPU, RAM, disk, GPU and hostname as JSON.',
	platforms: ['linux', 'darwin'],
	autorun: true,
	output: 'json',
	bash: `
set -e

os_name=""
os_version=""
kernel="$(uname -r)"
arch="$(uname -m)"
cpu_model=""
cpu_cores=0
cpu_threads=0
ram_total=0
hostname="$(hostname)"

if [ "$(uname -s)" = "Darwin" ]; then
	os_name="macOS"
	os_version="$(sw_vers -productVersion)"
	cpu_model="$(sysctl -n machdep.cpu.brand_string)"
	cpu_cores="$(sysctl -n hw.physicalcpu)"
	cpu_threads="$(sysctl -n hw.logicalcpu)"
	ram_total="$(sysctl -n hw.memsize)"
elif [ "$(uname -s)" = "Linux" ]; then
	if [ -f /etc/os-release ]; then
		. /etc/os-release
		os_name="\${NAME:-Linux}"
		os_version="\${VERSION_ID:-}"
	else
		os_name="Linux"
	fi
	cpu_model="$(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | sed 's/^ *//')"
	cpu_cores="$(grep -c '^processor' /proc/cpuinfo)"
	cpu_threads="$cpu_cores"
	ram_total="$(awk '/MemTotal/ { print $2 * 1024 }' /proc/meminfo)"
fi

cat <<JSON
{
	"os": { "name": "$os_name", "version": "$os_version", "kernel": "$kernel" },
	"arch": "$arch",
	"cpu": { "model": "$cpu_model", "cores": $cpu_cores, "threads": $cpu_threads },
	"ram": { "total": $ram_total },
	"network": { "hostname": "$hostname" }
}
JSON
	`
});
