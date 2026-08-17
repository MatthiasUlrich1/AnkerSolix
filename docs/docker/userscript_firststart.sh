#!/usr/bin/env bash
# Optional: installs Python 3.12 on first start of a new buanet/iobroker container.
# Not required from adapter 0.10.87 (system Python 3.11 is accepted as best-effort).
# Place as /opt/userscripts/userscript_firststart.sh (executable).
# Docs: ../docker-buanet.md
set -euo pipefail

MARKER="/opt/.docker_config/.anker-solix-python312"
if [[ -x /usr/bin/python3.12 ]] && /usr/bin/python3.12 --version >/dev/null 2>&1; then
  echo "[anker-solix] Python 3.12 already present: $(/usr/bin/python3.12 --version)"
  exit 0
fi

echo "[anker-solix] Installing Python 3.12 (bookworm backport) ..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends ca-certificates curl
mkdir -p /etc/apt/keyrings
curl -fsSL https://pascalroeleven.nl/deb-pascalroeleven.gpg \
  -o /etc/apt/keyrings/deb-pascalroeleven.gpg
cat >/etc/apt/sources.list.d/pascalroeleven.sources <<'EOF'
Types: deb
URIs: http://deb.pascalroeleven.nl/python3.12
Suites: bookworm-backports
Components: main
Signed-By: /etc/apt/keyrings/deb-pascalroeleven.gpg
EOF
apt-get update
apt-get install -y --no-install-recommends python3.12 python3.12-venv python3.12-dev
python3.12 --version
mkdir -p "$(dirname "$MARKER")"
date -Is >"$MARKER"
echo "[anker-solix] Python 3.12 install finished."
