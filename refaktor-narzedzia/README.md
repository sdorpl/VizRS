# Narzędzia refaktoryzacji pakietu VizRS

Pomocnicze skrypty z realizacji [PLAN-REFAKTORYZACJI.md](../PLAN-REFAKTORYZACJI.md) (2026-11-17/18). Nie są częścią
żadnej aplikacji ani bramki CI; służą do kontynuacji prac i sprawdzania, że podział kodu nie zmienia zachowania.

| Plik | Do czego |
|---|---|
| `gate-server.sh` | bramka serwera CG System (clippy, testy, e2e Playwright, golden porównany z `golden.base` – 7 znanych różnic fontów) |
| `gate-artist.sh` | bramka VizRS CG Artist (sync-cg, fmt, clippy, testy, `okno.js`, `editor.js`) |
| `gate-playout.sh` | bramka VizRS CG Playout bez stosu (cargo, `npm test`, panel: cargo + `node --check`; **nie** uruchamia `tests/deploy.sh`/`gate.sh`) |
| `rsmove.py` | przenosi elementy najwyższego poziomu pliku Rust do nowych modułów (`python3 rsmove.py PLIK spec.json`; opis w nagłówku) – treść bez zmian, prywatne dostają `pub(crate)` |
| `fnsame.py` | które funkcje okien Tauri są identyczne w trzech repo (§4) |
| `split-trio.mjs`, `split-artist.mjs` | podział skryptu-modułu HTML na moduły ES (deklaracje + `init()`, settery dla przypisań między modułami) |
| `check-imports.mjs` | sprawdza katalog modułów ES: przypisania do importów (każda postać), import nieistniejącego eksportu |
| `analyze.mjs` | odwołania i przypisania między proponowanymi częściami skryptu |
| `artist-crawl.js`, `domdiff.py` | przegląd edytora Artist (stara vs nowa wersja, zegar zamrożony), porównanie DOM paneli |
| `tk-equiv.js` | ten sam scenariusz na starej i nowej wersji `ticker-items.js` |
| `panelcmp.sh` | odpowiedzi serwera panelu bez stosu (porównanie wersji) |
| `trio-equiv.js` | Trio: ten sam scenariusz na dwóch katalogach `web/` (stara/nowa), HTML list, pól i okien (`node trio-equiv.js BIN WEB_STARY WEB_NOWY`; różnią się tylko identyfikatory i czasy z serwera) |
| `artist-crawl.js` + `WEB_OLD=` | przegląd edytora dla dwóch wersji katalogu `web/` (porównanie: `domdiff.py`) |
| `tohtml.mjs`, `fixmix.mjs`, `orfix.mjs` | §5: szablony z HTML → `html```, sklejanie `+`/`+=` → jeden szablon, `lista.map(…) \|\| x` → `orEmpty` (zapisują plik) |
| `htmlcheck.mjs`, `mixcheck.mjs`, `htmlctx.mjs`, `fmout.mjs`, `joins.mjs`, `escplain.mjs`, `lits.mjs` | §5: kontrola po przeróbce – podwójne escapowanie, napisy z HTML w `html```, `innerHTML` poza `dom.js`, `html``` poza HTML, usunięte `.join('')` |

Wymagania: Playwright z `PLAYWRIGHT_DIR="/home/maciej/Documents/cgapp v1"`; skrypty `.mjs` z parserem `acorn` i `acorn-walk`
(np. `npm install acorn@8.14.0 acorn-walk@8.3.4` w katalogu tymczasowym – nie jako zależność repo). Ścieżki w skryptach
wskazują katalogi `~/Nextcloud/GitHub/VizRS CG …`; pliki JSON specyfikacji podziału (np. `p2.json`) trzeba napisać na nowo.

**Uwaga do narzędzi §5 (2026-11-18):** `tohtml.mjs` na całym pliku usuwa też `.join('')` poza HTML (np. w `hex6`) – sprawdź
`joins.mjs`; `fixmix.mjs` rozpoznaje zmienne z HTML po nazwie w całym pliku (np. `h` jako wysokość) – przejrzyj `fmout.mjs`.
Oba błędy wyłapał dopiero przegląd edytora (`artist-crawl.js`), więc porównanie stara/nowa wersja jest obowiązkowe.
