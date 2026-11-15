# Porządkowanie pakietu VizRS – diagnoza i plan

> Stan na 2026-11-15, wersja 3: uwzględnia decyzje użytkownika D1–D6 z tego dnia.
> ✔ = sprawdzone przeze mnie w plikach; (agy) = tylko z raportu agy, bez sprawdzenia.

## Decyzje użytkownika (2026-11-15)

- **D1. VizRS Live łączy się z VizRS CG Playout w jeden produkt o nazwie „VizRS CG Playout”.** Pakiet docelowo liczy trzy aplikacje: CG System, CG Artist, CG Playout (§3).
- **D2. Pliki `AGENTS.md`, `CLAUDE.md` i `GEMINI.md` są ujednolicone we wszystkich projektach na wzór VizRS CG System.** Zasady są wspólne dla pakietu, a różnią się tylko częścią właściwą dla projektu (§4).
- **D3. ffPlayout nie jest już używany**, więc zasady i odniesienia do niego są nieaktualne. **Licencja pakietu ma pasować do ErsatzTV** (§4.3): MIT, właściciel w `Copyright (c) 2026 sdorpl`.
- **D4. Panel nazywa się jak aplikacja: „VizRS CG Playout”.** Dopisek „powered by ErsatzTV” trafia tam, gdzie wymaga go licencja (§4.3: nie jest wymagany, rekomendowany w „O programie” i README).
- **D5. Opis pakietu trafia do nowego repo `sdorpl/VizRS`** (ten plan i mapa pakietu).
- **D6. AppImage panelu to natywna aplikacja sterowania**: klient panelu VizRS CG Playout na serwerze, a nie lokalna kopia panelu (§3.6).

---

## 0. Errata do raportów agy

Surowe raporty agy (szkic; nie ma ich w repo) traktuj ostrożnie. Poniższe twierdzenia są w nich **błędne**:

| Raport | Twierdzenie agy | Stan faktyczny ✔ |
|---|---|---|
| cg-artist §5 | CG System ma „TCP 6100 AMCP, NDI” | nie ma AMCP ani NDI; TCP 6100 to własny protokół tekstowy w stylu Viz |
| cg-artist §5 | domyślny port serwera `vizrs` to 8788 | domyślny to **8088** (`source/src/config.rs`); 8788 to port wystawiony w compose CG Playout |
| cg-playout §6 | sidecar pobiera `GET /show.json` | pobiera **`GET /api/show`** (`src/bounds.rs`) |
| cg-playout §5 | Live API przyjmuje tylko `X-Panel-Token` | przyjmuje `X-Panel-Token` **albo** `Authorization: Bearer` (`src/panel.rs`) |
| live §5 | CG System nasłuchuje na 8788/**8789** | portu 8789 nie ma nigdzie |
| cg-system §8 pkt 4 | „VirtRS” w DOKUMENTACJI to literówka | to nazwa **katalogu**; zniknie przy porządkach z §3.4 |

## 1. Rozbieżności dokumentacji z kodem

### VizRS CG System
- ✔ `docs/DOKUMENTACJA.md` w wierszu 3 podaje „Wersja 2.0.19”, a kod jest w 26.11.8.
- ✔ `docs/STATUS.md` ma datę 2026-11-07 i etap 2.1.x. Brakuje wydań 26.11.1–26.11.8.
- ✔ `source/shell/tauri.conf.json` ma `26.11.1`, a `source/shell/Cargo.toml` ma `26.11.8`.
- (agy) `docs/API.md` nie mówi wprost, że jest tylko SSE (bez WebSocket) i że nie ma wyjść NDI/SRT/RTMP.

### VizRS CG Artist
- (agy) §11 podaje „cargo test 34/34”, a w kodzie jest ok. 52 testów. W STATUS jako „następne” wciąż figuruje J1–J5, choć to już wydane. W tabeli §3 brakuje `VIZRS_CONFIG`.

### VizRS CG Playout (obecne repo `VirtRS CG Playout`)
- ✔ Dokumentacja twierdzi, że „zmienne `VIRTRS_*` zostają”. Kod używa wyłącznie `VIZRS_*`; starą nazwę ma tylko `VIRTRS_CG_BIN` w testach.
- ✔ W `Dockerfile` jest `ARG VIZRS_REF=v26.11.3`, a w `.release` `vizrs v26.11.5`.
- ✔ Brak `CHANGELOG.md`, `STATUS.md`, `LUKI.md`, `RUNBOOK.md`, `API.md` i `docs/AGENCI.md`. Cały opis jest w jednym `docs/DOKUMENTACJA.md` (2819 linii).
- (agy) `package.json` ma wersję `2.3.1`, a komentarz w `release.yml` przykład `v2.0.6`.

### VizRS Live
- ✔ README („Stan: 1.2.3”) i `docs/STATUS.md` („Wydanie 1.2.3”) są nieaktualne; kod jest w 26.11.10.
- ✔ LUKI #22 czeka na `layers`/`features` z CG Playout, a CG Playout już je wystawia (`src/panel.rs`, K12).
- (agy) Tytuły DOKUMENTACJI §5 i §9 są nieaktualne. W `PLAN-mcr.md` K12–K14 i K17 wciąż mają status „czeka na CG Playout”.
- ✔ `.release` w CG Playout śledzi tylko `vizrs-cg` i `vizrs`. Panel (`vizrs-live`) nie jest objęty automatycznym odświeżaniem stosu.

### Przekrojowe
- ✔ Tabela „Pakiet VizRS – zgodność” powtarza się w 4 repo, za każdym razem w innym brzmieniu.
- ✔ Plan rodziny `PLAN-vizrs-live.md` leży w CG System.
- ✔ Licencja: tylko VizRS Live deklaruje MIT (README i `server/Cargo.toml`). CG System, Artist i CG Playout nie mają pliku licencji ani pola `license`.
- ✔ Zasada w CLAUDE.md CG Playout brzmi: „nie kopiuj kodu między repozytoriami rodziny (różne licencje)”. Tymczasem Artist i Live **celowo** kopiują `vizrs-ui.css`, `gpu.rs`, `scale.rs` i `screen.rs` z CG System. Zasada pochodzi z czasów ffPlayout; według D3 jest nieaktualna i do zastąpienia (§4.3).
- ✔ Odniesienia do ffPlayout są nieaktualne (D3): CLAUDE.md/AGENTS.md i README CG Playout (zasady i tabela), DOKUMENTACJA CG Playout §2, komentarze w `src/devtools.rs` i `src/ingest.rs`, plany w trzech repo (§4.3).

---

## 2. Pakiet docelowy

| Aplikacja | Repo | Składniki |
|---|---|---|
| **VizRS CG System** | `sdorpl/VizRS-CG-System` | serwer `vizrs` (Trio, `/output`, TCP 6100), `vizrs-shell`, `vizrs-render` |
| **VizRS CG Artist** | `sdorpl/VizRS-CG-Artist` | edytor `vizrs-cg-artist` |
| **VizRS CG Playout** | `sdorpl/VizRS-CG-Playout` (wchłania `VizRS-Live-Playout`) | sidecar `vizrs-cg` + `vizrs-ffmpeg` + `vizrs-etv-client` + ingest; **panel** `vizrs-live` + UI; **VizRS Bridge** (C#); aplikacja okienna panelu (Tauri); stos compose |

Po połączeniu znika jeden z najtrudniejszych styków pakietu: panel ↔ sidecar (Live API, dwie kopie compose, `check-cg-overlay.sh`). Staje się wewnętrznym API jednego produktu. Zmiana obu stron idzie w jednym commicie, a wersja jest jedna.

### 2.1 Repo pakietu `sdorpl/VizRS` (D5)

Jedno miejsce na opis całego pakietu: `README.md` (mapa aplikacji, styki, stos, porty, słownik), ten plan, a docelowo
`STYKI.md` (kontrakty: dostawca → klienci) i `ZGODNOSC.md` (minimalne wersje sąsiadów dla bieżących wydań) oraz
przekrojowe plany (np. przeniesiony `PLAN-vizrs-live.md` z CG System). W repo aplikacji DOKUMENTACJA §1 i README
skracają się do roli aplikacji, jej styków i linku tutaj.

## 3. Plan połączenia VizRS Live → VizRS CG Playout

### 3.1 Kierunek: Live wchodzi do repo CG Playout
Uzasadnienie:
- **Produkcja już stoi na repo CG Playout.** Stosy Portainera na s1/s2 biorą `docker-compose.yml` oraz `docker-compose.live.yml` z GitHuba CG Playout.
- **Repo CG Playout ma `stack-refresh.yml` i `.release`**, czyli mechanizm odświeżania stosu.
- **Nazwa docelowa jest ta sama co repo.** Repo `VizRS-Live-Playout` po połączeniu zostaje zarchiwizowane z notką o przeniesieniu.

### 3.2 Układ repo po połączeniu (propozycja)

```
VizRS CG Playout/
├── Cargo.toml              workspace (members: ., panel/server); sidecar zostaje w korzeniu (src/), żeby nie ruszać ścieżek builda i obrazu
├── src/                    sidecar vizrs-cg, vizrs-ffmpeg, vizrs-etv-client (bez zmian)
├── panel/
│   ├── server/             vizrs-live (Rust, 0 zależności) + web/ (UI)
│   ├── bridge/             VizRS Bridge (C#, commands.txt)
│   ├── desktop/            okno panelu (Tauri 2, osobny workspace i Cargo.lock jak dziś)
│   └── docker/             live.Dockerfile, legacy-bridge.Dockerfile, proxy.Caddyfile
├── docker-compose.yml      seed · vizrs · cg · ersatztv · ingest
├── docker-compose.live.yml panel: ersatztv+most · proxy · live (jedna kopia; compose.cg-playout.yml i check-cg-overlay.sh znikają)
├── docker-compose.{ampere,nvidia,vaapi}.yml
├── tests/                  testy kontraktu sidecara + panel/tests (deploy.sh, gate.sh, e2e…)
└── docs/                   jedna dokumentacja produktu (§3.5)
```

**Historia:** `git subtree add --prefix=panel` z historią albo `git filter-repo --to-subdirectory-filter panel` i merge z `--allow-unrelated-histories`. Obie drogi zachowują `git log`/`blame` panelu. Tagi Live (`v1.x`, `v26.11.x`) dostają przedrostek `live-`, żeby nie zderzyły się z tagami sidecara.

### 3.3 Co zostaje, co się zmienia

| Obszar | Teraz | Po połączeniu |
|---|---|---|
| Wersja | sidecar 26.11.10, panel 26.11.10 (przypadkiem równe) | **jedna wersja** dla `vizrs-cg`, `vizrs-live`, mostu (`VizRS.Bridge.csproj`, stała w `Bridge.cs`) i okna. Pilnuje tego jeden test bramki |
| Obrazy | `ghcr.io/sdorpl/vizrs-cg`, `vizrs-live`, `vizrs-live-legacy` | **nazwy obrazów bez zmian** (Portainer ich używa); budowane z jednego `release.yml` na jednym tagu |
| Live API sidecara | styk między repo, z zasadą „starszy sąsiad nie psuje” | wewnętrzne API produktu; opis w `docs/API.md`. Zgodność wsteczną zachowujemy tylko na czas mieszanych wersji kontenerów w trakcie aktualizacji |
| Compose | `docker-compose.live.yml` (CG Playout) ≡ `compose.cg-playout.yml` (Live) + `check-cg-overlay.sh` | jedna nakładka `docker-compose.live.yml`. Caddyfile zostaje wpisany w `configs:`, bo Portainer nie montuje plików z repo (do sprawdzenia w Portainerze). Samodzielny tryb panelu bez grafiki (`compose.yml` z Live) albo zostaje jako `docker-compose.panel-only.yml`, albo znika (decyzja) |
| CI | CG Playout: `ci`, `release`, `stack-refresh`; Live: `ci`, `release`, `legacy-latest`, `drafts` | `ci.yml` z dwoma zadaniami (sidecar, panel) plus `release.yml` (binarki musl, 3 obrazy, AppImage panelu, SHA256). Bez zmian: `stack-refresh.yml` (z `vizrs-live` w `.release`), `legacy-latest.yml`, `drafts.yml` |
| Nazwy w UI i paczkach | „VizRS Live”, AppImage `VizRS-Live-…` | **„VizRS CG Playout”** (D4): tytuł panelu i okna, AppImage `VizRS-CG-Playout-<wersja>-x86_64.AppImage`, binarka okna `vizrs-cg-playout`; w „O programie”: „powered by ErsatzTV”. Zmienne `VIZRS_LIVE_*` i nazwy obrazów zostają (stosy produkcyjne) |
| Pozostałe repo | linki `../VizRS Live`, `../VirtRS CG Playout` (32 wystąpienia w .md/.sh/.yml) | linki do jednego `../VizRS CG Playout`; tabela pakietu z 3 aplikacjami |

### 3.4 Etapy (każdy kończy się zielonym stanem i może być wdrożony)

1. **P0 – przygotowanie** (bez zmian w produkcji):
   - doprowadzić docs obu repo do zgodności z kodem (§1);
   - w Live dodać `vizrs-live` do `.release` CG Playout, żeby stack-refresh już dziś obejmował panel;
   - zamrozić nowe funkcje w Live na czas połączenia.
2. **P1 – wciągnięcie kodu:**
   - subtree/filter-repo do `panel/`;
   - poprawić ścieżki w Dockerfile'ach (`panel/docker/*`), w CI i w skryptach testów (`tests/deploy.sh`, `stack.sh`, `sync-ui.sh` → `panel/scripts/`);
   - bramka sidecara i bramka panelu przechodzą osobno.
3. **P2 – jeden stos i jedno wydanie:**
   - jedna nakładka compose, usunąć `compose.cg-playout.yml` i `check-cg-overlay.sh`;
   - połączone `ci.yml` i `release.yml`, jedna wersja;
   - tag próbny `v26.11.N-test.1`;
   - test na lokalnym stosie `virtrs-*` przez `tests/deploy.sh`.
4. **P3 – przełączenie produkcji:**
   - Portainer s1/s2 zostaje przy tym samym repo i tych samych ścieżkach; zmieniają się tylko obrazy z nowego wydania;
   - przed przełączeniem sprawdzić zmienne `VIZRS_LIVE_*` i tokeny;
   - na serwerach mogą trwać testy na żywo (np. przejęcia live ingest), więc okno przełączenia ustala użytkownik.
5. **P4 – dokumentacja i porządki:**
   - jedna dokumentacja (§3.5);
   - archiwizacja `sdorpl/VizRS-Live-Playout` z notką w README;
   - aktualizacja linków w CG System i Artist;
   - zmiana nazwy katalogu `VirtRS CG Playout` → `VizRS CG Playout` (razem z domyślnymi ścieżkami w skryptach: `VIZRS_CG_DIR`, `tests/deploy.sh`).

### 3.5 Dokumentacja połączonego produktu

| Plik | Skąd |
|---|---|
| `README.md` | nowy, krótki: sidecar + panel + stos, uruchomienie, link do pakietu |
| `docs/DOKUMENTACJA.md` | opis działania: sidecar (z dzisiejszego 2819-liniowego pliku, bez API i wdrożenia) plus panel (Live DOKUMENTACJA §2–§4: most, ekrany) |
| `docs/API.md` | **nowy**: Live API `:7700/api/live/*`, `/etv*`, `/ffmpeg*`, `/ingest*`, API panelu `/api/*` i mostu `/vizrs-bridge/*`. To dziś CG Playout §1 „Live API” i Live §3 |
| `docs/INSTRUKCJA.md` | Live INSTRUKCJA (operator) |
| `docs/RUNBOOK.md` | Live RUNBOOK plus wdrożenie CG Playout (compose, GPU, Ampere, Portainer, `.release`) |
| `docs/STATUS.md`, `docs/LUKI.md` | z Live, rozszerzone o sidecar. Luki sidecara (agy §9: brak priorytetu sygnałów ingest itd.) jako nowe wiersze |
| `CHANGELOG.md` | z Live plus historia sidecara odtworzona z tagów 26.11.x |
| `docs/plany/` | PLAN-mcr i plany sidecara; zamknięte (PLAN-live-panel, PLAN-rust, PLAN-ampere, PLAN-p400, PLAN-plynnosc, PLAN-rozbudowy, PLAN-makieta) trafiają do `plany/archiwum/` |
| `docs/AGENCI.md` | z wzorca pakietu (§4) |

### 3.6 Aplikacja okienna: natywny klient sterowania (D6)

- **Stan (2026-11-15):** AppImage `VizRS-Live-26.11.10` nie działał. Domyślnie uruchamiał „panel lokalny” (`vizrs-live` w paczce), który na stacji operatora bez ErsatzTV kończył się błędem „brak tokenu mostu” i spychał użytkownika do okna połączenia z mylącym komunikatem.
- **Poprawka gotowa w kopii roboczej VizRS Live, bez commita:**
  - okno jest wyłącznie klientem panelu na serwerze: przy starcie zapisany panel, bez niego okno „Połącz z panelem”;
  - usunięte: tryb `local`, `--live`, `-- …`, `VIZRS_LIVE_BIN`, przycisk „Panel lokalny”, menu logów, `vizrs-live` w paczce (`tauri.bundle.json`, krok `release.yml`);
  - test `desktop/tests/okno.cjs`: 12/12; cargo clippy/test zielone; docs, CHANGELOG i CLAUDE.md zaktualizowane.
- **Panel musi być osiągalny ze stacji operatora.** Port `8090` panelu na serwerze produkcyjnym jest wystawiony w Dockerze, ale z zewnątrz nie odpowiada (zapora / reguły sieci chmury). Potrzebny jest adres przez proxy TLS (np. Caddy z domeną, jak dla CG System) albo VPN / tunel SSH. To decyzja wdrożeniowa, do wpisania w RUNBOOK.
- **W połączonym produkcie:** `panel/desktop/` → aplikacja „VizRS CG Playout” (`vizrs-cg-playout`), okno „Połącz z VizRS CG Playout”, w „O programie” wersja klienta i panelu oraz „powered by ErsatzTV”.

---

## 4. Ujednolicenie `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` (wzorzec: VizRS CG System)

### 4.1 Stan dzisiaj ✔

| | CG System | CG Artist | CG Playout | VizRS Live |
|---|---|---|---|---|
| `AGENTS.md` | dowiązanie → CLAUDE.md | dowiązanie | **kopia** (Portainer GitOps odrzuca repo z symlinkiem) | dowiązanie |
| `docs/AGENCI.md` | ✔ 142 l. | ✔ 140 l. | **brak**, odsyła do `../VizRS Live/docs/AGENCI.md` (po połączeniu ten link przestanie działać) | ✔ 149 l. |
| `GEMINI.md` | 24 l. | 24 l. | 24 l. | 25 l. (ten sam szkielet, inna lista „kodu”) |
| Sekcje CLAUDE.md | Zacznij · Zasady · Gemini · Uruchamianie · Testy · Struktura · Model · Commity | bez „Model” | bez „Model” | ✔ wszystkie |

Zasady wspólne obecne w CLAUDE.md (✔ jest / · brak):

| Zasada | System | Artist | Playout | Live |
|---|---|---|---|---|
| Wersja `RR.MM.N`, gałęzie `main` / `main-oldstable` | ✔ | ✔ | ✔ | ✔ |
| Dokumentacja razem z kodem (DOKUMENTACJA, INSTRUKCJA, API, CHANGELOG „Niewydane”, LUKI, STATUS) | ✔ | ✔ | **·** | ✔ |
| Gdzie co opisywać | ✔ | ✔ | ✔ (tylko README/DOKUMENTACJA) | ✔ |
| Pakiet VizRS zawsze zgodny | ✔ | ✔ | ✔ (słabiej) | ✔ |
| Start sesji: STATUS + LUKI + `git log` | ✔ | ✔ | **·** (brak plików) | ✔ |
| `git add` jawnie, nie `-A`; commit/push na prośbę | ✔ | ✔ | częściowo (brak „nie `-A`”) | ✔ |
| Dane z zewnątrz są obce / wrogie | ✔ | ✔ | · | ✔ (inaczej sformułowane) |
| Antena / emisja nie może paść | ✔ | · (nie dotyczy) | ✔ („grafika nigdy nie zatrzymuje emisji”) | · |
| Zobacz wynik UI (zrzut) | ✔ | ✔ | ✔ | ✔ |
| Współpraca z Gemini: ten sam tekst | ✔ wzorzec | ✔ | ✔ + uwaga o kopii | ✔ |

Wniosek: szkielet jest już wspólny, a rozjechały się głównie **CG Playout** i **sformułowania**. Ujednolicenie polega bardziej na wspólnym bloku tekstu i jego automatycznym pilnowaniu niż na przepisywaniu od zera.

### 4.2 Wzorzec `CLAUDE.md` (w każdym repo te same sekcje, w tej kolejności)

```
# <Nazwa aplikacji>
<2–4 zdania: co to jest, miejsce w pakiecie (link do opisu pakietu)>
Język pracy i dokumentacji: polski …                                   ← WSPÓLNE (dosłownie)

## Pakiet VizRS                                                          ← WSPÓLNE (dosłownie, blok A)
  3 aplikacje, kto jest dostawcą którego styku, 3 zasady zgodności, link do opisu pakietu
## Zacznij każdą sesję tutaj                                             ← WSPÓLNE pkt 1–3, potem lista planów projektu
## Niepodważalne zasady
  ### Wspólne dla pakietu                                                ← WSPÓLNE (dosłownie, blok B):
      wersja RR.MM.N · dokumentacja razem z kodem · gdzie co opisywać ·
      dane z zewnątrz są obce · emisja/antena nie może paść przez nasz błąd ·
      zależności tylko z listy w nagłówku Cargo.toml · kopie wspólnego kodu tylko przez skrypt sync z CG System
  ### Tego projektu                                                      ← PROJEKT (dzisiejsze zasady techniczne)
## Współpraca z Gemini                                                   ← WSPÓLNE (blok C) + 1 wiersz: lista „kodu” projektu
## Uruchamianie                                                          ← PROJEKT
## Testy (bramka przed commitem)                                         ← PROJEKT (+ wspólny wiersz: „zobacz wynik UI”)
## Struktura                                                             ← PROJEKT
## Model w skrócie                                                       ← PROJEKT (Artist: model sceny; Playout: konfiguracja kanału)
## Commity                                                               ← WSPÓLNE (blok D) + wiersz „czego nie commitować” projektu
```

- **`AGENTS.md`**: **kopia** `CLAUDE.md` we wszystkich repo, a nie dowiązanie. Powody: CG Playout musi mieć kopię (Portainer); Artist i CG System budują się na Windowsie, gdzie symlinki w gicie bywają zawodne. Jedna reguła wszędzie, a bramka sprawdza `cmp CLAUDE.md AGENTS.md`.
- **`GEMINI.md`**: jeden wzorzec (dzisiejszy z CG System), który różni się tylko nazwą projektu i listą ścieżek „kodu” z AGENCI §2. Pozostałe zdania dosłownie te same.
- **`docs/AGENCI.md`**: jeden dokument pakietu, kopiowany dosłownie. Część zależną od projektu (§2 „Co jest kodem”, przykłady poleceń w §5) wydzielić do krótkiej tabeli na końcu albo do CLAUDE.md. Wtedy cały AGENCI.md jest identyczny w trzech repo.

### 4.3 Licencja i koniec ffPlayout (decyzja D3)

**Punkt odniesienia: ErsatzTV.** Według README VizRS Live ErsatzTV legacy ma licencję **zlib**, a ErsatzTV Next **MIT**. Przed wpisaniem licencji porównać to z plikami `LICENSE` upstream.
Pakiet nie zawiera kodu ErsatzTV. VizRS Bridge kompiluje się względem jego bibliotek i ładuje do jego procesu, a obraz `vizrs-live-legacy` dokłada jeden plik DLL do oficjalnego obrazu. Obie licencje są permisywne, więc pozwalają na każdą licencję własnego kodu. Kluczowe jest to, żeby nasza była z nimi zgodna i równie prosta.

**Rekomendacja: MIT dla wszystkich trzech aplikacji pakietu** (CG System, CG Artist, CG Playout z panelem). Powody:
- ta sama licencja co ErsatzTV Next (kierunek rozwoju ErsatzTV) i co obecny VizRS Live, więc po połączeniu nie powstaje mieszanka licencji w jednym repo;
- jest zgodna z zlib (legacy) oraz z zależnościami Rust w pakiecie (tauri, ureq, png, regex: MIT/Apache-2.0; tiny-skia: BSD-3; rustybuzz: MIT);
- jest najlepiej rozpoznawana (GitHub, crates, paczki dystrybucji).
- Alternatywa: **zlib**, czyli dosłownie ta sama licencja co legacy. Jest prawnie równie dobra, ale rzadsza i rozjechałaby się z Live/Next. Nie rekomenduję.

**„powered by ErsatzTV” (D4):** żadna z licencji ErsatzTV **nie wymaga** dopisku w interfejsie. zlib zabrania podawania się za autora oryginału i wymaga oznaczenia zmienionych wersji, a MIT wymaga zachowania noty licencyjnej w kopiach. Dopisek jest jednak najprostszym sposobem, żeby nie sugerować, że panel sam realizuje playout. Rekomendacja: „powered by ErsatzTV” (z linkiem do ersatztv.org) w „O programie” okna, w stopce/„Stan” panelu i w README CG Playout, bez logo ErsatzTV (znak towarowy).

**Co dokładnie zrobić (krok 1b w §5):**
- `LICENSE` (tekst MIT, `Copyright (c) 2026 sdorpl`) w każdym repo, `license = "MIT"` we wszystkich `Cargo.toml` (`source/`, `shell/`, `render/`, Artist, sidecar, `panel/server`, `panel/desktop`) oraz w `VizRS.Bridge.csproj` (`PackageLicenseExpression`). Sekcja „Licencja” w README: jedno zdanie plus link.
- **`THIRD-PARTY.md`** (albo `NOTICE`) tam, gdzie rozpowszechniamy cudzy kod:
  - CG System: **wbudowane fonty** (`source/src/fonts_data.rs`, `web/fonts/`; zwykle SIL OFL, który wymaga dołączenia licencji);
  - obraz `vizrs-cg`: Chromium headless shell i pakiety Debiana;
  - obraz `vizrs-live-legacy`: ErsatzTV (zlib wymaga, by zmieniona dystrybucja była wyraźnie oznaczona, więc dodać etykietę OCI `org.opencontainers.image.description` z informacją „oficjalny obraz ErsatzTV legacy + VizRS.Bridge.dll” i zostawić upstreamowy plik licencji). Ten obraz zawiera też **ffmpeg (GPL/LGPL) z obrazu ErsatzTV**. Redystrybucja przez ghcr wymaga wskazania źródeł, wystarczy odnośnik do upstreamu ErsatzTV i ffmpeg w opisie obrazu i w `THIRD-PARTY.md`.
- Treść licencji zgadza się z autorstwem: historia gita to `sdorpl` oraz commity agentów na jego zlecenie.

**ffPlayout – do usunięcia jako zasada, zostaje tylko historia:**
- Kodu upstream ffplayout (GPL-3.0) w pakiecie nie ma ✔. Przeniesiono wyłącznie moduły autora, a w źródłach CG Playout zostały tylko komentarze o pochodzeniu (`src/devtools.rs:4`, `src/ingest.rs:37`), więc nic nie stoi na przeszkodzie MIT.
- Z `CLAUDE.md`/`AGENTS.md` CG Playout usunąć: wiersz o repo „VizRS ffPlayout System”, zasadę „nie kopiuj kodu między repozytoriami rodziny (różne licencje)” z wyjątkiem dla modułów ffPlayout oraz zasadę „wzorzec VizRS ffPlayout System”. Dzisiejsze symbole i opcje (`on_clip`, `on_ad`, `{title}`…) opisać jako własny format CG Playout, bez odwołań do pochodzenia.
- W README CG Playout usunąć wiersz tabeli z archiwum ffPlayout i zdanie „Konfiguracja celowo odpowiada…”. W DOKUMENTACJI CG Playout tabelę „mapa pojęć ffPlayout” (§2) przenieść do `docs/plany/archiwum/` albo usunąć. Komentarze w kodzie: zostawić lub skrócić przy okazji, bez osobnego commita.
- Wzmianki w planach (CG System: `PLAN-kanal.md`, `PLAN-lekkie-output.md`, `plany/README.md`, `STATUS.md`; Live: `PLAN-mcr.md`; CG Playout: `PLAN-rust.md`, `PLAN-strefy.md`) to historia, która zostaje. Plany zakończone trafią do `archiwum/`.

**Nowa wspólna zasada o kopiowaniu kodu (blok B wzorca CLAUDE.md):**
- kod CG System trafia do innych aplikacji pakietu **tylko** przez skrypt synchronizacji (`sync-cg.sh`, `sync-ui.sh`, `sync-zasady.sh`) ze sprawdzaniem `--check` w CI; kopii nie edytuje się ręcznie;
- cudzy kod tylko na licencji zgodnej z MIT i z wpisem w `THIRD-PARTY.md`; ErsatzTV: wyłącznie przez jego interfejsy (element „script”, ścieżka FFmpeg, startup hook mostu), bez kopiowania jego kodu.

### 4.4 Jak utrzymać spójność
- **Źródłem bloków wspólnych (A–D), `GEMINI.md` i `docs/AGENCI.md` jest CG System**, tak jak dla `vizrs-ui.css`. Bloki w CLAUDE.md oznaczyć komentarzami `<!-- pakiet:A -->…<!-- /pakiet:A -->`.
- **Skrypt `tools/sync-zasady.sh [--check]`** (w Artist i CG Playout, wzór: `sync-cg.sh`) kopiuje bloki i pliki z `../VizRS CG System` i sprawdza `cmp CLAUDE.md AGENTS.md`. `--check` działa w CI każdego repo.
- Zmiana zasad pakietu: najpierw CG System, potem `sync-zasady.sh` w pozostałych, w tym samym cyklu (jak każda zmiana styku).

---

## 5. Kolejność prac

| # | Praca | Repo | Ryzyko |
|---|---|---|---|
| 1 | Poprawki wersji i stanu w docs (§1); `VIZRS_REF` = decyzja i test użytkownika | wszystkie | niskie |
| 1b | Licencja MIT: `LICENSE`, pole `license` w manifestach, `THIRD-PARTY.md` (fonty, Chromium, ErsatzTV + ffmpeg w `vizrs-live-legacy`), etykieta OCI obrazu legacy; usunięcie zasad ffPlayout z CG Playout (§4.3) | wszystkie | niskie (fonty: sprawdzić licencje) |
| 2 | Wzorzec zasad w CG System: bloki A–D, `GEMINI.md`, AGENCI.md wspólny, `sync-zasady.sh` | CG System | niskie |
| 3 | Zastosowanie wzorca w Artist, Live i CG Playout (w CG Playout: kopia AGENTS, nowy `docs/AGENCI.md`, uzupełnienie zasad wspólnych) | 3 repo | niskie |
| 4 | Połączenie P0–P2 (§3.4) | CG Playout + Live | średnie (CI, obrazy) |
| 5 | Połączenie P3, przełączenie produkcji s1/s2 | Portainer | **wysokie**, termin wybiera użytkownik |
| 6 | P4: dokumentacja produktu, archiwizacja Live, linki, nazwa katalogu | wszystkie | niskie |
| 0 | Wydanie poprawki AppImage (klient panelu, §3.6) jako VizRS Live 26.11.11 – po akceptacji diffu | Live | niskie |
| 7 | Opis pakietu w repo `sdorpl/VizRS` (D5); w każdym repo DOKUMENTACJA §1 i README skrócone do linku | VizRS + wszystkie | niskie |

Kroki 2–3 warto zrobić **przed** połączeniem. Połączone repo dostanie wtedy gotowe zasady, a `docs/AGENCI.md` CG Playout przestanie zależeć od repo, które znika.

## 6. Otwarte pytania do użytkownika

1. **Tryb samego panelu (ErsatzTV + panel, bez grafiki VizRS)** – dziś `compose.yml` VizRS Live stawia tylko `ersatztv` z mostem, `proxy` i `live`, bez `vizrs`, `cg` i `ingest`. Służy kanałom bez grafiki (mniej CPU: bez Chromium i nakładki ffmpeg). Po połączeniu stos bazowy CG Playout zawsze ma grafikę. Do wyboru:
   - (a) usunąć ten tryb (rekomendacja, jeśli żaden kanał go dziś nie używa: jeden stos, mniej do testowania);
   - (b) zostawić jako `docker-compose.panel-only.yml`;
   - (c) zostawić przez profile compose (`--profile grafika`).
2. **Dostęp do panelu z zewnątrz:** domena z TLS przez Caddy czy VPN / tunel (§3.6)?
3. Czy wydać poprawkę AppImage od razu jako VizRS Live 26.11.11, czy dopiero w połączonym produkcie?

Rozstrzygnięte: nazwa panelu (D4), miejsce opisu pakietu (D5), licencja i właściciel (D3), rola AppImage (D6).
