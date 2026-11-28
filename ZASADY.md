# Zasady pakietu VizRS

> Stan: 2026-11-28. Opracowane z plików zasad trzech aplikacji (VizRS CG System `d510130`, VizRS CG Artist `c3db9b7`, VizRS CG Playout `925a2f2`) i wdrożone tego samego dnia: zasady Z1–Z13 są w blokach A, B i D, niezgodności N1–N8 usunięte (§4), centrum ma własny `CLAUDE.md` z tymi samymi blokami.
> **Obowiązujący tekst** zasad wspólnych to bloki `<!-- pakiet:X -->` w `CLAUDE.md` VizRS CG System, kopiowane do pozostałych aplikacji przez `tools/sync-zasady.sh` (`--check` w CI). Ten dokument je porządkuje, dodaje zasady wynikające z wzorców powtarzanych w każdej aplikacji (§3) i wskazuje niezgodności (§4). Przy rozbieżności z blokiem wygrywa blok – a ten dokument trzeba poprawić.

## 1. Gdzie są zasady i jak się zmieniają

| Warstwa | Gdzie | Kto zmienia |
|---|---|---|
| Zasady pakietu – bloki **A** (pakiet i zgodność), **S** (początek sesji), **B** (niepodważalne), **C** (współpraca z Gemini), **D** (commity) | `CLAUDE.md` VizRS CG System (źródło); kopie w Artist i Playout | tylko w CG System, potem `tools/sync-zasady.sh` w każdym repo |
| Pliki wspólne: `GEMINI.md`, `docs/AGENCI.md`, `tools/sync-zasady.sh`, `tools/check-docs.sh` | VizRS CG System (źródło); kopie 1:1 | jak wyżej; wersja źródła w `docs/ZASADY_CG_SYSTEM` |
| Zasady jednej aplikacji – sekcje „Tego projektu”, „Ten projekt”, „Testy”, „Struktura”, „Commity” poza blokiem | `CLAUDE.md` danej aplikacji | w repo aplikacji |
| `AGENTS.md` | kopia `CLAUDE.md` (nie dowiązanie – Portainer GitOps odrzuca symlinki) | zawsze razem z `CLAUDE.md` |
| Zasady centrum | `CLAUDE.md` centrum (bloki pakietu + „Tego repozytorium”), ten plik, README „Jak utrzymywać to repozytorium” | bloki – jak wyżej; reszta w sdorpl/VizRS (bez CI – `tools/sync-zasady.sh --check` lokalnie) |

Zmiana zasady pakietu: (1) blok w CG System, (2) `tools/sync-zasady.sh` w Artist, Playout i centrum, (3) ten dokument, (4) push CG System **przed** pozostałymi – ich CI pobiera z GitHuba commit z `docs/ZASADY_CG_SYSTEM`.

## 2. Zasady pakietu (bloki A, S, B, C, D – w skrócie)

**Pakiet i zgodność (A)**
1. Język pracy, dokumentacji, komentarzy, komunikatów i UI – polski; wyjątek: kod, komentarze i logi sidecara CG Playout po angielsku (Z11).
2. Aplikacje rozmawiają tylko przez styki z `STYKI.md` (Z10).
3. Centrum projektu to sdorpl/VizRS: opis pakietu, styki, zgodność wydań, spis dokumentacji. Co dotyczy więcej niż jednej aplikacji – tam; szczegóły – w repo aplikacji.
4. Styk zmienia się po obu stronach w tym samym cyklu; opis styku jest u dostawcy.
5. Starsza wersja sąsiada nie psuje aplikacji ani emisji – brak pola to „niedostępne w tej wersji”.
6. Przed wydaniem – sprawdzenie z bieżącymi wersjami sąsiadów; wymóg nowszego sąsiada – w CHANGELOG z minimalną wersją.
7. Po wydaniu – wiersz w `ZGODNOSC.md`; zmiana funkcji/styku – README §1–§2 i `STYKI.md`; zmiana otwartych planów – README §9.
8. Plan w innym repo aktualizuje się w tym samym cyklu co kod.

**Początek sesji (S)** – STATUS, `git log -5`, `git status`, LUKI; przed zmianą zachowania – właściwa sekcja DOKUMENTACJI; przed zmianą styku – opis u dostawcy; najpierw graf wiedzy (`/graphify`), graf to skrót, nie źródło prawdy.

**Niepodważalne (B)**
1. Emisja nie pada przez nasz błąd.
2. Dane z zewnątrz są obce – walidacja i limity, DOM przez `textContent`, szablon `html` z `dom.js` albo `h()`, bez `eval`; serwer z UI wysyła CSP bez skryptów inline (N3).
3. Sekrety zostają w oknie albo w serwerze (Z2); strona nie ma dostępu do systemu (Z1); żądanie zmieniające stan sprawdza pochodzenie (Z3); nowe wejście = granica danych + test (Z4); zapis atomowy, jeden zapisujący (Z5).
4. Zależności tylko z listy w nagłówku `Cargo.toml`; nowa zależność – decyzja użytkownika; okno to klient, nie serwer (Z7); UI wbudowane w binarkę (Z6).
5. Kod wspólny tylko przez synchronizację z CG System (`--check` w CI); ErsatzTV tylko przez jego interfejsy.
6. Licencja MIT, składniki obce w `THIRD-PARTY.md`.
7. Wersja rok.miesiąc.rewizja; znacznik `v<wersja>` = wszystkie manifesty; wydania z `main`, tylko przez bramkę CI (Z9).
8. Gdzie co opisywać (README, DOKUMENTACJA, API, INSTRUKCJA, RUNBOOK, plany jako tabela punktów – Z12).
9. Dokumentacja razem z kodem.
10. Dokumentacja stanu – jedno źródło stanu planu, STATUS przy wydaniu, porządki po scaleniu, numery propozycji, CHANGELOG tylko się wydłuża (`tools/check-docs.sh`).
11. Produkcji i danych użytkownika nie ruszaj bez prośby; testy obok, nie zamiast (Z8).
12. Zobacz wynik – zrzut ekranu przy pracy nad UI.

**Gemini (C)** – Claude dowodzi i jako jedyny pisze kod; Gemini redaguje wskazane `.md`, uruchamia bramkę, streszcza; próg opłacalności; weryfikacja diffu i bramki przez Claude; nigdy `--yolo`. Szczegóły: `docs/AGENCI.md`.

**Commity (D)** – jedna zmiana = jeden commit po polsku, tylko zielone stany; pliki jawnie (`git add ścieżka`); bez `target/`, plików wygenerowanych, zrzutów, logów, `.env` i ich kopii, sekretów (Z13); commit i push tylko na prośbę.

## 3. Zasady wspólne wynikające z aplikacji

Każda z tych zasad była zapisana osobno w dwóch albo trzech aplikacjach, innymi słowami (kolumna „Źródło”). Od 2026-11-28 obowiązuje w całym pakiecie jako zasada bloku (Z10, Z11 – blok A; Z13 – blok D; reszta – blok B); w sekcjach „Tego projektu” zostały tylko wiersze „Miejsca zasad pakietu w tym repo” z plikami danej aplikacji.

| # | Zasada | Źródło |
|---|---|---|
| **Z1** | **Strona nie ma dostępu do systemu.** Każde okno (Tauri) przyjmuje komunikaty strony tylko z białej listy (`src/bridge.rs`) z limitami długości, tylko od strony bieżącego serwera okna (uprawnienie komendy `ipc` dla jednego adresu). Okno połączenia jest wbudowane w binarkę – strona nie przełączy okna na inny adres. Nowy komunikat = wariant na liście + limity + test. | CG System `source/shell/` (`allow_server`), Artist `bridge.rs` + `capabilities/`, Playout `panel/desktop/src/bridge.rs` |
| **Z2** | **Token zostaje w oknie albo w serwerze.** Strona nie zna tokenów ani sesji do usług dalej: dokleja je pośrednik (okna albo serwera panelu); w odpowiedziach pola sekretów są maskowane. | Artist `local::start_remote`, Playout `desktop/src/proxy.rs`, panel `mask_secrets` i `/api/cg/…`; blok B pkt 2 (ogólnie) |
| **Z3** | **Żądanie zmieniające stan sprawdza pochodzenie** (CSRF): `Sec-Fetch-Site`/`Origin`/`Host` albo własny nagłówek; serwery okien słuchają tylko na `127.0.0.1` z sekretem okna. | CG System `guard.rs`, Artist `local.rs` (`Host`, `Origin`, sekret), panel `X-VizRS-Live: 1` + CSP |
| **Z4** | **Nowe wejście = granica danych + test.** Nowe pole modelu, trasa API, opcja, komenda – w tym samym commicie reguła walidacji/limit w miejscu granicy i test. | CG System `validate.rs` (`vizrs-model`), Artist `local::route` + `local::tests`, Playout `config.rs` + compose + DOKUMENTACJA §5 + test, panel `bridge/commands.txt` |
| **Z5** | **Zapis atomowy, jeden zapisujący.** Pliki danych zapisuje się przez plik tymczasowy, `fsync` i `rename`; katalog danych ma jednego właściciela (`.vizrs.lock` w formacie serwera); uszkodzonego pliku nie nadpisuje się. | CG System `engine/persist.rs`, `datalock.rs`; Artist `paths::write_atomic`, `server.rs` |
| **Z6** | **UI wbudowane w binarkę.** Strony są w tablicy `STATIC` (`include_str!`): nowy plik = wpis w `STATIC`, zmiana działa po przebudowie albo z `--web <katalog>`; test pilnuje importów modułów. | CG System `static_files.rs`, Artist `web.rs` + `build.rs`, panel `routes.rs` (`module_imports_resolve`) |
| **Z7** | **Okno to klient, nie serwer.** Okno Tauri ma osobny workspace i `Cargo.lock`, zależności wypisane w nagłówku swojego `Cargo.toml`, nie wkompilowuje serwera (uruchamia go albo dołącza), nie powiela logiki strony (skróty edycji zostają w stronie). | CG System `source/shell/`, Artist, Playout `panel/desktop/` |
| **Z8** | **Testy obok, nie zamiast.** Ręczne próby – na kopii danych, innym porcie (`--port 8099`, `--tcp 0`); stosy Docker do testów – po teście sprzątasz tylko to, co powstało na potrzeby testu, bez `down -v` i `volume prune`; działającego `vizrs`, ErsatzTV ani stosów nie zatrzymujesz. | CG System i Artist „Zawsze”, Playout „Zawsze” i „Testy” |
| **Z9** | **Wydanie tylko przez bramkę CI.** `release.yml` wywołuje `ci.yml` tego commita i publikuje paczki/obrazy dopiero po zielonym; sprawdza zgodność wersji we wszystkich manifestach; znacznik zawsze `v<wersja>`. Po wydaniu: `ZGODNOSC.md`, `docs/STATUS.md`; CG Playout – przeładowanie stosów przez `stack-refresh`. | `release.yml` we wszystkich trzech repo (od 2026-11-25) |
| **Z10** | **Aplikacje rozmawiają tylko przez styki.** Żadnego czytania plików, baz ani katalogów danych sąsiada; tylko protokoły z `STYKI.md` (TCP 6100, HTTP/SSE, `/output`, `vizrs-render`, Live API, API panelu, most). | Playout „Z VizRS CG System tylko przez protokół”, panel „CG Playout tylko przez jego API”, Artist „format `show.json` jest kontraktem” |
| **Z11** | **Język kodu:** polski wszędzie, poza sidecarem CG Playout (`src/` w korzeniu repo: kod, komentarze, logi po angielsku). Dokumentacja i UI – zawsze po polsku. | blok A pkt 1, Playout nagłówek |
| **Z12** | **Plan jako tabela punktów.** Plan ma tabelę „Punkt \| Zakres \| Wymaga \| Stan”; opis punktu da się wykonać w świeżej sesji; praca wg planu – jeden punkt = jedna sesja, commit z numerem punktu („K15: …”). | Playout PLAN-mcr („Jak pracować”), plany CG System (tabele etapów) |
| **Z13** | **Nie commitujesz wygenerowanego.** Poza `target/`: `gen/` i `permissions/autogenerated/` (Tauri), `bridge/bin|obj/`, kopie `.env*`, `config.json`, `media/`, dzienniki automatów; w danych startowych nigdy sekretów. | Artist i Playout „Commity” |

## 4. Niezgodności (usunięte 2026-11-28)

| # | Niezgodność | Rozwiązanie |
|---|---|---|
| **N1** | Blok B wymaga listy dozwolonych crate'ów w nagłówku `Cargo.toml` wyjątku. Mają ją okna CG System i panelu oraz renderer; **Artist** (`Cargo.toml`) i **sidecar CG Playout** (`Cargo.toml`) – nie: lista jest tylko w `CLAUDE.md`. | nagłówki z listą i uzasadnieniem w obu `Cargo.toml` (sidecar – po angielsku, Z11) |
| **N2** | CG Playout: „Zawsze: produkcji nie ruszaj (stosy `virtrs-*`…)” i „lokalnego stosu użytkownika nie ruszaj” obok „Lokalny stos `virtrs-*` tylko przez `tests/deploy.sh`” (podmienia kontener `live`) i „Zielony stan = `tests/deploy.sh`”. | zasady CG Playout: stos `virtrs` to produkcja użytkownika, jedyny wyjątek – `tests/deploy.sh` (tylko panel, przejście tylko do odczytu, powrót przy błędzie); blok B odsyła do wyjątków „Tego projektu” |
| **N3** | Blok B: „HTML tylko szablonem `html` z `dom.js`”. Panel CG Playout nie ma `dom.js` – buduje DOM funkcją `h()` i zabrania `innerHTML` całkiem (CSP bez skryptów i stylów inline). | blok B: „szablonem `html` z `dom.js` albo budowaniem elementów (`h()`)”; CSP bez skryptów inline – zasada pakietu; braki: LUKI CG System #21 (strony UI), LUKI Artist #14 (magazyn lokalny) |
| **N4** | Jeden produkt CG Playout ma dwa wiersze „Manifesty wersji” (sidecar: `Cargo.toml`, `package.json`; panel: `server/Cargo.toml`, `desktop/…`, `.csproj`, `Bridge.cs`). | jeden wiersz z pełną listą, taką jak w `release.yml` |
| **N5** | Wydanie z bramką CI (Z9) działa we wszystkich repo, ale nie ma go w zasadach – tylko w CHANGELOG. | Z9 w bloku B |
| **N6** | Centrum VizRS nie ma `CLAUDE.md`/`AGENTS.md` – agent pracujący w sdorpl/VizRS nie dostaje żadnej zasady (np. „commit i push tylko na prośbę”, język, graf). | `CLAUDE.md` (= `AGENTS.md`) w centrum: wszystkie bloki przez `tools/sync-zasady.sh` + „Tego repozytorium” (odpowiedniki STATUS/LUKI/DOKUMENTACJI w centrum); `--check` lokalnie |
| **N7** | CG Playout „Tego projektu”: zasada „Bez GPU na ścieżce grafiki” zawiera też flagi Neoverse-N1 i strojenie .NET (limit sterty 1,5 GB) – to ustawienia wdrożenia, nie zasada. | flagi i strojenie .NET w DOKUMENTACJI §4 „Oracle Cloud Ampere A1”; w zasadzie zostało „bez GPU na ścieżce grafiki” |
| **N8** | Te same zasady w trzech wersjach słownych (Z1–Z8): przy zmianie łatwo poprawić jedną. | Z1–Z13 w blokach; w „Tego projektu” – „Miejsca zasad pakietu w tym repo” i szczegóły aplikacji |

## 5. Jak utrzymywać

- Nowa zasada dotycząca więcej niż jednej aplikacji – od razu do bloku (CG System), nie do „Tego projektu” dwóch repo.
- Zasada w bloku podaje regułę; pliki, w których ją widać, wymienia wiersz „Miejsca zasad pakietu w tym repo” w każdej aplikacji.
- Po zmianie bloku – wiersz w §2 tego pliku; nowa zasada z wzorca aplikacji – kolejny numer Z w §3 (numerów nie używa się ponownie).
