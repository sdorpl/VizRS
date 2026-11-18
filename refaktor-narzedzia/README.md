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

Wymagania: Playwright z `PLAYWRIGHT_DIR="/home/maciej/Documents/cgapp v1"`; skrypty `.mjs` z parserem `acorn` i `acorn-walk`
(np. `npm install acorn@8.14.0 acorn-walk@8.3.4` w katalogu tymczasowym – nie jako zależność repo). Ścieżki w skryptach
wskazują katalogi `~/Nextcloud/GitHub/VizRS CG …`; pliki JSON specyfikacji podziału (np. `p2.json`) trzeba napisać na nowo.
