#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

patterns=(
  'href=\{`/'
  'href="/'
  "href=\{'/"
  'goto("/'
  "goto('/"
  'src="/'
)

status=0

for pattern in "${patterns[@]}"; do
  if grep -rn -F --include='*.svelte' --include='*.ts' --include='*.js' --exclude-dir='generated' --exclude-dir='build' --exclude-dir='.svelte-kit' "$pattern" apps/web/src apps/web/static 2>/dev/null; then
    status=1
  fi
done

if [[ "$status" -ne 0 ]]; then
  echo
  echo "Base-path unsafe absolute links were found. Use \$app/paths base-aware helpers for internal routes."
  exit 1
fi

echo "Base-path link check passed."
