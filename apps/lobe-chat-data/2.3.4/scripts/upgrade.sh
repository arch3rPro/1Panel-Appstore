#!/bin/bash
set -euo pipefail
# Reapply directory setup and the legacy-layout guard on upgrades too.
bash "$(dirname -- "${BASH_SOURCE[0]}")/init.sh"
