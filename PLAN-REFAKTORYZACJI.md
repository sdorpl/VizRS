# Refaktoryzacja pakietu VizRS – raport i plan

> **Zakończony (2026-11-19):** gałęzie `refaktor` scalone do `main` i wydane – CG System 26.11.11, CG Artist 26.11.11, CG Playout 26.11.15 (§8–§9; gałęzie usunięte). Punkty spoza zakresu zamknięte decyzjami z 2026-11-18 (§9): S4 – `renderer.js` nie dzielić, pętle na żywo (P4–P7) – zostawić, P9 – pominąć.
>
> Stan raportu na 2026-11-17: CG System 26.11.10 (`272452c`), CG Artist 26.11.10 (`df1318f`), CG Playout 26.11.13 (`7ea8dcb`).
> To jest **raport przed zmianami**: w kodzie nic jeszcze nie zmieniono. Liczby pochodzą z pomiarów skryptami na `main`
> (długości funkcji liczone dopasowaniem nawiasów, powielenia liczone blokami po 10 znormalizowanych wierszy). Mogą się różnić
> o kilka wierszy, ale proporcje się zgadzają.

## 1. Zasady realizacji (ustalone z użytkownikiem 2026-11-17)

- Kolejność: **CG System → CG Artist → CG Playout**. Źródło wspólnego kodu idzie pierwsze, kopie w pozostałych repo
  odświeża potem `tools/sync-cg.sh`, `panel/scripts/sync-ui.sh` albo `tools/sync-zasady.sh`.
- W każdym repo osobna gałąź `refaktor`. Bez scalania do `main`, bez wydania i bez zmiany numeru wersji, dopóki użytkownik nie przejrzy zmian.
- Refaktoryzacja **nie zmienia zachowania**. Każdy commit to jedno przeniesienie albo jedno uproszczenie i przechodzi pełną bramkę
  z sekcji „Testy” w `CLAUDE.md` danego repo, łącznie z e2e i `native-compare`, jeśli dotyczy. Gdy przy okazji wyjdzie błąd, poprawka idzie
  osobnym commitem, z wpisem w `CHANGELOG.md` i dokumentacji.
- Przenoszenie kodu w Rust: najpierw same przeniesienia (`mod` + `pub(crate)`), bez zmian w ciałach funkcji, żeby dało się sprawdzić diff przez `git diff --color-moved`.
- CG System: commit zmieniający serwer aktualizuje `bin/linux-x86_64/vizrs` (zasada repo). Dlatego binarkę lepiej przebudować raz,
  w ostatnim commicie gałęzi, a w opisie poprzednich commitów to zaznaczyć. **Do decyzji użytkownika (§6, pkt 4).**
- Poza zakresem: `/artist` w CG System (zamrożony, tylko poprawki błędów), działające stosy i dane produkcyjne. ErsatzTV nie zmieniamy.

## 2. Diagnoza ogólna

Kod jest w dobrym stanie, więc refaktoryzacja to porządki, nie ratowanie:

| Obszar | Wynik |
|---|---|
| Synchronizacja kodu wspólnego | ✔ wszystkie pliki z list `sync-cg.sh` / `sync-ui.sh` / `sync-zasady.sh` są identyczne ze źródłem (porównanie sum) |
| Powielenia wewnątrz repo | ✔ znikome: najwyżej 10–30 wierszy, prawie wyłącznie w testach (`tests/contract/*.mjs`, `tests/e2e/*.js`) |
| `unwrap`/`expect` poza testami | ✔ CG System 22 (z czego 9 w `render/examples/measure.rs`), Artist 5 (`build.rs`), Playout 23. Głównie niezmienniki (dane wbudowane, wyrażenia stałe). Nie ma `lock().unwrap()` |
| Front-end panelu (`panel/server/web`) | ✔ podzielony na moduły (`views/*.js`, największy 512 wierszy) |
| **Duże pliki i długie funkcje** | ✘ główny dług: kilka plików ma 1500–3700 wierszy kodu bez testów (§3) |
| **Kod okien Tauri w trzech kopiach** | ✘ trzy `main.rs` okien mają po ok. 450–580 wspólnych wierszy, `connect.rs` po ok. 200–290; synchronizowane są tylko `gpu.rs`, `scale.rs`, `screen.rs` (§4) |
| **`innerHTML` mimo zasady B** | ✘ CG System 57 miejsc w `web/` (bez `tools/`), Artist 48 (§5) |

## 3. Duże pliki – podział na moduły

Kolumna „kod” to wiersze przed `#[cfg(test)]`. Testy przechodzą do nowego modułu razem z kodem, który sprawdzają.

### 3.1 VizRS CG System

| # | Plik | Kod / razem | Propozycja | Ryzyko |
|---|---|---|---|---|
| S1 | `source/src/engine.rs` | 1703 / 2263 | Jeden `impl Engine` ma ok. 1450 wierszy. Podzielić na `engine/` z kilkoma blokami `impl Engine` w osobnych plikach: `onair.rs` (TAKE/CONTINUE/OUT/UPDATE/ARM, warstwy), `dock.rs` (powiązania), `rundown.rs` (rundowny, karuzela, makra), `channels.rs` (anteny, etykiety, `load_/save_channels`), `persist.rs` (zapis atomowy, kopie, `normalize_show`), `sse.rs` (subskrypcje, snapshoty). Typy (`Inner`, `LayerState`, `Lock`) w `engine/mod.rs` | średnie: rdzeń anteny, ale same przeniesienia, dobre pokrycie testami |
| S2 | `source/src/main.rs` | 1093 / 1412 | `route` ma 245 wierszy. Wydzielić `routes.rs` (tabela tras), `static_files.rs` (`STATIC`, `include_str!`), `tcp.rs` (port 6100). Długi `match` w `route` podzielić na funkcje według prefiksu (`/api/show*`, `/api/take*`, `/api/assets*` …) | niskie |
| S3 | `source/web/trio.html` | skrypt 1407 wierszy w HTML | Przenieść skrypt do modułów ES: `trio/main.js`, `trio/pages.js` (lista stron, edycja pól), `trio/onair.js` (sterowanie), `trio/rundown.js`, `trio/mobile.js`. Nowe pliki dopisać do `STATIC` | średnie: konieczne e2e `run.js` i `mobile.js` plus zrzut ekranu |
| S4 | `source/web/renderer.js` | 2196 | Kopiowany 1:1 do Artist, więc podział zmienia listę `SHARED` w `sync-cg.sh` (styk!). Propozycja: `renderer/ticker.js` (`_slots` 112 wierszy, paski, pin), `renderer/text.js`, `renderer/dock.js`; `renderer.js` zostaje punktem wejścia z tym samym eksportem. Po każdym kroku `native-compare.js` i `engines.js` | średnie-wysokie: trzeba zrobić w tym samym cyklu co Artist (zmiana listy synchronizacji) |
| S5 | `source/web/ticker-items.js` | `mountTickerEditor` 316 wierszy | Rozbić na funkcje: lista, edycja pozycji, przeciąganie, kolory. Plik wspólny z Artist (synchronizacja) | niskie |
| S6 | `source/render/src/scene.rs` | 1611 / 1657 | `apply` 213, `ticker_content` 208, `ticker_slots` 163, `text_content` 134 wiersze. Wydzielić `scene/ticker.rs` i `scene/text.rs`. Lustrzany podział z S4, żeby łatwiej porównywać oba renderery | średnie: `native-compare.js` po każdym kroku |
| S7 | `source/render/src/raster.rs`, `host.rs` | `paint` 170, `raster_text` 119, `recompute_dock` 141 | Wydzielić funkcje pomocnicze bez zmiany kolejności rysowania | niskie |
| S8 | `source/src/config.rs` | `parse` 142 | Tablica opcji (nazwa → setter) zamiast długiego `match`. Czysty parser jest dobrze przetestowany | niskie |

`render/src/qr.rs` (`matrix`, 229 wierszy) i `web/qr.js` zostają bez zmian. To algorytm kodów QR, a jego podział niczego nie ułatwi.

### 3.2 VizRS CG Artist

| # | Plik | Kod / razem | Propozycja | Ryzyko |
|---|---|---|---|---|
| A1 | `web/artist.html` | skrypt **3659 wierszy** w HTML (358 funkcji) | Największy pojedynczy dług w pakiecie. Moduły ES w `web/artist/`: `tree.js` (drzewo węzłów), `props.js` (panel właściwości), `timeline.js` (osie, klucze), `canvas.js` (kanwa, uchwyty, zaznaczenie), `fields.js` (pola kontrolne, `showIf`), `dock.js` (edytor reguł powiązań), `scenes.js` (lista scen, zapis, wdrażanie), `main.js`. Robić etapami, jeden obszar na commit | średnie: e2e `tests/e2e/okno.js` jest za mały na taki zakres, więc **najpierw dopisać testy e2e** dla drzewa, osi czasu i pól |
| A2 | `src/main.rs` | 1708 / 1769 | `build_menu` 195, `main` 173, `ipc` 119 wierszy. Wydzielić `menu.rs`, `ipc.rs` (biała lista razem z `bridge.rs`), `window.rs`. To samo w S-okno i P-okno, wspólny układ plików ułatwi §4 | niskie |
| A3 | `src/local.rs` | `route` 130 | Podział tras jak w S2 | niskie |

### 3.3 VizRS CG Playout

| # | Plik | Kod / razem | Propozycja | Ryzyko |
|---|---|---|---|---|
| P1 | `src/overlay.rs` | 2031 / 2961 | Budowa grafu FFmpeg w jednym pliku: ustawienia, kodery, CUDA, CPU, synchronizacja w RAM, strefy. Podział `overlay/`: `settings.rs` (`Settings`, presety, profile, x264), `cuda.rs` (`auto_cuda`, `free_gpu_memory`, `cuda_*`), `cpu.rs` (`cpu_chain`, `cpu_scale`, `cpu_overlay`), `ram_sync.rs` (`cpu_synced_in_ram`, `media_waits_in_ram`, `graph_waiting_in_ram`), `zones.rs` (`Zones`, `ZoneWatch`, `parse_zones`), `run.rs` (`run`, 112 wierszy) | średnie: testy budowy grafu są dokładne (porównania łańcuchów filtrów) |
| P2 | `panel/server/src/main.rs` | 1509 / 2329 | Wszystko w jednym pliku: konfiguracja, sesje, logowanie, routing, proxy, przesyłanie plików, status. Wydzielić `config.rs`, `session.rs` (`Sessions`, `LoginFails`, ciasteczko), `proxy.rs` (`forward`, `stream_proxy`, `cg_proxy`, `rewrite_playlist`), `upload.rs`, `routes.rs` (`route` 131 wierszy), `secrets.rs` (`mask_secrets`) | niskie-średnie: granica bezpieczeństwa (sesje, logowanie), same przeniesienia |
| P3 | `src/config.rs` | `from_values` **258 wierszy** | Najdłuższa funkcja kodu produkcyjnego w pakiecie. Podzielić na grupy (wyjście, kodowanie, ingest, panel, ścieżki) albo tablicę opcji jak w S8 | niskie: `tests/config.rs` |
| P4 | `src/capture.rs` | 1418 / 1507 | `frames` 207, `session` 115, `tape_slot` 115 wierszy. Wydzielić `capture/tape.rs` i funkcje pomocnicze z `frames` | średnie: ingest na żywo |
| P5 | `src/stream.rs` | `stream_carried` 195 | Rozbić pętlę na kroki (odczyt klatki, przeniesienie, zapis) | średnie |
| P6 | `src/takeover.rs` | `sequence` 171, `live_args` 122 | Wydzielić budowę argumentów i kroki sekwencji | średnie: przejęcie anteny |
| P7 | `src/server.rs`, `panel.rs`, `vizrs.rs` | 1338 / 1351 / 1051 kodu | `script_session` 129 wierszy. Najpierw P1–P6; te pliki później, po sprawdzeniu, czy podział ma sens | – |
| P8 | `panel/desktop/src/main.rs` | `main` 121, `build_menu` 109 | Ten sam układ co A2 (`menu.rs`, `ipc.rs`, `window.rs`) | niskie |
| P9 | `panel/server/web/views/kalendarz.js`, `cmdedit.js` | `calendarPanels` 175, `cmdEditor` 129 | Rozbić na funkcje pomocnicze | niskie |
| P10 | `tests/contract/live-panel.test.mjs` | `fakeErsatzTV` 447 wierszy | Wydzielić atrapę ErsatzTV do `tests/contract/fake-ersatztv.mjs` (podobne fragmenty są w `ingest`/`zones`/`native*.test.mjs`) | niskie |

## 4. Kod okien Tauri w trzech kopiach

Okno CG System (`source/shell`), CG Artist i natywny klient panelu (`panel/desktop`) mają ten sam szkielet: funkcje
`build_menu`, `ipc`, `on_menu`, `open_connect`/`close_connect`, `on_conn`, `reload_after_crash`, `native_look`, `parse_args`,
`switch`, `reveal`, `open_external` i inne są we wszystkich trzech. Pomiar wspólnych wierszy:

| Plik | CG System / Artist / Playout (wierszy) | Wspólne wiersze (pary) |
|---|---|---|
| `main.rs` | 1348 / 1770 / 940 | 584 · 482 · 455 |
| `connect.rs` | 246 / 398 / 308 | 201 · 192 · 293 |
| `connect.html` | 87 / 101 / 84 | 75 · 74 · 65 |
| `paths.rs` (bez Playout) | 148 / 156 | 102 |

Komentarz w `panel/desktop/src/connect.rs` mówi „Wzór: okno połączenia VizRS CG System – bez wspólnego crate'a”, więc decyzję
o braku wspólnego crate'a już kiedyś podjęto. Kopie rozjeżdżają się w szczegółach: Artist ma `token_for_or_host`, którego nie ma w panelu.
Warianty:

- **(a) Rozszerzyć synchronizację (rekomendowane).** `connect.rs`, `paths.rs` i `connect.html` w jednej wersji źródłowej w CG System,
  z różnicami (nazwa pliku listy, teksty) w małym pliku konfiguracyjnym każdej aplikacji (`conn_conf.rs`). Kopie pilnuje `--check` w CI,
  tak jak dziś `gpu.rs`/`scale.rs`/`screen.rs`. Wspólne części `main.rs` (menu, awarie, `native_look`) wydzielić najpierw w każdym repo
  do osobnych modułów (A2/P8), a dopiero potem włączyć do synchronizacji te, które wyjdą identyczne.
- **(b) Wspólny crate `vizrs-shell-common`** w CG System, dołączany przez `path`/`git`. Mniej kopii, ale sprzężenie wersji
  między repo i nowa zależność w nagłówkach `Cargo.toml` (wymaga decyzji użytkownika).
- **(c) Zostawić jak jest**, a poprawki przenosić ręcznie.

Przy okazji: w `panel/desktop/src/connect.rs` (komentarz modułu) i w nazwie pliku `live-connections.json` zostało jeszcze określenie „panelu VizRS Live”.
Zmiana nazwy pliku zgubiłaby zapisane połączenia, więc najwyżej z migracją. Sam komentarz warto poprawić.

## 5. `innerHTML` a zasada B

Zasada B: „tekst do DOM tylko przez `textContent` (bez `innerHTML`/`eval`)”. Stan (`web/`, bez narzędzi i testów):

| Plik | CG System | Artist |
|---|---|---|
| `artist.html` | 18 (zamrożony) | 29 |
| `trio.html` | 19 | – |
| `pack-ui.js` | 7 | 7 (kopia) |
| `renderer.js` | 9 | 9 (kopia) |
| `color-picker.js`, `dialogs.js`, `native.js`, `ticker-items.js` | 4 | 3 |

Większość to czyszczenie (`el.innerHTML = ''`) albo szablony z `esc()`. Identyfikatory przechodzą przez `validate.rs` (litery, cyfry, `-`, `_`),
więc nie widzę dziury, ale kod łamie zasadę na piśmie. Przy refaktoryzacji:
- `innerHTML = ''` → `replaceChildren()` (mechanicznie, bez ryzyka);
- szablony list (`<option>`, wiersze tabel) → mała funkcja pomocnicza `h(tag, attrs, ...children)` w module wspólnym (np. `dom.js` w `sync-cg.sh`), tak jak panel, który ma 0 takich miejsc;
- `qrSvg` w `renderer.js` (SVG z własnego generatora) → zbudować przez `createElementNS` albo zostawić jako jedyny opisany wyjątek.
- `/artist` w CG System jest zamrożony, więc go nie ruszam, chyba że użytkownik zdecyduje inaczej.

## 6. Decyzje dla użytkownika

1. **§4: kod okien Tauri.** Wariant (a) synchronizacja, (b) wspólny crate albo (c) bez zmian.
2. **§5: `innerHTML`.** Doprowadzić kod do zasady (rekomendowane, razem z S3/A1) albo dopisać do zasady B wyjątek (czyszczenie, SVG z własnego generatora).
3. **S4: podział `renderer.js`.** Zmienia listę plików synchronizowanych z Artist, czyli styk. Robić teraz czy po A1?
4. **Binarka `bin/linux-x86_64/vizrs`.** Aktualizować w każdym commicie gałęzi `refaktor` (zgodnie z zasadą) czy raz, na końcu gałęzi (mniej plików binarnych w historii)?
5. **A1: testy e2e edytora.** Dopisać je przed rozbiciem `artist.html`. Rozszerza to zakres o nowe testy, ale bez nich podział jest ryzykowny.

**Decyzje użytkownika (2026-11-17):** 1 → (a) synchronizacja; 2 → dostosować kod; 3 → `renderer.js` po A1;
4 → binarka raz, na końcu gałęzi; 5 → testy e2e edytora przed A1 (przyjęte zgodnie z rekomendacją).

## 7. Proponowana kolejność

| Etap | Zakres | Uwagi |
|---|---|---|
| 1 | CG System: S2, S8, S1 | serwer; bramka: clippy, testy, e2e |
| 2 | CG System: S3, S5, `replaceChildren` (§5) | front-end Trio; zrzuty ekranu |
| 3 | CG System: S6, S7 (+ S4, jeśli decyzja 3 = teraz) | renderery; `native-compare.js`, `engines.js` |
| 4 | CG Artist: `sync-cg.sh`, testy e2e (decyzja 5), A2, A3, A1 etapami | A1 to największa praca w planie |
| 5 | CG Playout: P3, P2, P1, P10, potem P4–P6, P8, P9 | po P1–P6 pełna bramka sidecar i testy kontraktowe |
| 6 | §4 według decyzji 1, we wszystkich trzech repo w jednym cyklu | styk (synchronizacja) |

Każdy etap kończy się przeglądem przez użytkownika. Dopiero potem scalenie i, osobno, wydanie.

## 8. Stan realizacji

- **2026-11-17 – etap 1 zrobiony** (CG System, gałąź `refaktor`, 7 commitów, bez push, binarka `bin/` jeszcze nie przebudowana):
  S2 w czterech krokach (`static_files.rs`, `commands.rs` – nazwa zamiast `tcp.rs`, bo obejmuje też OSC i makra, `routes.rs`,
  podział `route` na funkcje według prefiksu), usunięcie martwego kodu ujawnionego przy przeniesieniu (`cont_on`, `clear_on`, `as_f64`),
  S8 (tabele `VALUE_OPTS`/`SWITCHES`), S1 (`engine/`: `onair`, `channels`, `dock`, `rundown`, `show`, `persist`, `sse`, `locks`, `diag`, `tests`).
  Nowe testy: `every_api_prefix_is_routed`, `env_matches_flag` (oba przechodzą też na kodzie sprzed zmian). `main.rs` 1412 → 827 wierszy.
  Bramka: clippy, 107 testów, wektory, e2e (`run`, `mobile`, `artist`, `pack`, `app`, `motion`, `shell`, `native-smoke`), `cgpack`;
  `golden` ma 7 różnic – te same na binarce z `main` (fonty lokalne). `pack.js` raz niestabilny (2 FAIL), w powtórkach 3× zielony.
- **2026-11-17 – etap 2 zrobiony** (CG System, ta sama gałąź, 4 commity): S3 – skrypt `trio.html` na moduły ES `web/trio/`
  (`core`, `pages`, `preview`, `fields`, `onair`, `rundown`, `system`, `mobile`, `main`; ciągłe fragmenty w dawnej kolejności,
  instrukcje startowe w `init()` wołanych przez `main.js` po kolei, przypisania do zmiennych innego modułu przez `set…()`;
  zrzuty stanowiska i telefonu identyczne z `main`); S5 – `mountTickerEditor` podzielony (widoki, `ACTIONS`, `bind…`), porównany ze
  starą wersją 24-krokowym scenariuszem (te same `onChange` i HTML); czyszczenie `innerHTML = ''` → **`textContent = ''`**
  zamiast `replaceChildren()` (to drugie wymaga Chromium ≥ 86, a OBS 27 ma CEF 85 – `renderer.js` działa w OBS); `engines.js` 0 różnic.
  Przy okazji poprawka testu `pack.js` (losowy port bywał zajęty, sprzątanie przed zakończeniem serwera) – osobny commit; to była
  przyczyna „niestabilności” z etapu 1.
- **2026-11-18 – etapy 3–6 zrobione** (gałęzie `refaktor`: CG System 15, Artist 7, Playout 10 commitów; bez push):
  - CG System: S6 (`render/src/scene/`), S7 (`paint`, `raster_text`, `recompute_dock` na funkcje); okno `shell/` na `menu/window/ipc`;
    binarki `bin/` przebudowane w ostatnim commicie. native-compare po każdym kroku: 22 strony, maks. 1,61 % (bez zmian).
  - Artist: kopie z CG System; poprawka `renderTimeline` bez sceny; **nowy test `tests/e2e/editor.js`** (36 sprawdzeń, decyzja 5);
    A2 (`menu/window/ipc`), A3 (trasy według prefiksu), **A1** – `artist.html` na 15 modułów `web/editor/` (DOM paneli w 339 krokach
    identyczny ze starą wersją, `web.rs` podaje `/editor/*.js`).
  - Playout: P3 (grupy w `from_values`), P2 (serwer panelu na 6 modułów; odpowiedzi identyczne ze starą wersją), P1 (`overlay/`),
    P10, P4 (taśma do `capture/tape.rs`), P6 (`live_args` na kroki), P8 (okno panelu na `menu/window/ipc`, `okno.cjs` 12/12).
  - §4 (wariant a): synchronizacja `gpu.rs`/`scale.rs`/`screen.rs` dostała `--check` (`sync-cg.sh`, `sync-ui.sh`) – dotąd nic jej nie pilnowało.
- **Nie zrobione – do decyzji:** S4 (`renderer.js`), reszta §5 (szablony `innerHTML` → `h()`, `qrSvg`), wspólne źródło `connect.rs`/`paths.rs`/
  `connect.html` (kopie różnią się zachowaniem), P5, `sequence` (P6), pętla `frames` (P4), P7, P9 (bez e2e panelu poza stosem).

## 9. Przekazanie – jak kontynuować w innej sesji (2026-11-18)

**Gdzie jest praca.** W każdym repo lokalna gałąź `refaktor` (nic nie jest wypchnięte ani scalone; `main` nietknięty):

| Repo | Baza (`main`) | Commity na `refaktor` | Przegląd |
|---|---|---|---|
| VizRS CG System | `272452c` | 15 | `git log --oneline 272452c..refaktor`; Rust: `git diff --color-moved` |
| VizRS CG Artist | `df1318f` | 7 | `git log --oneline df1318f..refaktor` |
| VizRS CG Playout | `7ea8dcb` | 10 | `git log --oneline 7ea8dcb..refaktor` |

**Przed scaleniem / wypchnięciem.** `web/CG_SYSTEM` w Artist wskazuje commit z gałęzi `refaktor` CG System – CI Artist
(`sync-cg.sh --check`) zadziała dopiero, gdy ta gałąź (albo `main` po scaleniu) będzie na serwerze; po scaleniu CG System
uruchomić `tools/sync-cg.sh` w Artist ponownie (nowy commit źródła). Playout: `tests/gate.sh` (stos testowy) i `tests/deploy.sh`
(podmiana kontenera `live`) nie były uruchamiane – tylko za zgodą użytkownika. Wydanie osobno, po scaleniu.

**Otwarte decyzje użytkownika** (z raportu końcowego):
1. S4 – podział `renderer.js` (`ScenePlayer` to jedna klasa: domieszki do prototypu albo funkcje zewnętrzne); zmienia listę `SHARED` w `sync-cg.sh`.
2. §5 – reszta `innerHTML` (~40 w CG System, ~48 w Artist): (a) `h()` budujące DOM (duża przeróbka; Trio musi zachować „bez przerysowania bez zmian” – dotyk na telefonie) albo (b) szablon z automatycznym `esc()` i jedno miejsce zapisu jako opisany wyjątek w zasadzie B; `qrSvg` – `createElementNS` albo wyjątek.
3. §4 – wspólne `connect.rs`/`paths.rs`/`connect.html`: kopie różnią się zachowaniem (Artist `token_for_or_host`, CG System `check_target` i praca lokalna, Playout normalizacja); identyczne tylko `normalize_url`, `valid_token` (`refaktor-narzedzia/fnsame.py`). Scalić (który wzór?) czy synchronizować tylko te dwie funkcje.
4. Długie pętle na żywo: `frames` (P4), `sequence` (P6), `stream_carried` (P5), P7 – wymagają struktury stanu (przeprojektowanie).
5. P9 (UI kalendarza i edytora komend panelu) – bez e2e poza stosem; zrobić z `tests/gate.sh` czy pominąć.
6. Scalenie gałęzi `refaktor` do `main` i push.

**Znane zjawiska środowiska** (nie regresje): `golden.js` CG System – 7 różnic (fonty, `refaktor-narzedzia/golden.base`);
`okno.js` Artist – 4 przypadki zależne od klatek `requestAnimationFrame` oblewa też binarka sprzed zmian przy uśpionym ekranie;
`native-patch.test.mjs` Playout – raz zawieszony, w powtórce zielony.

**Narzędzia i bramki:** `refaktor-narzedzia/` (README). Playwright: `PLAYWRIGHT_DIR="/home/maciej/Documents/cgapp v1"`.

**Decyzje użytkownika do otwartych punktów (2026-11-18):**
1. S4 – `renderer.js` **nie dzielić** (najwyżej wydzielić czyste funkcje, bez metod klasy).
2. §5 – **tagowany szablon `html` z automatycznym `esc()`** i jednym miejscem zapisu (`dom.js`, synchronizowany) jako opisany wyjątek w zasadzie B. *Do zrobienia.*
3. §4 – do synchronizacji **tylko identyczne `normalize_url` i `valid_token`** (np. `conn_url.rs` z `--check`); reszta okien bez zmian. *Do zrobienia.*
4. Pętle na żywo (P4 `frames`, P5, P6 `sequence`, P7) – **zostawić**.
5. P9 – **pominąć**.
6. Gałęzie `refaktor` – **wypchnąć bez scalania** (CI sprawdzi, w tym `gate.sh` panelu); scalenie i wydanie później.

**Stan 2026-11-18 (druga sesja) – punkty 2 i 3 zrobione** (gałęzie `refaktor`: CG System 18, Artist 9, Playout 13 commitów; wypchnięte; CI zielone we wszystkich trzech – Artist i Playout przez `gh workflow run … --ref refaktor`, w tym `obrazy-i-e2e` panelu):
- **§4 / decyzja 3:** `normalize_url` i `valid_token` w `conn_url.rs` (źródło: CG System `source/shell/src/`), `connect.rs` re-eksportuje je
  (`pub use`); kopie w Artist (`tools/sync-cg.sh`) i panelu (`panel/scripts/sync-ui.sh`) pod `--check`. Nowy test `tokens`.
  `shell.js`, `native-smoke`, `okno.js` (Artist), `okno.cjs` (panel) zielone.
- **§5 / decyzja 2:** `web/dom.js` (CG System, kopia w Artist): `html``` escapuje wstawiane wartości, `raw`, `esc`, `orEmpty`,
  `setHtml`/`appendHtml`/`replaceHtml` – jedyne zapisy `innerHTML`/`outerHTML`. Przerobione: Trio (`web/trio/*`), `pack-ui`,
  `ticker-items`, `dialogs`, `native`, `color-picker`, `qrSvg`/`renderer`, edytor Artist (`web/editor/*`, `native.js`). Zamrożony
  `/artist` CG System bez zmian – opisany wyjątek w zasadzie „Dane z zewnątrz są obce” (blok B zasad pakietu, zsynchronizowany).
  Przy okazji escapowane są opcje pól typu lista w Trio i kolory kodu QR (CHANGELOG CG System). Zgodność: `tk-equiv` 0 różnic,
  `trio-equiv` tylko id/czasy z serwera, `artist-crawl` (339 kroków) 0 różnic, `engines.js` 0 różnic, golden = 7 znanych.
- Binarki `bin/` CG System przebudowane w ostatnim commicie gałęzi (`4184604`).
- CI panelu: sparse checkout CG System obejmuje teraz moduły okna (bez tego `sync-ui.sh --check` padał od 70852d1).

**Następne zadania:** przegląd użytkownika, CI na gałęziach `refaktor`, scalenie do `main` (Artist: po scaleniu CG System ponownie
`tools/sync-cg.sh`, bo `web/CG_SYSTEM` wskazuje commit z gałęzi), potem wydanie.
