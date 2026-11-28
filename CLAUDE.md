# VizRS – centrum pakietu (hub i wiki)

Repozytorium dokumentacji całego pakietu VizRS: opis aplikacji (README), styki (`STYKI.md`), zgodność wydań (`ZGODNOSC.md`), zasady pakietu (`ZASADY.md`), plany pakietu (`PLAN-*.md`). Kodu aplikacji tu nie ma.

<!-- pakiet:A – blok wspólny pakietu VizRS; źródło: VizRS CG System/CLAUDE.md, kopie: tools/sync-zasady.sh (nie edytuj w kopii) -->
Język pracy z użytkownikiem, dokumentacji, komentarzy, komunikatów i UI: **polski** – pisz zgodnie z otoczeniem. Jedyny wyjątek: sidecar VizRS CG Playout (`src/` w korzeniu tamtego repo) – kod, komentarze i logi po angielsku; jego dokumentacja i panel – po polsku.

## Pakiet VizRS

To repo jest częścią pakietu **VizRS**. **Centrum projektu (hub i wiki): [sdorpl/VizRS](https://github.com/sdorpl/VizRS)** (lokalnie `../VizRS`) – opis pakietu i każdej aplikacji, styki (`STYKI.md`), zgodność wydań (`ZGODNOSC.md`), stos, porty i spis całej dokumentacji. Co dotyczy więcej niż jednej aplikacji, opisuj tam; szczegóły aplikacji – w jej repozytorium.

| Aplikacja (katalog obok, `../`) | Rola | Dostawca styku |
|---|---|---|
| **VizRS CG System** (`VizRS CG System`) | silnik grafiki: Trio, wyjście `/output`, TCP 6100, HTTP/SSE, `vizrs-render`; źródło wspólnego kodu i zasad pakietu | protokół VizRS, `/output`, `vizrs-render`, format show i `.cgpack` (`docs/API.md`) |
| **VizRS CG Artist** (`VizRS CG Artist`) | edytor scen i animacji (Tauri 2) | – (klient CG System) |
| **VizRS CG Playout** (`VizRS CG Playout`) | sidecar grafiki i live ingest obok ErsatzTV; panel kanału nad ErsatzTV legacy (`panel/`, dawny VizRS Live): VizRS Bridge, natywny klient panelu; stos compose | Live API `:7700`, API panelu i most `/vizrs-bridge/*` (`docs/API.md`) |

VizRS Live (panel, most, okno) połączono 2026-11-15 z VizRS CG Playout w jeden produkt **„VizRS CG Playout”** z jedną wersją i jednym wydaniem (decyzja D1, plan: sdorpl/VizRS §3); repo `sdorpl/VizRS-Live-Playout` przechodzi do archiwum.

Zgodność – wszystkie aplikacje w bieżących wersjach działają razem:
- **Aplikacje rozmawiają tylko przez styki** z `STYKI.md` (TCP 6100, HTTP/SSE, `/output`, `vizrs-render`, format show i `.cgpack`, Live API, API panelu, most) – bez czytania plików, baz i katalogów danych sąsiada.
- **Styk zmienia się po obu stronach w tym samym cyklu.** Opis styku jest u dostawcy; klient opisuje tylko, jak z niego korzysta.
- **Starsza wersja sąsiada nie psuje aplikacji ani emisji** – brak nowego pola lub ścieżki to „niedostępne w tej wersji”, nie błąd.
- **Wydania razem:** przed wydaniem sprawdź z bieżącymi wersjami sąsiadów; zmianę wymagającą nowszego sąsiada odnotuj w `CHANGELOG.md` z minimalną wersją.
- **Po wydaniu – centrum projektu:** w sdorpl/VizRS wiersz w `ZGODNOSC.md` (wersja, data, pliki, nowe minimalne wersje sąsiadów); zmiana funkcji albo styku – także README (§1–§2) i `STYKI.md`; nowy dokument aplikacji – wiersz w spisie dokumentacji README; zmiana otwartych planów aplikacji – README §9 „Stan prac i otwarte plany”.
- **Plan w innym repo:** wdrożenie punktu planu, który leży w sąsiednim repozytorium (np. A1 Artist w CG System, renderer natywny w CG System i CG Playout), aktualizuje stan tego planu w tym samym cyklu – commit w repo planu, nie tylko w repo kodu.
<!-- /pakiet:A -->

## Zacznij każdą sesję tutaj

<!-- pakiet:S -->
- Przeczytaj [docs/STATUS.md](docs/STATUS.md) (bieżący etap, następne zadanie), `git log -5` i `git status`.
- Przeczytaj [docs/LUKI.md](docs/LUKI.md): znane braki, uszeregowane G1 (niezawodność i bezpieczeństwo) → G2 (wierność) → G3 (funkcje).
- Przy zmianie zachowania przeczytaj właściwą sekcję [docs/DOKUMENTACJA.md](docs/DOKUMENTACJA.md) – w tym samym commicie ją zaktualizujesz.
- Zmiana dotyka styku z inną aplikacją pakietu – przeczytaj opis styku u dostawcy (tabela „Pakiet VizRS”) i sprawdź drugą stronę.
- **Najpierw graf – `/graphify`.** Pytania o kod, architekturę, zależności plików i styki zadawaj najpierw grafowi wiedzy repozytorium: w Claude Code `/graphify query "<pytanie>"`, w innych agentach CLI `graphify query "<pytanie>"`, `graphify explain "<węzeł>"`, `graphify path "<A>" "<B>"` (graf: `graphify-out/graph.json`). Styki między aplikacjami – graf całego pakietu: `--graph "../graphify-vizrs/pakiet/graphify-out/graph.json"`. Graf jest skrótem do miejsc w kodzie, nie źródłem prawdy – przed zmianą przeczytaj wskazane pliki. `graphify-out/` to lokalne dowiązanie do `../graphify-vizrs/<repo>/` poza gitem (`.git/info/exclude`); gdy go nie ma (CI, świeży klon) – zwykłe wyszukiwanie. Po zmianach kodu odśwież graf: `../graphify-vizrs/odswiez.sh <fragment nazwy repo>`; ponowną ekstrakcję dokumentacji (`/graphify` z modelem, kosztowna) – tylko na prośbę użytkownika.
<!-- /pakiet:S -->

**W tym repozytorium** (bloki wyżej piszą o plikach aplikacji): zamiast `docs/STATUS.md` i `docs/LUKI.md` czytaj README §9 „Stan prac i otwarte plany” oraz `ZGODNOSC.md`; zamiast `docs/DOKUMENTACJA.md` – README §1–§8 i `STYKI.md`; zasady w jednym miejscu – `ZASADY.md`. Stan aplikacji sprawdzaj w ich repozytoriach (`../VizRS CG System`, `../VizRS CG Artist`, `../VizRS CG Playout`), nie z pamięci.

## Niepodważalne zasady

### Wspólne dla pakietu

<!-- pakiet:B -->
- **Emisja nie pada przez nasz błąd.** Błędy przez `Result`, limity czasu na połączeniach, blokady odporne na zatrucie; awaria grafiki, panelu albo zapisu na dysk nie zatrzymuje anteny ani kanału.
- **Dane z zewnątrz są obce.** Wejście z sieci, plików, ErsatzTV i sąsiednich aplikacji – walidacja i limity; tekst do DOM przez `textContent`, a HTML tylko szablonem `html` z `dom.js` (escapuje wstawiane wartości; `setHtml` to jedyne miejsce z `innerHTML`; wyjątek: zamrożony `/artist` CG System) albo budowaniem elementów (`h()` panelu CG Playout); bez `eval`. Serwer z UI wysyła CSP bez skryptów inline (nowy kod – od razu; braki istniejących serwerów są w ich LUKI).
- **Sekrety zostają w oknie albo w serwerze.** Tokeny i sesje do usług dalej dokleja pośrednik (okna albo serwera panelu) – strona ich nie zna; pola sekretów w odpowiedziach są maskowane; sekrety nie trafiają do logów.
- **Strona nie ma dostępu do systemu.** Okno przyjmuje komunikaty strony tylko z białej listy (`src/bridge.rs`) z limitami długości i tylko od strony bieżącego serwera okna (uprawnienie komendy `ipc` dla jednego adresu); okno połączenia jest wbudowane w binarkę. Nowy komunikat = wariant na liście + limity + test.
- **Żądanie zmieniające stan sprawdza pochodzenie** (CSRF: `Sec-Fetch-Site`/`Origin`/`Host` albo własny nagłówek); serwery okien słuchają tylko na `127.0.0.1`, z sekretem okna.
- **Nowe wejście = granica danych + test.** Nowe pole modelu, trasa API, opcja, komenda albo wiersz białej listy – w tym samym commicie reguła walidacji/limit w miejscu granicy (miejsca – „Tego projektu”) i test.
- **Zapis atomowy, jeden zapisujący.** Dane zapisuje się przez plik tymczasowy, `fsync` i `rename`; katalog danych ma jednego właściciela (`.vizrs.lock` w formacie serwera); uszkodzonego pliku się nie nadpisuje.
- **Zależności tylko z listy.** Serwery pakietu (`vizrs`, `vizrs-live`) nie mają zależności zewnętrznych; front-end to czysty JS (moduły ES) bez bundlera, bibliotek i CDN. Wyjątki (okna Tauri, renderer natywny, sidecar) – tylko crate'y wymienione w nagłówku ich `Cargo.toml`; nowa zależność to decyzja użytkownika.
- **Okno to klient, nie serwer.** Okno Tauri ma osobny workspace i `Cargo.lock`, listę dozwolonych crate'ów z uzasadnieniem w nagłówku swojego `Cargo.toml`, nie wkompilowuje serwera (uruchamia go albo dołącza) i nie powiela logiki strony (skróty edycji zostają w stronie).
- **UI wbudowane w binarkę.** Strony są w tablicy `STATIC` (`include_str!`): nowy plik = wpis w `STATIC`, zmiana działa po przebudowie albo z `--web <katalog>`.
- **Kod wspólny tylko przez synchronizację.** Kod, wygląd (`vizrs-ui.css`), moduły okna (`gpu.rs`, `scale.rs`, `screen.rs`, `conn_url.rs`) i zasady pakietu mają źródło w VizRS CG System; kopie aktualizują skrypty (`tools/sync-cg.sh`, `scripts/sync-ui.sh`, `tools/sync-zasady.sh`) ze sprawdzaniem `--check` w CI – kopii nie edytuje się ręcznie. Cudzy kod tylko na licencji zgodnej z MIT i z wpisem w `THIRD-PARTY.md`. ErsatzTV – wyłącznie przez jego interfejsy (element „script”, ścieżka FFmpeg, startup hook mostu, komendy MediatR), bez kopiowania i bez zmian w jego kodzie.
- **Licencja: MIT** (`LICENSE`, `Copyright (c) 2026 sdorpl`; pole `license` w manifestach); składniki zewnętrzne – `THIRD-PARTY.md`.
- **Numer wersji: rok.miesiąc.rewizja** (`26.11.1` = listopad 2026, pierwsze wydanie w miesiącu; kolejne `26.11.2`, w grudniu od `26.12.1`), bez zer wiodących (semver: Cargo, paczki, obrazy). Znacznik `v<wersja>` = wersja we wszystkich manifestach projektu (lista – „Tego projektu”). Wydania z gałęzi `main`; `main-oldstable` to stan sprzed 26.11.1.
- **Wydanie tylko przez bramkę CI.** `release.yml` wywołuje `ci.yml` tego commita, sprawdza wersję we wszystkich manifestach i publikuje paczki i obrazy dopiero po zielonym; poza tym workflow nic się nie publikuje.
- **Gdzie co opisywać:** README tylko wprowadza i odsyła; opis działania, opcje i zmienne tylko w `docs/DOKUMENTACJA.md` (nie powielaj w README, planach ani STATUS); API, którego aplikacja jest dostawcą – `docs/API.md` (albo sekcja wskazana w „Tego projektu”); praca użytkownika – `docs/INSTRUKCJA*.md`; wdrożenie i awarie – `docs/RUNBOOK.md`; plany – `docs/plany/` + wiersz w `docs/plany/README.md` (plan ma tabelę „Punkt | Zakres | Wymaga | Stan”, opis punktu wykonalny w świeżej sesji; jeden punkt = jedna sesja, commit „K15: …”); opis całego pakietu – sdorpl/VizRS.
- **Dokumentacja razem z kodem:** commit zmieniający zachowanie (UI, API, format, opcje, obrazy) aktualizuje w tym samym commicie `docs/DOKUMENTACJA.md`, a gdy dotyczy codziennej pracy – także instrukcję; API – `docs/API.md`; wdrożenie – `docs/RUNBOOK.md`; zmiany wydania – `CHANGELOG.md` (sekcja „Niewydane”); zamknięta luka – usuń wiersz z `docs/LUKI.md`; zmiana etapu – `docs/STATUS.md`.
- **Dokumentacja stanu – jedno źródło, wszystkie miejsca w jednym cyklu.** Stan punktu planu (zrobione / częściowo / czeka / decyzja / propozycja, z wersją wydania) trzyma tabela etapów w planie; nagłówek planu, wiersz w `docs/plany/README.md` i `docs/STATUS.md` podają go krótko z tą samą wersją, `docs/LUKI.md` – tylko braki. Kto zmienia stan, poprawia wszystkie te miejsca w tym samym commicie. **Wydanie** (nowa wersja w manifestach) aktualizuje też `docs/STATUS.md` – data „Ostatnia aktualizacja”, „Bieżący etap”, „Następne”. **Scalenie gałęzi** do `main` usuwa z dokumentów zapisy „na gałęzi X”, „czeka na tag/scalenie”. Nowa propozycja punktu od razu dostaje wiersz w tabeli planu z numerem i stanem „propozycja” – numerów nie używa się ponownie. `CHANGELOG.md` tylko się wydłuża (wpisy wydanych wersji nie znikają); pilnuje tego i daty STATUS `tools/check-docs.sh` (CI, bramka przed commitem).
- **Produkcji i danych użytkownika nie ruszaj bez prośby.** Testy na kopii danych, innym porcie (`--port 8099`, `--tcp 0`) albo stosie testowym; działających serwerów, stosów i kontenerów nie zatrzymuj (mogą nadawać). Po testach w Dockerze sprzątasz tylko to, co powstało na potrzeby testu – bez `down -v` i `volume prune`. Wyjątki (np. `tests/deploy.sh` panelu) wymienia „Tego projektu”.
- **Zobacz wynik.** Przy pracy nad UI zrzut ekranu (Playwright; pliki PNG poza repo) i obejrzenie go przed commitem.
<!-- /pakiet:B -->

### Tego repozytorium

- **Co tu, a co w aplikacji:** tu tylko to, co dotyczy więcej niż jednej aplikacji; szczegół jednej aplikacji – odnośnik do jej repozytorium (README „Jak utrzymywać to repozytorium”).
- **Fakty z kodu:** wersje, porty, nazwy plików i stany planów sprawdzaj w repozytoriach aplikacji i w `gh release` przed wpisaniem; `ZGODNOSC.md` – wiersz po każdym wydaniu, data „Stan na” = data ostatniego wydania.
- **Zasady pakietu zmieniają się w VizRS CG System** (bloki `pakiet:*`, `tools/sync-zasady.sh`); tutaj – kopia przez `tools/sync-zasady.sh` i opis w `ZASADY.md`. `tools/check-docs.sh` tu nie dotyczy (repo bez wersji i CHANGELOG).
- **Bez CI:** przed commitem `tools/sync-zasady.sh --check` lokalnie. Nie commituj `raporty-agy/` (surowe raporty Gemini) ani `graphify-out/`.

## Współpraca z Gemini

<!-- pakiet:C -->
Szczegóły: [docs/AGENCI.md](docs/AGENCI.md) – wspólny dla pakietu. W skrócie:

- **Claude dowodzi i jako jedyny pisze kod** (lista „Kod” niżej oraz pliki zasad, CI, Docker, testy, skrypty, manifesty, licencje, białe listy, decyzje w planach).
- **Gemini wykonuje lekkie zadania:** redaguje wskazane pliki `.md` z listy „Dokumentacja”, uruchamia bramkę z listy „Bramka” i streszcza wynik, streszcza długie wyjścia, przeszukuje źródła (także sąsiednich repozytoriów pakietu – tylko do czytania). Nie commituje.
- **Kontekst Gemini:** `AGENTS.md` to **kopia** tego pliku (nie dowiązanie: Portainer GitOps odrzuca repozytorium z symlinkiem, a Windows bywa z nimi zawodny) – zmienia się razem z `CLAUDE.md` (`tools/sync-zasady.sh` kopiuje, `--check` w CI porównuje). `agy` sam wczytuje `AGENTS.md` i `GEMINI.md`, także w `-p`; importów `@plik` nie rozwija. `GEMINI.md` i `docs/AGENCI.md` są wspólne dla pakietu (źródło: VizRS CG System) i niczego stąd nie powielają.
- **Wywołanie:** `~/.gemini/bin/agy` (poza `PATH`), przełączniki – AGENCI §5. Wygodniej przez wrapper wtyczki antigravity: `PATH="$HOME/.gemini/bin:$PATH" agy-delegate [-m "Gemini 3.8 Flash (High)"] [--digest] [--mode plan] --dir . "<zlecenie>"` (poziomu `--tier pro` w tej subskrypcji nie ma). Wrapper sam stawia `-p` na końcu i odcina stdin. Zamiast kodu 0 zwraca kod błędu: 10 – limit, 11 – logowanie, 12 – przekroczony czas, 14 – brak modelu, 15 – odmowa uprawnień, 3 – pusta odpowiedź. Na stderr wypisuje wiersz `AGY_USAGE` z tokenami i modelem. Tylko subskrypcja Google (bez kluczy API). `--yolo` / `--dangerously-skip-permissions` – nigdy: daje zgodę na cały komputer, a `--sandbox` jej nie ogranicza.
- **Próg opłacalności:** każde zlecenie ma koszt stały (zlecenie, czekanie, przegląd). Małe, jednorazowe i wymagające decyzji zadania rób sam – ich zlecanie to zmierzona strata. Zlecaj duże porcje tekstu przy niewielu decyzjach: prozę dokumentacji (też w kilku repozytoriach naraz, AGENCI §5), przeszukanie dużych źródeł, nieustrukturyzowane logi. Jedno duże zlecenie zamiast wielu małych. Bierz streszczenie (`--digest`), nie surowe wyjście; plików, które przerobił Gemini, nie czytaj ponownie – przeglądaj diff. Logi (bramka, kompilacja, testy) czytaj sam przez plik i filtr (`tail`, `grep`) – AGENCI §4.
- **Weryfikacja:** przed zleceniem migawka `git status` (i `git diff`, gdy pliki mają już zmiany), po zleceniu przegląd diffu – razem z usuniętymi wierszami. Kod 0 i raport „gotowe” niczego nie dowodzą. Bramkę uruchom sam, w czystym stanie – `agy` potrafi zmienić środowisko (połatać pakiety, podstawić atrapy), żeby test przeszedł. Każdą liczbę, ścieżkę i stan etapu sprawdź z kodem (Gemini dopowiada fakty).
<!-- /pakiet:C -->

### Ten projekt

- **Kod (tylko Claude):** `CLAUDE.md`, `AGENTS.md`, `tools/`, `refaktor-narzedzia/`, `docs/ZASADY_CG_SYSTEM`, `.gitignore`.
- **Dokumentacja (Gemini – tylko pliki wskazane w zleceniu):** `README.md`, `STYKI.md`, `ZGODNOSC.md`, `ZASADY.md`, `PLAN-*.md`.
- **Bramka:** `tools/sync-zasady.sh --check`.

## Commity

<!-- pakiet:D -->
- Jedna spójna zmiana = jeden commit, po polsku, opisowo (styl historii repo). Tylko zielone stany (bramka z „Testy”).
- Pliki dodawaj jawnie (`git add ścieżka`), nie `git add -A`. Nie commituj katalogów `target/`, plików wygenerowanych (`gen/`, `permissions/autogenerated/` Tauri, `bin/`, `obj/` mostu .NET), zrzutów, logów, dzienników automatów, plików tymczasowych, `.env` i ich kopii ani sekretów (także w danych startowych).
- Commit i push tylko na prośbę użytkownika.
<!-- /pakiet:D -->
