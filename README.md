# VizRS – pakiet grafiki i playoutu telewizyjnego

Opis całego pakietu: co za co odpowiada, jak aplikacje współpracują i jaki tworzą stos.
Kod jest w trzech repozytoriach aplikacji: [VizRS-CG-System](https://github.com/sdorpl/VizRS-CG-System),
[VizRS-CG-Artist](https://github.com/sdorpl/VizRS-CG-Artist) oraz [VizRS-CG-Playout](https://github.com/sdorpl/VizRS-CG-Playout).
Dawne osobne repozytorium [VizRS-Live-Playout](https://github.com/sdorpl/VizRS-Live-Playout) zostało wchłonięte do CG Playout (`panel/`) i jest przeznaczone do archiwizacji.

## Mapa aplikacji i stosu

> Stan po połączeniu (decyzja D1 z 2026-11-15). Źródło: analiza repozytoriów oraz weryfikacja kluczowych twierdzeń
> w kodzie (porty, styki, wspólne pliki, wersje). Plan porządków i stan realizacji: [PLAN-PORZADKOWANIA.md](PLAN-PORZADKOWANIA.md).
>
> VizRS Live został wchłonięty przez **VizRS CG Playout** (jeden produkt: sidecar + panel `panel/` + most + stos).
> Pakiet liczy 3 aplikacje: CG System, CG Artist, CG Playout – patrz §8 i [plan połączenia](PLAN-PORZADKOWANIA.md#3-plan-połączenia-vizrs-live--vizrs-cg-playout).

## 1. Trzy aplikacje w jednym zdaniu

| Aplikacja | Katalog / repo | Wersja | Co robi | Kto używa |
|---|---|---|---|---|
| **VizRS CG System** | `VizRS CG System` · `sdorpl/VizRS-CG-System` | 26.11.8 | **Silnik grafiki**: trzyma show (sceny, strony), prowadzi stan anteny (TAKE/OUT/UPDATE…), podaje Trio (playout stron) i przezroczyste wyjście `/output` 1920×1080 | operator grafiki (Trio), OBS/vMix, pozostałe aplikacje |
| **VizRS CG Artist** | `VizRS CG Artist` · `sdorpl/VizRS-CG-Artist` | 26.11.9 | **Edytor scen i animacji** (desktop, Tauri 2). Działa bez serwera, sceny wysyła (deploy) na serwer `vizrs` albo do paczek `.cgpack` | grafik |
| **VizRS CG Playout** | `VizRS CG Playout` · `sdorpl/VizRS-CG-Playout` (dawniej VirtRS) | 26.11.11 | **Automatyka emisji i panel kanału (MCR)**: sidecar obok ErsatzTV (`vizrs-cg` + nakładka `vizrs-ffmpeg` wtapiająca `/output`, live ingest RTMP/SRT takeover, Live API), zintegrowany panel kanału w `panel/` (`vizrs-live` nad ErsatzTV legacy z mostem VizRS Bridge: ramówka, media, EPG, mozaika, as-run, sloty live) oraz okno desktopowe Tauri. Wchłonął dawne osobne repozytorium VizRS Live | automatyka kanału, operator emisji, planista, administrator |

Zewnętrzny, **niezmieniany** składnik stosu: **ErsatzTV legacy** (.NET; baza, skaner, planowanie, transkodowanie HLS/TS).
Dawne osobne repozytorium VizRS Live (`sdorpl/VizRS-Live-Playout`) tworzy obecnie podkatalog `panel/` w CG Playout i po zakończeniu migracji zostanie zarchiwizowane.

## 2. Kto z kim rozmawia

```
                ┌────────────────────┐   deploy scen (HTTP /api/scenes, /api/assets)
   grafik ─────►│  VizRS CG Artist   │──────────────────────────────┐   albo plik .cgpack
                │  (Tauri 2, desktop)│                              │
                └────────────────────┘                              ▼
                                                     ┌──────────────────────────────┐
   operator grafiki ── Trio (/trio) ────────────────►│      VizRS CG System         │
   OBS / vMix ─────── Browser Source (/output) ◄─────│  serwer `vizrs` :8088 HTTP   │
   Companion/StreamDeck ─ HTTP / TCP 6100 / OSC ────►│  SSE /events, TCP 6100, OSC  │
                                                     │  + `vizrs-render` (CPU)      │
                                                     └──────▲───────────┬───────────┘
                         TCP 6100 (AUTH, TAKE, OUT…),       │           │ /output (Chromium)
                         GET /api/show, /events             │           │ albo `vizrs-render stream`
                                                     ┌──────┴───────────▼───────────┐
   studio OBS/vMix ── RTMP :1936–1943 / SRT :9000–9007 ►│   VizRS CG Playout (cg) :7700 │
                                                     │  vizrs-cg + Chromium headless │
                                                     │  ingest (ffmpeg listen)       │
                                                     └──────▲───────────┬───────────┘
              Live API /api/live/*, /ingest/state,          │           │ vizrs-etv-client (skrypt ETV)
              /etv/pages (token panelu)                     │           │ vizrs-ffmpeg (podmieniony ffmpeg)
                                                     ┌──────┴──────┐ ┌──▼────────────────────────────┐
   operator emisji ── przeglądarka / AppImage ──────►│ panel       │►│ ErsatzTV legacy + VizRS Bridge │
                      :8090                          │ vizrs-live  │ │ (C#, MediatR, biała lista)     │
                                                     └─────────────┘ └──▲────────────────────────────┘
   widzowie ── :8409 Caddy (tylko /iptv/*, /artwork/*, HDHomeRun; reszta 403) ──┘
```

Sidecar (`cg`) i panel (`live`, `panel/`) to jeden produkt **VizRS CG Playout** – jedna wersja, jedno wydanie.

Dodatkowo przeglądarka operatora panelu VizRS CG Playout osadza ramkę `/output` CG Systemu (token wyjścia) i linkuje do Trio (`?channel=N`) – to styk tylko po stronie przeglądarki, serwer panelu nie rozmawia bezpośrednio z CG Systemem.

## 3. Styki (kontrakty) – kto jest dostawcą

Szczegółowa specyfikacja wszystkich kontraktów i endpointów znajduje się w [STYKI.md](STYKI.md), a matryca kompatybilności wstecznej i weryfikacji wydań w [ZGODNOSC.md](ZGODNOSC.md).

| Styk | Dostawca (tam opis) | Klienci | Treść |
|---|---|---|---|
| Protokół VizRS: TCP 6100 | CG System [`docs/API.md`](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md) | CG Playout, Companion | `AUTH`, `STATE`, `TAKE`, `ARM`, `CONTINUE`, `OUT`, `UPDATE`, `MACRO`, `TICKER`, `NEXT`, `@kanał …` |
| API HTTP + SSE `/events` | CG System [`docs/API.md`](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md) | Artist (pośrednik), CG Playout (`/api/show`), Companion | `/api/take…`, `/api/show`, `/api/scenes`, `/api/assets`, `/api/state`, `/api/variables`, `/api/channels` |
| Wyjście `/output` (`bus=ch-N`, token wyjścia) | CG System | OBS, CG Playout (Chromium do nakładki oraz ramka w panelu) | przezroczysta strona 1920×1080 |
| `vizrs-render` (`stream`, `thumb`, `bounds`) | CG System ([`source/render`](https://github.com/sdorpl/VizRS-CG-System/blob/main/source/render)) | CG Playout | natywny render CPU bez przeglądarki; obraz CG Playout klonuje CG System z tagu `VIZRS_REF` |
| Format show (`show.json`) i `.cgpack` | CG System ([`docs/DOKUMENTACJA.md`](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md)) | Artist | sceny, strony, zasoby; paczka ZIP z manifestem |
| Styk z ErsatzTV: VizRS Bridge `/vizrs-bridge/command/{Nazwa}` | CG Playout ([`docs/API.md`](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md) §3, `panel/bridge/`) | ErsatzTV legacy (startup hook C#) | komendy MediatR ErsatzTV legacy z białej listy |

Po połączeniu Live API `:7700` (sidecar ↔ panel, [`docs/API.md`](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md) §1) oraz wspólny stos compose (`docker-compose.live.yml`) stały się wewnętrznymi sprawami jednego produktu VizRS CG Playout z jedną wersją i nie stanowią już styków między repozytoriami.

Zasady (identyczne we wszystkich repo, [DOKUMENTACJA](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md) §1): styk zmienia się w obu repo naraz; starszy sąsiad nie może psuć emisji; wydania sprawdzane razem, minimalna wersja sąsiada w `CHANGELOG.md`.

## 4. Wspólny kod (kopie, nie biblioteka)

| Plik(i) | Źródło | Kopie | Pilnowanie |
|---|---|---|---|
| `vizrs-ui.css` (rdzeń wyglądu) | CG System `source/web/` | Artist `web/`, CG Playout `panel/server/web/` | `tools/sync-cg.sh --check` (Artist, CI), `scripts/sync-ui.sh` (CG Playout) – **identyczne** |
| `renderer.js`, `motion.js`, `cgpack.js`, `pack-ui.js`, `qr.js`, `richtext.js`, `ticker-*.js`, `color-picker.js`, fonty | CG System `source/web/` | Artist `web/` (commit w `web/CG_SYSTEM`) | `sync-cg.sh --check` w CI Artist |
| `gpu.rs`, `scale.rs`, `screen.rs` (okno Tauri na Linuksie: NVIDIA DMA-BUF, Skia CPU, XWayland przy skali ułamkowej) | CG System `source/shell/src/` | Artist `src/`, CG Playout `panel/desktop/src/` | **identyczne bajt w bajt** |

## 5. Stos technologiczny

| | CG System | CG Artist | CG Playout (sidecar + panel) |
|---|---|---|---|
| Rdzeń | Rust 2021, **0 zależności** (własny HTTP/1.1, SSE, JSON, OSC) | Rust + Tauri 2, `ureq`/rustls | Sidecar: Rust 2024 (1.87+), tylko `png`, `regex`; własny HTTP, JSON, DevTools.<br>Panel: Rust, **0 zależności** (serwer `vizrs-live`) |
| UI | czysty JS (ES modules), bez bundlera | ten sam JS + `native.js` | Sidecar: brak UI (API).<br>Panel: czysty JS SPA, MSE + własny demux TS→fMP4 |
| Okno | `vizrs-shell` (Tauri 2), `vizrs trio` (Edge/Chromium bez pasków) | Tauri 2 (WebKitGTK 4.1 / WebView2 / WKWebView) | Panel: `panel/desktop/` Tauri 2 (AppImage) |
| Render | przeglądarka; `vizrs-render` (tiny-skia, rustybuzz) | WebView (ten sam renderer.js) | Chromium headless shell albo `vizrs-render` |
| Inne | – | – | ffmpeg (nakładka `vizrs-ffmpeg`), musl; **C# / .NET 10** VizRS Bridge (startup hook w ErsatzTV) |
| Dystrybucja | binarki, `.deb/.rpm/AppImage`, Inno Setup, obraz `scratch` ~3 MB (amd64/arm64) | `.deb/.rpm/AppImage/.msi/.exe/.dmg` (bez Dockera) | Obrazy Docker: `ghcr.io/sdorpl/vizrs-cg`, `vizrs-seed`, `vizrs-live`, `vizrs-live-legacy` (wszystkie `:latest`), archiwa/binarki, AppImage panelu |

Wspólne cechy: Rust bez frameworków, UI bez bibliotek JS, wszystko po polsku, wersje kalendarzowe `RR.MM.N` (od 26.11.1, 2026-11-12; wcześniej semver), wydanie = tag `v*` → GitHub Actions (`release.yml`).

## 6. Stos produkcyjny (Docker)

Jeden projekt compose uruchamiany z katalogu **CG Playout** (z profilami `grafika` i `ingest`):

```
docker-compose.yml               seed · vizrs (CG System, :8788→8088) · cg (:7700) · ersatztv · ingest (RTMP/SRT)
 + docker-compose.ampere.yml     ARM64 Neoverse-N1, x264 ultrafast, tmpfs transcode, DOTNET_gcServer=0
 | docker-compose.nvidia.yml     NVENC + Chromium EGL (CDI)
 | docker-compose.vaapi.yml      /dev/dri/renderD128
 + docker-compose.live.yml       jedna nakładka w CG Playout (zastąpiła kopię z Live):
                                 ersatztv → legacy z VizRS Bridge, proxy (Caddy :8409 dla widzów), live (:8090)
```

Obrazy produkcyjne w stosie: `vizrs`, `vizrs-cg`, `vizrs-seed`, `vizrs-live`, `vizrs-live-legacy` – wszystkie z tagiem `:latest` (decyzja D10 z 2026-11-16).

Portainer GitOps (s1/s2) bierze stos z `main` CG Playout; `stack-refresh.yml` co 15 min aktualizuje `.release` (wersje obrazów), co przeładowuje stosy. Profile compose: `grafika` (silnik VizRS i sidecar), `ingest` (odbiorniki live, wymaga `grafika`); bez profilu – sam ErsatzTV z panelem. Stosy z grafiką mają `COMPOSE_PROFILES=grafika,ingest` i włączone „Re-pull image” (od 2026-11-16).

Porty: **8088** CG System (w stosie wystawiony jako 8788) · **6100** TCP VizRS · **7700** sidecar · **8090** panel · **8409** widzowie (Caddy) · **1936–1943** RTMP · **9000–9007/udp** SRT · Artist: tylko `127.0.0.1:20000–31999`.

## 7. Słownik

- **Trio** – stanowisko playoutu stron (CG System `/trio`); **Artist** – projektowanie scen; nazwy wzorowane na Vizrt.
- **Scena / strona** – szablon graficzny / wypełniona instancja szablonu z numerem (np. `TAKE 7510`).
- **Antena kanału, `bus=ch-N`, `@N`** – osobny stan on-air CG Systemu dla kanału N ErsatzTV.
- **Burn-in / nakładka** – wtapianie `/output` w obraz kanału przez podmieniony ffmpeg (`vizrs-ffmpeg`).
- **Live ingest / takeover** – sygnał studia RTMP/SRT przejmuje kanał w miejsce ramówki; `on_live` – grafika na czas przejęcia.
- **ZDEJMIJ / WPUŚĆ** (hold/release) – operator blokuje/wpuszcza studio na antenę kanału.
- **`.cgpack`** – paczka ZIP scen+stron+zasobów (Artist ↔ CG System); `.vizrs.json` – dawny format sceny.
- **VizRS Bridge** – wtyczka C# ładowana do niezmienionego ErsatzTV legacy, wykonuje komendy MediatR z białej listy.
- **ErsatzTV legacy / Next** – backend kanałów; Next = nowy silnik nadawania używany przez legacy.

## 8. Stan połączenia

Pakiet po połączeniu składa się z 3 aplikacji:

| Aplikacja | Składniki | Styki z resztą pakietu |
|---|---|---|
| **VizRS CG System** | `vizrs` (Trio, `/output`, TCP 6100, HTTP/SSE), `vizrs-shell`, `vizrs-render` | dostawca: protokół VizRS, `/output`, `vizrs-render`, format show/`.cgpack`, wspólny kod UI i okna |
| **VizRS CG Artist** | `vizrs-cg-artist` (Tauri 2) | klient CG System (deploy scen, `.cgpack`) |
| **VizRS CG Playout** | sidecar `vizrs-cg` (+ `vizrs-ffmpeg`, `vizrs-etv-client`, ingest), **panel** `panel/` (`vizrs-live` + UI SPA + desktop Tauri), **VizRS Bridge** (C# w ErsatzTV), stos compose | klient CG System (TCP 6100, `/api/show`, `/output`, `vizrs-render`); osadzenie ramki `/output` i odnośniki do Trio w panelu |

Dawne osobne repozytorium VizRS Live zostało wchłonięte do CG Playout. Live API (sidecar ↔ panel), nakładka compose i wspólne wydania stały się wewnętrznymi sprawami jednego produktu z jedną wersją. Zasady agentów (`CLAUDE.md`/`AGENTS.md`/`GEMINI.md`, `docs/AGENCI.md`) są synchronizowane z wzorca w CG System.

### Status realizacji (szczegóły: [PLAN-PORZADKOWANIA.md §7](PLAN-PORZADKOWANIA.md#7-stan-realizacji-2026-11-16))

Połączenie zakończone 2026-11-16:
- **P1–P2**: panel w `panel/` repozytorium CG Playout (z historią), jeden stos compose z profilami `grafika`/`ingest`, jedna nakładka `docker-compose.live.yml`, jedno `release.yml` z jedną wersją produktu.
- **Dokumentacja produktu**: [`docs/DOKUMENTACJA.md`](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md) (sidecar §1–§8, panel §9–§15), [`docs/API.md`](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md), RUNBOOK, INSTRUKCJA.
- **P3**: stosy s1 i s2 przełączone (Portainer: `COMPOSE_PROFILES=grafika,ingest`, „Re-pull image”), pierwsze wspólne wydanie **26.11.11** na obu serwerach.
- **P4**: repo `sdorpl/VizRS-Live-Playout` zarchiwizowane, katalog lokalny `VizRS CG Playout` (dawniej `VirtRS CG Playout`), kopie wspólnego kodu i zasad bez odwołań do VizRS Live.

## Licencja

MIT – [LICENSE](LICENSE). Pakiet współpracuje z [ErsatzTV](https://ersatztv.org) (legacy: zlib, Next: MIT) i nie zawiera
jego kodu – powered by ErsatzTV.
