#!/bin/sh
# odpowiedzi serwera panelu bez stosu: $1 = binarka, $2 = plik wyniku
PORT=$(python3 -c 'import socket;s=socket.socket();s.bind(("127.0.0.1",0));print(s.getsockname()[1])')
"$1" --port $PORT --bridge http://127.0.0.1:9 --bridge-token xxxxxxxxxxxxxxxxxxxx --token operator-token-1234 > "$2.log" 2>&1 &
PID=$!; sleep 1
T=$(mktemp)
for path in / /index.html /app.js /style.css /api/status /api/cmd/GetChannels /api/session /login /health /favicon.ico /nie-ma /views/kalendarz.js; do
  code=$(curl -s -o "$T" -w '%{http_code}' "http://127.0.0.1:$PORT$path"); printf "%s %s %s\n" "$path" "$code" "$(md5sum < "$T" | cut -c1-8)"
done > "$2"
code=$(curl -s -o "$T" -w '%{http_code}' -X POST -H 'Content-Type: application/json' -H "Origin: http://127.0.0.1:$PORT" --data '{"token":"zly"}' "http://127.0.0.1:$PORT/api/session"); echo "POST /api/session zly $code $(md5sum < "$T" | cut -c1-8)" >> "$2"
code=$(curl -s -c "$T.c" -o "$T" -w '%{http_code}' -X POST -H 'Content-Type: application/json' -H "Origin: http://127.0.0.1:$PORT" --data '{"token":"operator-token-1234"}' "http://127.0.0.1:$PORT/api/session"); echo "POST /api/session dobry $code" >> "$2"
code=$(curl -s -b "$T.c" -o "$T" -w '%{http_code}' "http://127.0.0.1:$PORT/api/status"); echo "GET /api/status z sesją $code" >> "$2"
kill $PID; rm -f "$T" "$T.c"
