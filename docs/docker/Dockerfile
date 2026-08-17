FROM buanet/iobroker:latest

# Python 3.12 beside system Python 3.11 (Debian Bookworm).
# https://github.com/pascallj/python3.12-backport
USER root
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl; \
    mkdir -p /etc/apt/keyrings; \
    curl -fsSL https://pascalroeleven.nl/deb-pascalroeleven.gpg \
      -o /etc/apt/keyrings/deb-pascalroeleven.gpg; \
    printf '%s\n' \
      'Types: deb' \
      'URIs: http://deb.pascalroeleven.nl/python3.12' \
      'Suites: bookworm-backports' \
      'Components: main' \
      'Signed-By: /etc/apt/keyrings/deb-pascalroeleven.gpg' \
      > /etc/apt/sources.list.d/pascalroeleven.sources; \
    apt-get update; \
    apt-get install -y --no-install-recommends python3.12 python3.12-venv python3.12-dev; \
    python3.12 --version; \
    rm -rf /var/lib/apt/lists/*
