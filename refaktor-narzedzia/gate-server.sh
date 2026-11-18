#!/bin/sh
# bramka serwera vizrs (etap 1 refaktoryzacji): bez shell/ i render/, które się nie zmieniają
set -e
export PLAYWRIGHT_DIR="/home/maciej/Documents/cgapp v1"
cd "$HOME/Nextcloud/GitHub/VizRS CG System/source"
cargo clippy --all-targets -q -- -D warnings
cargo test -q 2>&1 | grep "test result" | grep -v " 0 passed"
cargo build --release -q
B=target/release/vizrs
for t in "tests/vectors/run.js" "tests/e2e/run.js $B" "tests/e2e/mobile.js $B" "tests/e2e/artist.js $B" "tests/e2e/pack.js $B" "tests/e2e/app.js $B" "tests/cgpack.mjs" "tests/motion.js" "tests/e2e/motion.js $B" ; do
  if node $t > /tmp/gate.log 2>&1; then echo "OK   $t"; else echo "FAIL $t"; tail -15 /tmp/gate.log; exit 1; fi
done
node tests/e2e/golden.js $B 2>&1 | grep "^FAIL" | sed "s/ (różnica.*//" > /tmp/golden.now || true
rm -f tests/golden/*.actual.png
if diff -q $(dirname "$0")/golden.base /tmp/golden.now >/dev/null; then echo "OK   golden (= stan main: $(wc -l < /tmp/golden.now) znanych różnic)"; else echo "FAIL golden"; diff $(dirname "$0")/golden.base /tmp/golden.now; exit 1; fi
../tools/sync-zasady.sh --check && echo "OK   sync-zasady"
