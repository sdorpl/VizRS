#!/bin/sh
# bramka VizRS CG Playout (sidecar) – refaktoryzacja; panel: tylko cargo (deploy.sh/gate.sh ruszają stos)
set -e
cd "$HOME/Nextcloud/GitHub/VizRS CG Playout"
cargo fmt --check && echo "OK   fmt"
cargo clippy -q --all-targets -- -D warnings && echo "OK   clippy"
cargo test -q 2>&1 | grep -E "test result" | awk '{s+=$4; f+=$6} END {print "OK   cargo test: " s " passed, " f " failed"; if (f>0) exit 1}'
cargo build --release -q && echo "OK   build"
if npm test > /tmp/npmtest.log 2>&1; then echo "OK   npm test ($(grep -E '^# pass' /tmp/npmtest.log))"; else echo "FAIL npm test"; grep -E "^not ok|# fail" /tmp/npmtest.log | head; exit 1; fi
tools/sync-zasady.sh --check >/dev/null && echo "OK   sync-zasady"
(cd panel/server && cargo fmt --check && cargo clippy -q --all-targets -- -D warnings && cargo test -q 2>&1 | grep "test result" | grep -v " 0 passed" | sed 's/^/     panel\/server: /')
(cd panel/desktop && cargo fmt --check && cargo clippy -q --all-targets -- -D warnings && cargo test -q 2>&1 | grep "test result" | grep -v " 0 passed" | sed 's/^/     panel\/desktop: /')
for f in panel/server/web/*.js panel/server/web/views/*.js; do node --check "$f"; done && echo "OK   node --check panel/web"
