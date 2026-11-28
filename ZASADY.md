# Zasady pakietu VizRS

> Stan: 2026-11-28, opracowane z plików zasad trzech aplikacji: VizRS CG System `d510130`, VizRS CG Artist `c3db9b7`, VizRS CG Playout `925a2f2` (`CLAUDE.md` = `AGENTS.md`, `GEMINI.md`, `docs/AGENCI.md`).
> **Obowiązujący tekst** zasad wspólnych to bloki `<!-- pakiet:X -->` w `CLAUDE.md` VizRS CG System, kopiowane do pozostałych aplikacji przez `tools/sync-zasady.sh` (`--check` w CI). Ten dokument je porządkuje, dodaje zasady wynikające z wzorców powtarzanych w każdej aplikacji (§3) i wskazuje niezgodności (§4). Przy rozbieżności z blokiem wygrywa blok – a ten dokument trzeba poprawić.

## 1. Gdzie są zasady i jak się zmieniają

| Warstwa | Gdzie | Kto zmienia |
|---|---|---|
| Zasady pakietu – bloki **A** (pakiet i zgodność), **S** (początek sesji), **B** (niepodważalne), **C** (współpraca z Gemini), **D** (commity) | `CLAUDE.md` VizRS CG System (źródło); kopie w Artist i Playout | tylko w CG System, potem `tools/sync-zasady.sh` w każdym repo |
| Pliki wspólne: `GEMINI.md`, `docs/AGENCI.md`, `tools/sync-zasady.sh`, `tools/check-docs.sh` | VizRS CG System (źródło); kopie 1:1 | jak wyżej; wersja źródła w `docs/ZASADY_CG_SYSTEM` |
| Zasady jednej aplikacji – sekcje „Tego projektu”, „Ten projekt”, „Testy”, „Struktura”, „Commity” poza blokiem | `CLAUDE.md` danej aplikacji | w repo aplikacji |
| `AGENTS.md` | kopia `CLAUDE.md` (nie dowiązanie – Portainer GitOps odrzuca symlinki) | zawsze razem z `CLAUDE.md` |
| Zasady centrum | ten plik i README „Jak utrzymywać to repozytorium” | w sdorpl/VizRS |

Zmiana zasady pakietu: (1) blok w CG System, (2) `tools/sync-zasady.sh` w Artist i Playout, (3) ten dokument, (4) push CG System **przed** pozostałymi – ich CI pobiera z GitHuba commit z `docs/ZASADY_CG_SYSTEM`.

## 2. Zasady pakietu (bloki A, S, B, C, D – w skrócie)

**Pakiet i zgodność (A)**
1. Język pracy, dokumentacji, komentarzy, komunikatów i UI – polski (wyjątek: sidecar CG Playout, §3 Z11).
2. Centrum projektu to sdorpl/VizRS: opis pakietu, styki, zgodność wydań, spis dokumentacji. Co dotyczy więcej niż jednej aplikacji – tam; szczegóły – w repo aplikacji.
3. Styk zmienia się po obu stronach w tym samym cyklu; opis styku jest u dostawcy.
4. Starsza wersja sąsiada nie psuje aplikacji ani emisji – brak pola to „niedostępne w tej wersji”.
5. Przed wydaniem – sprawdzenie z bieżącymi wersjami sąsiadów; wymóg nowszego sąsiada – w CHANGELOG z minimalną wersją.
6. Po wydaniu – wiersz w `ZGODNOSC.md`; zmiana funkcji/styku – README §1–§2 i `STYKI.md`; zmiana otwartych planów – README §9.
7. Plan w innym repo aktualizuje się w tym samym cyklu co kod.

**Początek sesji (S)** – STATUS, `git log -5`, `git status`, LUKI; przed zmianą zachowania – właściwa sekcja DOKUMENTACJI; przed zmianą styku – opis u dostawcy; najpierw graf wiedzy (`/graphify`), graf to skrót, nie źródło prawdy.

**Niepodważalne (B)**
1. Emisja nie pada przez nasz błąd.
2. Dane z zewnątrz są obce – walidacja i limity, DOM bez surowego HTML, bez `eval`, sekrety poza przeglądarką i logami.
3. Zależności tylko z listy; nowa zależność – decyzja użytkownika.
4. Kod wspólny tylko przez synchronizację z CG System (`--check` w CI); ErsatzTV tylko przez jego interfejsy.
5. Licencja MIT, składniki obce w `THIRD-PARTY.md`.
6. Wersja rok.miesiąc.rewizja; znacznik `v<wersja>` = wszystkie manifesty; wydania z `main`.
7. Gdzie co opisywać (README, DOKUMENTACJA, API, INSTRUKCJA, RUNBOOK, plany).
8. Dokumentacja razem z kodem.
9. Dokumentacja stanu – jedno źródło stanu planu, STATUS przy wydaniu, porządki po scaleniu, numery propozycji, CHANGELOG tylko się wydłuża (`tools/check-docs.sh`).
10. Produkcji i danych użytkownika nie ruszaj bez prośby.
11. Zobacz wynik – zrzut ekranu przy pracy nad UI.

**Gemini (C)** – Claude dowodzi i jako jedyny pisze kod; Gemini redaguje wskazane `.md`, uruchamia bramkę, streszcza; próg opłacalności; weryfikacja diffu i bramki przez Claude; nigdy `--yolo`. Szczegóły: `docs/AGENCI.md`.

**Commity (D)** – jedna zmiana = jeden commit po polsku, tylko zielone stany; pliki jawnie (`git add ścieżka`); bez `target/`, zrzutów, logów, `.env`, sekretów; commit i push tylko na prośbę.

## 3. Zasady wspólne wynikające z aplikacji

Każda z tych zasad jest dziś zapisana osobno w dwóch albo trzech aplikacjach (kolumna „Dziś”), innymi słowami. Obowiązuje w całym pakiecie – także w nowym kodzie aplikacji, której jeszcze nie dotyczy.

| # | Zasada | Dziś |
|---|---|---|
| **Z1** | **Strona nie ma dostępu do systemu.** Każde okno (Tauri) przyjmuje komunikaty strony tylko z białej listy (`src/bridge.rs`) z limitami długości, tylko od strony bieżącego serwera okna (uprawnienie komendy `ipc` dla jednego adresu). Okno połączenia jest wbudowane w binarkę – strona nie przełączy okna na inny adres. Nowy komunikat = wariant na liście + limity + test. | CG System `source/shell/` (`allow_server`), Artist `bridge.rs` + `capabilities/`, Playout `panel/desktop/src/bridge.rs` |
| **Z2** | **Token zostaje w oknie albo w serwerze.** Strona nie zna tokenów ani sesji do usług dalej: dokleja je pośrednik (okna albo serwera panelu); w odpowiedziach pola sekretów są maskowane. | Artist `local::start_remote`, Playout `desktop/src/proxy.rs`, panel `mask_secrets` i `/api/cg/…`; blok B pkt 2 (ogólnie) |
| **Z3** | **Żądanie zmieniające stan sprawdza pochodzenie** (CSRF): `Sec-Fetch-Site`/`Origin`/`Host` albo własny nagłówek; serwery okien słuchają tylko na `127.0.0.1` z sekretem okna. | CG System `guard.rs`, Artist `local.rs` (`Host`, `Origin`, sekret), panel `X-VizRS-Live: 1` + CSP |
| **Z4** | **Nowe wejście = granica danych + test.** Nowe pole modelu, trasa API, opcja, komenda – w tym samym commicie reguła walidacji/limit w miejscu granicy i test. | CG System `validate.rs` (`vizrs-model`), Artist `local::route` + `local::tests`, Playout `config.rs` + compose + DOKUMENTACJA §5 + test, panel `bridge/commands.txt` |
| **Z5** | **Zapis atomowy, jeden zapisujący.** Pliki danych zapisuje się przez plik tymczasowy, `fsync` i `rename`; katalog danych ma jednego właściciela (`.vizrs.lock` w formacie serwera); uszkodzonego pliku nie nadpisuje się. | CG System `engine/persist.rs`, `datalock.rs`; Artist `paths::write_atomic`, `server.rs` |
| **Z6** | **UI wbudowane w binarkę.** Strony są w tablicy `STATIC` (`include_str!`): nowy plik = wpis w `STATIC`, zmiana działa po przebudowie albo z `--web <katalog>`; test pilnuje importów modułów. | CG System `static_files.rs`, Artist `web.rs` + `build.rs`, panel `routes.rs` (`module_imports_resolve`) |
| **Z7** | **Okno to klient, nie serwer.** Okno Tauri ma osobny workspace i `Cargo.lock`, zależności wypisane w nagłówku swojego `Cargo.toml`, nie wkompilowuje serwera (uruchamia go albo dołącza), nie powiela logiki strony (skróty edycji zostają w stronie). | CG System `source/shell/`, Artist, Playout `panel/desktop/` |
| **Z8** | **Testy obok, nie zamiast.** Ręczne próby – na kopii danych, innym porcie (`--port 8099`, `--tcp 0`); stosy Docker do testów – po teście sprzątasz tylko to, co powstało na potrzeby testu, bez `down -v` i `volume prune`; działającego `vizrs`, ErsatzTV ani stosów nie zatrzymujesz. | CG System i Artist „Zawsze”, Playout „Zawsze” i „Testy” |
| **Z9** | **Wydanie tylko przez bramkę CI.** `release.yml` wywołuje `ci.yml` tego commita i publikuje paczki/obrazy dopiero po zielonym; sprawdza zgodność wersji we wszystkich manifestach; znacznik zawsze `v<wersja>`. Po wydaniu: `ZGODNOSC.md`, `docs/STATUS.md`; CG Playout – przeładowanie stosów przez `stack-refresh`. | `release.yml` we wszystkich trzech repo (od 2026-11-25), CHANGELOG – nie w zasadach |
| **Z10** | **Aplikacje rozmawiają tylko przez styki.** Żadnego czytania plików, baz ani katalogów danych sąsiada; tylko protokoły z `STYKI.md` (TCP 6100, HTTP/SSE, `/output`, `vizrs-render`, Live API, API panelu, most). | Playout „Z VizRS CG System tylko przez protokół”, panel „CG Playout tylko przez jego API”, Artist „format `show.json` jest kontraktem” |
| **Z11** | **Język kodu:** polski wszędzie, poza sidecarem CG Playout (`src/` w korzeniu repo: kod, komentarze, logi po angielsku). Dokumentacja i UI – zawsze po polsku. | blok A pkt 1, Playout nagłówek |
| **Z12** | **Plan jako tabela punktów.** Plan ma tabelę „Punkt \| Zakres \| Wymaga \| Stan”; opis punktu da się wykonać w świeżej sesji; praca wg planu – jeden punkt = jedna sesja, commit z numerem punktu („K15: …”). | Playout PLAN-mcr („Jak pracować”), plany CG System (tabele etapów) |
| **Z13** | **Nie commitujesz wygenerowanego.** Poza `target/`: `gen/` i `permissions/autogenerated/` (Tauri), `bridge/bin|obj/`, kopie `.env*`, `config.json`, `media/`, dzienniki automatów; w danych startowych nigdy sekretów. | Artist i Playout „Commity” |

## 4. Niezgodności do usunięcia

| # | Niezgodność | Propozycja |
|---|---|---|
| **N1** | Blok B wymaga listy dozwolonych crate'ów w nagłówku `Cargo.toml` wyjątku. Mają ją okna CG System i panelu oraz renderer; **Artist** (`Cargo.toml`) i **sidecar CG Playout** (`Cargo.toml`) – nie: lista jest tylko w `CLAUDE.md`. | dopisać komentarz z listą i uzasadnieniem w obu `Cargo.toml` |
| **N2** | CG Playout: „Zawsze: produkcji nie ruszaj (stosy `virtrs-*`…)” i „lokalnego stosu użytkownika nie ruszaj” obok „Lokalny stos `virtrs-*` tylko przez `tests/deploy.sh`” (podmienia kontener `live`) i „Zielony stan = `tests/deploy.sh`”. | jedno zdanie: lokalny stos `virtrs` jest produkcją użytkownika; jedynym dozwolonym wyjątkiem jest `tests/deploy.sh` (tylko panel, przejście tylko do odczytu, powrót przy błędzie) |
| **N3** | Blok B: „HTML tylko szablonem `html` z `dom.js`”. Panel CG Playout nie ma `dom.js` – buduje DOM funkcją `h()` i zabrania `innerHTML` całkiem (CSP bez skryptów i stylów inline). | w bloku B: „HTML tylko szablonem `html` z `dom.js` albo budowaniem DOM (`h()` panelu)”; CSP jako zasada pakietu dla serwerów z UI – do decyzji |
| **N4** | Jeden produkt CG Playout ma dwa wiersze „Manifesty wersji” (sidecar: `Cargo.toml`, `package.json`; panel: `server/Cargo.toml`, `desktop/…`, `.csproj`, `Bridge.cs`). | jeden wiersz z pełną listą (taką, jaką sprawdza `release.yml`) |
| **N5** | Wydanie z bramką CI (Z9) działa we wszystkich repo, ale nie ma go w zasadach – tylko w CHANGELOG. | dopisać Z9 do bloku B |
| **N6** | Centrum VizRS nie ma `CLAUDE.md`/`AGENTS.md` – agent pracujący w sdorpl/VizRS nie dostaje żadnej zasady (np. „commit i push tylko na prośbę”, język, graf). | krótki `CLAUDE.md` w centrum: bloki A, S (bez STATUS/LUKI), B pkt 7–10, C, D + odesłanie do tego pliku; `--check` lokalnie (centrum nie ma CI) |
| **N7** | CG Playout „Tego projektu”: zasada „Bez GPU na ścieżce grafiki” zawiera też flagi Neoverse-N1 i strojenie .NET (limit sterty 1,5 GB) – to ustawienia wdrożenia, nie zasada. | przenieść do DOKUMENTACJA §4 CG Playout; w zasadzie zostaje „bez GPU na ścieżce grafiki” |
| **N8** | Te same zasady w trzech wersjach słownych (Z1–Z8): przy zmianie łatwo poprawić jedną. | Z1–Z8 do bloku B; w sekcjach „Tego projektu” zostają tylko ścieżki i nazwy plików danej aplikacji |

## 5. Wdrożenie

Kolejność (każdy krok to jeden commit w źródle i synchronizacja kopii):
1. Z1–Z10 i Z13 do bloku B (Z11 do bloku A, Z12 do bloku B pkt 7), w sekcjach „Tego projektu” zostają odsyłacze do plików (N8).
2. N1, N2, N4, N7 – w repo aplikacji (bez zmiany bloków).
3. N3, N5 – razem z krokiem 1.
4. N6 – `CLAUDE.md` w centrum.

Wymaga zgody użytkownika: kroki 1–4 zmieniają zasady wszystkich repozytoriów; CSP jako zasada pakietu (N3) i plik zasad centrum (N6) to nowe zobowiązania.
