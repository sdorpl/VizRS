# VizRS – pakiet grafiki i playoutu telewizyjnego

Opis całego pakietu: co za co odpowiada, jak aplikacje współpracują i jaki tworzą stos.
Kod jest w repozytoriach aplikacji: [VizRS-CG-System](https://github.com/sdorpl/VizRS-CG-System),
[VizRS-CG-Artist](https://github.com/sdorpl/VizRS-CG-Artist), [VizRS-CG-Playout](https://github.com/sdorpl/VizRS-CG-Playout)
(oraz – do czasu połączenia z CG Playout – [VizRS-Live-Playout](https://github.com/sdorpl/VizRS-Live-Playout)).

## Mapa aplikacji i stosu

> Stan na 2026-11-15. Źródło: analiza czterech repozytoriów (agy / Gemini) oraz weryfikacja kluczowych twierdzeń
> w kodzie (porty, styki, wspólne pliki, wersje). Plan porządków: [PLAN-PORZADKOWANIA.md](PLAN-PORZADKOWANIA.md).
>
> **Kierunek (decyzja 2026-11-15):** VizRS Live zostanie wchłonięty przez **VizRS CG Playout** (jeden produkt:
> sidecar + panel + most + stos). Pakiet będzie liczył 3 aplikacje: CG System, CG Artist, CG Playout – patrz §8
> i [plan połączenia](PLAN-PORZADKOWANIA.md#3-plan-połączenia-vizrs-live--vizrs-cg-playout).
> Poniższe sekcje 1–7 opisują stan **obecny** (4 repozytoria).

## 1. Cztery aplikacje w jednym zdaniu

| Aplikacja | Katalog / repo | Wersja | Co robi | Kto używa |
|---|---|---|---|---|
| **VizRS CG System** | `VizRS CG System` · `sdorpl/VizRS-CG-System` | 26.11.8 | **Silnik grafiki**: trzyma show (sceny, strony), prowadzi stan anteny (TAKE/OUT/UPDATE…), podaje Trio (playout stron) i przezroczyste wyjście `/output` 1920×1080 | operator grafiki (Trio), OBS/vMix, pozostałe aplikacje |
| **VizRS CG Artist** | `VizRS CG Artist` · `sdorpl/VizRS-CG-Artist` | 26.11.9 | **Edytor scen i animacji** (desktop, Tauri 2). Działa bez serwera, sceny wysyła (deploy) na serwer `vizrs` albo do paczek `.cgpack` | grafik |
| **VizRS CG Playout** | `VirtRS CG Playout` · `sdorpl/VizRS-CG-Playout` (dawniej VirtRS) | 26.11.10 | **Sidecar obok ErsatzTV**: na start klipu wysyła komendy do CG System, wtapia `/output` w obraz kanału (nakładka ffmpeg), zdejmuje grafikę na reklamach, **live ingest** RTMP/SRT przejmuje kanał (takeover), wystawia **Live API** | automatyka kanału; sterowany z VizRS Live |
| **VizRS Live** | `VizRS Live` · `sdorpl/VizRS-Live-Playout` | 26.11.10 | **Panel kanału (MCR)** nad ErsatzTV legacy: kanały, ramówka, playouty, media, EPG, mozaika, alarmy, as-run, grafika kanału i sloty na żywo – zamiast web GUI ErsatzTV | operator emisji, planista, administrator |

Zewnętrzny, **niezmieniany** składnik stosu: **ErsatzTV legacy** (.NET; baza, skaner, planowanie, transkodowanie HLS/TS).

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
   operator emisji ── przeglądarka / AppImage ──────►│ VizRS Live  │►│ ErsatzTV legacy + VizRS Bridge │
                      :8090                          │ vizrs-live  │ │ (C#, MediatR, biała lista)     │
                                                     └─────────────┘ └──▲────────────────────────────┘
   widzowie ── :8409 Caddy (tylko /iptv/*, /artwork/*, HDHomeRun; reszta 403) ──┘
```

Dodatkowo przeglądarka operatora VizRS Live osadza ramkę `/output` CG Systemu (token wyjścia) i linkuje do Trio
(`?channel=N`) – to styk tylko po stronie przeglądarki, serwer panelu nie rozmawia z CG Systemem.

## 3. Styki (kontrakty) – kto jest dostawcą

| Styk | Dostawca (tam opis) | Klienci | Treść |
|---|---|---|---|
| Protokół VizRS: TCP 6100 | CG System `docs/API.md` | CG Playout, Companion | `AUTH`, `STATE`, `TAKE`, `ARM`, `CONTINUE`, `OUT`, `UPDATE`, `MACRO`, `TICKER`, `NEXT`, `@kanał …` |
| API HTTP + SSE `/events` | CG System `docs/API.md` | Artist (pośrednik), CG Playout (`/api/show`), Companion | `/api/take…`, `/api/show`, `/api/scenes`, `/api/assets`, `/api/state`, `/api/variables`, `/api/channels` |
| Wyjście `/output` (`bus=ch-N`, token wyjścia) | CG System | OBS, CG Playout (Chromium), VizRS Live (ramka) | przezroczysta strona 1920×1080 |
| `vizrs-render` (`stream`, `thumb`, `bounds`) | CG System (`source/render`) | CG Playout | natywny render CPU bez przeglądarki; obraz CG Playout klonuje CG System z tagu `VIZRS_REF` |
| Format show (`show.json`) i `.cgpack` | CG System (`DOKUMENTACJA`, `web/cgpack.js`) | Artist | sceny, strony, zasoby; paczka ZIP z manifestem |
| Live API `:7700` | CG Playout `docs/DOKUMENTACJA.md` §1 „Live API” | VizRS Live (`/api/cg/*`) | `/health`, `/etv/pages`, `/ingest/state`, `/api/live/state|channels/{ch}/hold|release|take|out|rebuild|graphics|inputs|encoder|shows|asrun|logs|thumbs` |
| Wspólny stos compose | VizRS Live (`compose.cg-playout.yml`, źródło) ↔ CG Playout (`docker-compose.live.yml`, kopia dla Portainera) | – | zgodność pilnuje `VizRS Live/scripts/check-cg-overlay.sh` |
| VizRS Bridge `/vizrs-bridge/command/{Nazwa}` | VizRS Live (`bridge/`, `commands.txt`) | serwer `vizrs-live` | komendy MediatR ErsatzTV legacy z białej listy |

Zasady (identyczne we wszystkich repo, DOKUMENTACJA §1): styk zmienia się w obu repo naraz; starszy sąsiad nie może
psuć emisji; wydania sprawdzane razem, minimalna wersja sąsiada w `CHANGELOG.md`.

## 4. Wspólny kod (kopie, nie biblioteka)

| Plik(i) | Źródło | Kopie | Pilnowanie |
|---|---|---|---|
| `vizrs-ui.css` (rdzeń wyglądu) | CG System `source/web/` | Artist `web/`, Live `server/web/` | `tools/sync-cg.sh --check` (Artist, CI), `scripts/sync-ui.sh` (Live) – **dziś identyczne** |
| `renderer.js`, `motion.js`, `cgpack.js`, `pack-ui.js`, `qr.js`, `richtext.js`, `ticker-*.js`, `color-picker.js`, fonty | CG System `source/web/` | Artist `web/` (commit w `web/CG_SYSTEM`) | `sync-cg.sh --check` w CI Artist |
| `gpu.rs`, `scale.rs`, `screen.rs` (okno Tauri na Linuksie: NVIDIA DMA-BUF, Skia CPU, XWayland przy skali ułamkowej) | CG System `source/shell/src/` | Artist `src/`, Live `desktop/src/` | **dziś identyczne bajt w bajt**; brak automatu po stronie Live |

## 5. Stos technologiczny

| | CG System | CG Artist | CG Playout | VizRS Live |
|---|---|---|---|---|
| Rdzeń | Rust 2021, **0 zależności** (własny HTTP/1.1, SSE, JSON, OSC) | Rust + Tauri 2, `ureq`/rustls | Rust 2024 (1.87+), tylko `png`, `regex`; własny HTTP, JSON, klient DevTools | Rust, **0 zależności** (serwer) |
| UI | czysty JS (ES modules), bez bundlera | ten sam JS + `native.js` | brak UI (API) | czysty JS SPA, MSE + własny demux TS→fMP4 |
| Okno | `vizrs-shell` (Tauri 2), `vizrs trio` (Edge/Chromium bez pasków) | Tauri 2 (WebKitGTK 4.1 / WebView2 / WKWebView) | – | `desktop/` Tauri 2 (AppImage) |
| Render | przeglądarka; `vizrs-render` (tiny-skia, rustybuzz) | WebView (ten sam renderer.js) | Chromium headless shell albo `vizrs-render` | – |
| Inne | – | – | ffmpeg (nakładka `vizrs-ffmpeg`), musl | **C# / .NET 10** VizRS Bridge (startup hook w ErsatzTV) |
| Dystrybucja | binarki, `.deb/.rpm/AppImage`, Inno Setup, obraz `scratch` ~3 MB (amd64/arm64) | `.deb/.rpm/AppImage/.msi/.exe/.dmg` (bez Dockera) | `ghcr.io/sdorpl/vizrs-cg` (amd64/arm64), `vizrs-seed`, archiwa | `ghcr.io/sdorpl/vizrs-live`, `vizrs-live-legacy`, AppImage |

Wspólne cechy: Rust bez frameworków, UI bez bibliotek JS, wszystko po polsku, wersje kalendarzowe `RR.MM.N`
(od 26.11.1, 2026-11-12; wcześniej semver), wydanie = tag `v*` → GitHub Actions (`release.yml`).

## 6. Stos produkcyjny (Docker)

Jeden projekt compose uruchamiany z katalogu **CG Playout**:

```
docker-compose.yml               seed · vizrs (CG System, :8788→8088) · cg (:7700) · ersatztv · ingest (RTMP/SRT)
 + docker-compose.ampere.yml     ARM64 Neoverse-N1, x264 ultrafast, tmpfs transcode, DOTNET_gcServer=0
 | docker-compose.nvidia.yml     NVENC + Chromium EGL (CDI)
 | docker-compose.vaapi.yml      /dev/dri/renderD128
 + docker-compose.live.yml       (Portainer) albo ../VizRS Live/compose.cg-playout.yml (lokalnie, buduje legacy+most):
                                 ersatztv → legacy z VizRS Bridge, proxy (Caddy :8409 dla widzów), live (:8090)
```

Portainer GitOps (s1/s2) bierze stos z GitHuba; `stack-refresh.yml` w CG Playout co 15 min aktualizuje `.release`
(wersje obrazów). VizRS Live może też działać sam (`compose.yml`: ersatztv+most, proxy, live) – bez grafiki.

Porty: **8088** CG System (w stosie wystawiony jako 8788) · **6100** TCP VizRS · **7700** sidecar · **8090** panel ·
**8409** widzowie (Caddy) · **1936–1943** RTMP · **9000–9007/udp** SRT · Artist: tylko `127.0.0.1:20000–31999`.

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

## 8. Stan docelowy pakietu (po połączeniu)

| Aplikacja | Składniki | Styki z resztą pakietu |
|---|---|---|
| **VizRS CG System** | `vizrs` (Trio, `/output`, TCP 6100, HTTP/SSE), `vizrs-shell`, `vizrs-render` | dostawca: protokół VizRS, `/output`, `vizrs-render`, format show/`.cgpack`, wspólny kod UI i okna |
| **VizRS CG Artist** | `vizrs-cg-artist` (Tauri 2) | klient CG System (deploy scen, `.cgpack`) |
| **VizRS CG Playout** | sidecar `vizrs-cg` (+ `vizrs-ffmpeg`, `vizrs-etv-client`, ingest), **panel** `vizrs-live` + UI, **VizRS Bridge** (C#), okno panelu (Tauri), stos compose | klient CG System (TCP 6100, `/api/show`, `/output`, `vizrs-render`); ramka `/output` i odnośniki do Trio w panelu |

Live API (sidecar ↔ panel), dwie kopie nakładki compose i `check-cg-overlay.sh` przestają być stykiem między repo —
stają się wewnętrznymi sprawami jednego produktu z jedną wersją. Zasady agentów (`CLAUDE.md`/`AGENTS.md`/`GEMINI.md`,
`docs/AGENCI.md`) – jeden wzorzec z CG System, synchronizowany skryptem (plan §4).

## Licencja

MIT – [LICENSE](LICENSE). Pakiet współpracuje z [ErsatzTV](https://ersatztv.org) (legacy: zlib, Next: MIT) i nie zawiera
jego kodu – powered by ErsatzTV.
