#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "$ROOT_DIR"

bash -n skills/scripts/download-icon.sh
bash -n skills/scripts/generate-app.sh
bash -n skills/scripts/validate-app.sh
bash -n skills/tests/test_skills_scripts.sh

bash skills/tests/test_skills_scripts.sh

echo "All skills checks passed."
