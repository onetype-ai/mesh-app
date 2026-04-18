#!/usr/bin/env bash
#
# Mesh agent installer
# Usage: curl -fsSL mesh.onetype.ai/install.sh | bash
#

set -e

# ============================================================
# Colors
# ============================================================

BOLD=$(printf '\033[1m')
DIM=$(printf '\033[2m')
RESET=$(printf '\033[0m')
BLUE=$(printf '\033[34m')
GREEN=$(printf '\033[32m')
RED=$(printf '\033[31m')

# ============================================================
# Helpers
# ============================================================

say()
{
	printf "%s\n" "$1"
}

info()
{
	printf "${BLUE}${BOLD}›${RESET} %s\n" "$1"
}

ok()
{
	printf "${GREEN}${BOLD}✓${RESET} %s\n" "$1"
}

fail()
{
	printf "${RED}${BOLD}✗${RESET} %s\n" "$1" >&2
	exit 1
}

# ============================================================
# System detection
# ============================================================

detect_os()
{
	case "$(uname -s)" in
		Linux*)   echo "linux"   ;;
		Darwin*)  echo "darwin"  ;;
		*)        fail "Unsupported OS: $(uname -s)" ;;
	esac
}

detect_arch()
{
	case "$(uname -m)" in
		x86_64|amd64)   echo "amd64" ;;
		arm64|aarch64)  echo "arm64" ;;
		*)              fail "Unsupported architecture: $(uname -m)" ;;
	esac
}

# ============================================================
# Token prompt
# ============================================================

prompt_token()
{
	printf "\n${BOLD}Paste your Mesh token:${RESET} "
	read -r TOKEN

	if [ -z "$TOKEN" ]; then
		fail "Token is required."
	fi

	if [ ${#TOKEN} -lt 32 ]; then
		fail "Token looks invalid (too short)."
	fi
}

# ============================================================
# Main
# ============================================================

main()
{
	printf "\n${BOLD}Mesh${RESET} ${DIM}— your hardware, your cloud.${RESET}\n\n"

	OS=$(detect_os)
	ARCH=$(detect_arch)

	ok "Detected: ${BOLD}${OS}/${ARCH}${RESET}"

	prompt_token

	ok "Token accepted (${#TOKEN} chars)"

	say ""
	info "Next step: download and start the Mesh agent."
	say "  OS:    ${OS}"
	say "  Arch:  ${ARCH}"
	say "  Token: ${TOKEN:0:8}...${TOKEN: -4}"
	say ""
}

main "$@"
