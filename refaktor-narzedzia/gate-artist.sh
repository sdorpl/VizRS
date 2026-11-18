#!/bin/sh
# bramka VizRS CG Artist (refaktoryzacja)
set -e
cd "$HOME/Nextcloud/GitHub/VizRS CG Artist"
export PLAYWRIGHT_DIR="/home/maciej/Documents/cgapp v1"
tools/sync-cg.sh --check >/dev/null && echo "OK   sync-cg"
tools/sync-zasady.sh --check >/dev/null && echo "OK   sync-zasady"
cargo fmt --check && echo "OK   fmt"
cargo clippy -q --all-targets -- -D warnings && echo "OK   clippy"
cargo test -q 2>&1 | grep "test result" | grep -v " 0 passed"
cargo build --release -q
if timeout 600 node tests/e2e/okno.js "../VizRS CG System/source/target/release/vizrs" > /tmp/okno.log 2>&1; then echo "OK   okno.js"; else echo "FAIL okno.js"; grep FAIL /tmp/okno.log | head; exit 1; fi
if [ -f tests/e2e/editor.js ]; then if node tests/e2e/editor.js "../VizRS CG System/source/target/release/vizrs" > /tmp/editor.log 2>&1; then echo "OK   editor.js ($(grep -c ^PASS /tmp/editor.log) PASS)"; else echo "FAIL editor.js"; grep "FAIL\|Error" /tmp/editor.log | head; exit 1; fi; fi
