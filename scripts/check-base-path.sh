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
  if rg -n -F --glob '!apps/web/src/lib/generated/**' --glob '!apps/web/build/**' --glob '!apps/web/.svelte-kit/**' "$pattern" apps/web/src apps/web/static; then
    status=1
  fi
done

if [[ "$status" -ne 0 ]]; then
  echo
  echo "Base-path unsafe absolute links were found. Use \$app/paths base-aware helpers for internal routes."
  exit 1
fi

echo "Base-path link check passed."
