# VizRS – pakiet grafiki i playoutu telewizyjnego

**Centrum projektu (hub i wiki) pakietu VizRS.** Tu jest opis całości: co robi każda aplikacja, jak współpracują,
jakie mają styki, które wersje działają razem i jak wygląda stos produkcyjny – oraz spis całej dokumentacji projektu.
Kod jest w trzech repozytoriach aplikacji: [VizRS-CG-System](https://github.com/sdorpl/VizRS-CG-System),
[VizRS-CG-Artist](https://github.com/sdorpl/VizRS-CG-Artist) oraz [VizRS-CG-Playout](https://github.com/sdorpl/VizRS-CG-Playout).
Dawne osobne repozytorium [VizRS-Live-Playout](https://github.com/sdorpl/VizRS-Live-Playout) zostało wchłonięte do CG Playout (`panel/`) i jest zarchiwizowane.

## Spis dokumentacji projektu

### Pakiet (to repozytorium)

| Dokument | Co zawiera |
|---|---|
| [README.md](README.md) (ten plik) | mapa aplikacji (§1), **co robi każda aplikacja** (§2), kto z kim rozmawia (§3), styki w skrócie (§4), wspólny kod (§5), stos technologiczny (§6), stos produkcyjny i porty (§7), słownik (§8), stan połączenia (§9) |
| [STYKI.md](STYKI.md) | wszystkie styki pakietu: protokół VizRS, formaty scen, Live API, most VizRS Bridge, API panelu, ErsatzTV, kod wspólny, logowanie w pakiecie; reguły zmian styku |
| [ZGODNOSC.md](ZGODNOSC.md) | bieżące wydania aplikacji (obrazy, paczki) i minimalne wersje sąsiadów |
| [PLAN-PORZADKOWANIA.md](PLAN-PORZADKOWANIA.md) | decyzje D1–D10 i połączenie VizRS Live z CG Playout (zakończone 2026-11-16) – zapis historyczny |
| [PLAN-REFAKTORYZACJI.md](PLAN-REFAKTORYZACJI.md) | refaktoryzacja pakietu (zakończona, wydana 2026-11-19) – zapis historyczny |
| [zrzuty/](zrzuty/) | zrzuty ekranów Trio i panelu z wdrożeń |

### Dokumentacja aplikacji

Opis działania, opcje, API i instrukcje są w repozytoriach aplikacji (zasada pakietu: jedno miejsce na każdą informację).

| | [VizRS CG System](https://github.com/sdorpl/VizRS-CG-System) | [VizRS CG Artist](https://github.com/sdorpl/VizRS-CG-Artist) | [VizRS CG Playout](https://github.com/sdorpl/VizRS-CG-Playout) |
|---|---|---|---|
| Wprowadzenie | [README](https://github.com/sdorpl/VizRS-CG-System/blob/main/README.md) | [README](https://github.com/sdorpl/VizRS-CG-Artist/blob/main/README.md) | [README](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/README.md) |
| Opis działania i opcje | [DOKUMENTACJA](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md) | [DOKUMENTACJA](https://github.com/sdorpl/VizRS-CG-Artist/blob/main/docs/DOKUMENTACJA.md) | [DOKUMENTACJA](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md) (sidecar §1–§8, panel §9–§15) |
| API (dostawca) | [API](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md) (HTTP, TCP, OSC, webhook), [COMPANION](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/COMPANION.md) | – (klient CG System) | [API](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md) (Live API, API panelu, most) |
| Instrukcja użytkownika | [INSTRUKCJA-poczatkujacy](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/INSTRUKCJA-poczatkujacy.md) | w [DOKUMENTACJI](https://github.com/sdorpl/VizRS-CG-Artist/blob/main/docs/DOKUMENTACJA.md) | [INSTRUKCJA](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/INSTRUKCJA.md) (operator, planista) |
| Wdrożenie i awarie | [RUNBOOK](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/RUNBOOK.md) | – | [RUNBOOK](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/RUNBOOK.md) |
| Zmiany | [CHANGELOG](https://github.com/sdorpl/VizRS-CG-System/blob/main/CHANGELOG.md) | [wydania](https://github.com/sdorpl/VizRS-CG-Artist/releases) | [CHANGELOG](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/CHANGELOG.md) |
| Stan prac i znane braki | [STATUS](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/STATUS.md), [LUKI](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/LUKI.md) | [STATUS](https://github.com/sdorpl/VizRS-CG-Artist/blob/main/docs/STATUS.md), [LUKI](https://github.com/sdorpl/VizRS-CG-Artist/blob/main/docs/LUKI.md) | [STATUS](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/STATUS.md), [LUKI](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/LUKI.md) |
| Plany | [docs/plany](https://github.com/sdorpl/VizRS-CG-System/tree/main/docs/plany) | [docs/plany](https://github.com/sdorpl/VizRS-CG-Artist/tree/main/docs/plany) | [docs/plany](https://github.com/sdorpl/VizRS-CG-Playout/tree/main/docs/plany) |
| Wydania (pliki do pobrania) | [releases](https://github.com/sdorpl/VizRS-CG-System/releases) | [releases](https://github.com/sdorpl/VizRS-CG-Artist/releases) | [releases](https://github.com/sdorpl/VizRS-CG-Playout/releases) |
| Zasady pracy (ludzie i agenci) | [CLAUDE.md](https://github.com/sdorpl/VizRS-CG-System/blob/main/CLAUDE.md), [AGENCI](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/AGENCI.md) – źródło zasad pakietu | [CLAUDE.md](https://github.com/sdorpl/VizRS-CG-Artist/blob/main/CLAUDE.md) | [CLAUDE.md](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/CLAUDE.md) |

### Jak utrzymywać to repozytorium

- **Tu** jest wszystko, co dotyczy więcej niż jednej aplikacji: opis pakietu i każdej aplikacji (README §2), styki (STYKI.md), zgodność wydań (ZGODNOSC.md), stos i porty. Szczegóły jednej aplikacji – tylko w jej repozytorium, tu najwyżej odnośnik.
- **Po każdym wydaniu aplikacji:** wiersz w ZGODNOSC.md (wersja, data, pliki, nowe minimalne wersje sąsiadów); gdy zmienia się funkcja albo styk – README §1–§2 i STYKI.md.
- **Nowy dokument w aplikacji** – wiersz w spisie powyżej.

## Mapa aplikacji i stosu

> Stan po połączeniu (decyzja D1 z 2026-11-15). Źródło: analiza repozytoriów oraz weryfikacja kluczowych twierdzeń
> w kodzie (porty, styki, wspólne pliki, wersje). Plan porządków i stan realizacji: [PLAN-PORZADKOWANIA.md](PLAN-PORZADKOWANIA.md).
>
> VizRS Live został wchłonięty przez **VizRS CG Playout** (jeden produkt: sidecar + panel `panel/` + most + stos).
> Pakiet liczy 3 aplikacje: CG System, CG Artist, CG Playout – patrz §2 (co robi każda), §9 i [plan połączenia](PLAN-PORZADKOWANIA.md#3-plan-połączenia-vizrs-live--vizrs-cg-playout).

## 1. Trzy aplikacje w jednym zdaniu

| Aplikacja | Katalog / repo | Wersja | Co robi | Kto używa |
|---|---|---|---|---|
| **VizRS CG System** | `VizRS CG System` · `sdorpl/VizRS-CG-System` | 26.11.13 | **Silnik grafiki i playout stron**: przechowuje show (sceny, strony, zasoby), prowadzi stan anteny (TAKE / CONTINUE / OUT / UPDATE) dla anteny głównej i do 64 anten kanałów, daje stanowisko operatora **Trio** i przezroczyste wyjście `/output` 1920×1080 | operator grafiki (Trio), OBS/vMix, Companion, pozostałe aplikacje pakietu |
| **VizRS CG Artist** | `VizRS CG Artist` · `sdorpl/VizRS-CG-Artist` | 26.11.12 | **Edytor scen i animacji** (program desktopowy, Tauri 2): projektowanie szablonów, oś czasu, presety ruchu, reguły dock; działa lokalnie bez serwera, sceny wysyła na serwer `vizrs` albo w paczce `.cgpack` | grafik, przygotowujący oprawę |
| **VizRS CG Playout** | `VizRS CG Playout` · `sdorpl/VizRS-CG-Playout` | 26.11.31 | **Automatyka emisji kanałów i panel MCR** nad ErsatzTV: wtapia grafikę VizRS w obraz kanałów według ramówki, przejmuje kanał sygnałem studia (RTMP / SRT / RTSP / HLS / YouTube), daje polski panel kanału (ramówka, media, EPG, podgląd, mozaika, as-run, konta) i natywne okno operatora (AppImage) | operator emisji, planista, administrator stacji; widzowie dostają strumienie |

Zewnętrzny, **niezmieniany** składnik stosu: **ErsatzTV legacy** (.NET; baza, skaner, planowanie, transkodowanie HLS/TS) z nowym silnikiem nadawania **ErsatzTV Next**.
Dawne osobne repozytorium VizRS Live (`sdorpl/VizRS-Live-Playout`) tworzy obecnie podkatalog `panel/` w CG Playout i jest zarchiwizowane.

## 2. Co robi każda aplikacja

Opis funkcji dla czytelnika, który chce wiedzieć, *co* dana aplikacja robi i gdzie kończy się jej zakres. Szczegóły i
konfiguracja – w dokumentacji aplikacji (odnośniki przy nagłówkach).

### 2.1. VizRS CG System – silnik grafiki i Trio

Dokumentacja: [`docs/DOKUMENTACJA.md`](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md), [`docs/API.md`](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md), [`docs/COMPANION.md`](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/COMPANION.md).

Serwer grafiki telewizyjnej czasu rzeczywistego (odpowiednik pary „silnik + Trio”): przechowuje grafikę, decyduje,
co jest na antenie, i rysuje to na przezroczystym wyjściu, które pobierają OBS, vMix, miksery i CG Playout.

**Składniki**

- **`vizrs`** – serwer (Rust, bez zależności zewnętrznych): HTTP/1.1 z interfejsem webowym, strumień zdarzeń SSE `/events`, komendy tekstowe TCP 6100, OSC (UDP), webhooki; atomowy zapis show i dziennik zdarzeń.
- **Trio (`/trio`)** – stanowisko operatora grafiki: wybór i wypełnianie stron, TAKE / CONTINUE / OUT, podgląd, rundown, karuzele, makra; układ dopasowuje się do telefonu i tabletu.
- **Wyjście (`/output`)** – przezroczysta strona 1920×1080 renderowana przez `renderer.js`; parametry wybierają warstwy, antenę (`bus=preview`, `bus=ch-N`), tło, tryb Fill / Key dla mikserów, obniżony klatkaż dla kanałów bez GPU.
- **`vizrs-shell`** – natywne okno (Tauri 2) dla Trio i wyjścia: menu, wiele monitorów, ikona w zasobniku, skróty globalne, logowanie tokenem albo kontem panelu; `vizrs trio|output|artist` otwiera też okno Chromium/Edge bez pasków.
- **`vizrs-render`** – renderer natywny na CPU (tiny-skia, rustybuzz) bez przeglądarki: strumień klatek dla playoutu kanału (`stream`), miniatury (`thumb`), obrysy grafiki (`bounds`); obsługuje ruch presetów 2D i obrazy WebP.
- **`/artist`** – dawny webowy edytor scen, zamrożony (nowe funkcje projektowe są tylko w VizRS CG Artist).
- Dystrybucja: binarki, `.deb` / `.rpm` / AppImage, instalator Windows, obraz Docker `ghcr.io/sdorpl/vizrs` (~3 MB, amd64 / arm64).

**Grafika: sceny i strony**

- **Sceny** (szablony) mają węzły, pola do wypełnienia i animacje z punktami zatrzymania: wejście (TAKE), kolejne fazy (CONTINUE), wyjście (OUT). **Strony** to ponumerowane wypełnienia scen (np. `TAKE 7510`).
- **Warstwy** (`back`, `main`, `front`, własne `z<N>_…`) – grafiki na różnych warstwach grają jednocześnie, na tej samej się zastępują; zmiana warstwy szablonu w Trio przenosi grafikę bez przerwania animacji.
- **Tekst**: dopasowanie do pola (`textFit`), polska typografia (twarde spacje), RichText, automatyczna zamiana skrótów; tła i ramki dopasowują się do tekstu, maski przycinają wyjazdy.
- **Dock**: scena odsuwa się od innych belek na antenie według ich bieżącego obrysu.
- **Presety ruchu**: wejścia, wyjścia, pętle i kaskady bez ręcznych kluczy.
- **Ticker** – przewijana taśma (`crawl`) i plansze (`roll`, `wipe`, `whip`) z kategoriami; wiadomości zmieniane w locie.
- **Zegary, stopery, odliczania** (także do startu następnej audycji) i **kody QR** generowane lokalnie.
- **Paczki `.cgpack`** – eksport i import scen, stron, grafik i fontów z planem importu (bez duplikatów).

**Antena i sterowanie**

- TAKE, CONTINUE, OUT, CLEAR, UPDATE (podmiana treści bez ponownej animacji), ARM na wyjście podglądu (`bus=preview`) przed wejściem na wizję.
- **Anteny kanałów** – do 64 niezależnych anten (`@N` w TCP, `?channel=N`, `bus=ch-N`): wspólne strony, osobne warstwy, rundowny i karuzele; z nich korzysta CG Playout przy wielu kanałach.
- **Rundown** (ręczna kolejka z NEXT / F8), **karuzele** (pętla stron z czasem trwania, prowadzona przez serwer), **makra** (sekwencje komend z opóźnieniami).
- **Reguły ramówkowe stron** (`playout`) – np. „60 s przed końcem audycji”; odczytuje je CG Playout.
- Sterowanie z zewnątrz: HTTP API, TCP 6100, OSC, zmienne stanu dla Companion / Stream Deck (`/api/variables`), webhooki `onAir` / `offAir` / `error`.

**Bezpieczeństwo**

- Dwa tokeny: **operatora** (pełne sterowanie) i **wyjścia** (tylko odczyt: `/output`, zdarzenia, fonty, grafiki – dla OBS i podglądu w panelu).
- Opcjonalne **logowanie kontami panelu VizRS CG Playout** (Trio i Artist), sesja sprawdzana w panelu co 15 s.
- Spowalnianie zgadywania tokenów, blokada żądań z obcych witryn, limity połączeń, dziennik audytu, kontrola rewizji przy równoczesnej edycji.

**Granice**: nie daje sygnału SDI / NDI / SRT / RTMP (obraz to strona `/output` albo surowe klatki `vizrs-render`); nie ma wbudowanego TLS (wystawienie przez reverse proxy); rundown nie gra sam według zegara; nie pobiera sam RSS do tickera; bez grafiki 3D i bez dźwięku.

### 2.2. VizRS CG Artist – edytor scen

Dokumentacja: [`docs/DOKUMENTACJA.md`](https://github.com/sdorpl/VizRS-CG-Artist/blob/main/docs/DOKUMENTACJA.md).

Program desktopowy grafika (odpowiednik edytora Artist): projektuje i animuje sceny, które potem gra CG System.
Domyślnie działa w pełni lokalnie, bez serwera; może też pracować wprost na zdalnym serwerze `vizrs`.

**Składniki**

- **`vizrs-cg-artist`** – jeden program Tauri 2 (WebKitGTK 4.1 / WebView2 / WKWebView) z wbudowanym lokalnym serwerem na `127.0.0.1` (stały port z zakresu 20000–31999), który podaje interfejs i magazyn albo jest pośrednikiem do serwera zdalnego.
- **Okno edytora** (kanwa 1:1, drzewo sceny, właściwości, oś czasu, menu systemowe, skróty) i **okno „Połącz z serwerem”** (do 20 zapisanych serwerów, token albo konto panelu).
- Jedna instancja: otwarcie pliku `.cgpack` przekazuje go do działającego programu.
- Paczki: `.deb`, `.rpm`, AppImage, `.msi`, `.exe`, `.dmg` (bez Dockera).

**Funkcje**

- **Kanwa**: zaznaczanie wielu elementów i edycja zbiorcza, uchwyty rozmiaru i obrotu, wyrównywanie i rozkład, schowek między scenami, edycja tekstu wprost na kanwie, zaokrąglanie pojedynczych rogów.
- **Prowadnice i tła podglądu**: siatki, bezpieczne strefy (EBU R 95, 4:3, 14:9), podkłady (kolor, chroma key, szachownica).
- **Oś czasu**: presety ruchu (wejście, pętla, wyjście, animacje tekstu) i klucze właściwości w jednym widoku; rozbijanie presetu na klucze i preset z zaznaczonych kluczy; maski z innego węzła.
- **Sceny odniesienia i dock**: inne sceny projektu w tle (według warstw), pomiar odstępów (Alt), ostrzeżenia o kolizjach; reguły dock z podglądem ruchu i ustawianiem przesunięcia przeciąganiem.
- **Magazyn lokalny** w formacie serwera (`show.json`, `assets/`, presety) ze sprawdzaniem modelem `vizrs-model`; blokada katalogu przed równoczesnym serwerem, kopie przy każdym zapisie, kopie robocze do odzyskania po awarii.
- **Wysyłka na serwer** (deploy): stan każdej sceny (nowa, zmieniona, obca, konflikt nazwy, na antenie) i wysłanie wybranych scen z zasobami, z kontrolą rewizji; token albo sesja konta zostaje w programie, nie trafia do strony.
- **`.cgpack`**: eksport i import paczek z planem rozwiązania konfliktów; deduplikacja grafik i fontów.
- Linux: tryby akceleracji WebKitGTK dla NVIDIA, skala ułamkowa (XWayland), ciemny motyw.

**Granice**: nie emituje grafiki i nie daje wyjścia `/output`; nie ma Trio (stron, rundownów, karuzel, makr); nie zna kanałów, ramówki ani live; nie łączy się z ErsatzTV, OBS ani Companion. Instalatory Windows i macOS są niepodpisane.

### 2.3. VizRS CG Playout – automatyka emisji i panel kanału

Dokumentacja: [`docs/DOKUMENTACJA.md`](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md) (sidecar §1–§8, panel §9–§15), [`docs/API.md`](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md), [`docs/INSTRUKCJA.md`](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/INSTRUKCJA.md).

Produkt emisyjny zbudowany wokół niezmienionego ErsatzTV: ErsatzTV prowadzi bazę mediów, ramówkę i transkodowanie,
a CG Playout dokłada grafikę VizRS w obrazie kanałów, przejęcia kanału przez studio i polski panel do prowadzenia
stacji. Jedna wersja i jedno wydanie dla wszystkich składników.

**Składniki**

- **`vizrs-cg`** (sidecar, Rust) – wysyła do CG System komendy grafiki według tego, co leci w ramówce; prowadzi renderer kanału (Chromium headless albo `vizrs-render`), taśmę tickera, strefy grafiki, odbiorniki live; podaje panelowi Live API (`:7700`).
- **`vizrs-ffmpeg`** – nakładka zamiast ffmpeg w kontenerze ErsatzTV: wtapia grafikę i znaki wodne w obraz kanału, przełącza kanał na sygnał live (takeover) bez przerwy dla widzów.
- **`vizrs-etv-client`** – klient elementu „script” ErsatzTV: przekazuje dane pozycji (tytuł, następna pozycja, czasy) do sidecara.
- **VizRS Bridge** (C# / .NET 10) – wtyczka ładowana do ErsatzTV legacy: wykonuje komendy MediatR z białej listy (kanały, harmonogramy, playouty, media, sesje); kodu ErsatzTV nie zmienia.
- **`vizrs-live`** – serwer panelu (Rust, bez zależności) z wbudowanym interfejsem SPA, kontami operatorów i pośrednikiem do mostu i sidecara (`:8090`).
- **Okno panelu** (`panel/desktop/`, Tauri 2, AppImage) – natywny klient panelu na serwerze dla stanowiska operatora: token i sesja konta zostają w programie; podgląd strumieni (GStreamer w paczce) i grafiki VizRS przez lokalnego pośrednika.
- **Proxy widzów** (Caddy, `:8409`) – na zewnątrz tylko strumienie HLS / TS, listy M3U, EPG XMLTV i HDHomeRun; web GUI legacy i most zablokowane.
- Obrazy Docker: `vizrs-cg`, `vizrs-seed` (dane startowe), `vizrs-live`, `vizrs-live-legacy` (ErsatzTV z mostem); stos compose z profilami `grafika` i `ingest`.

**Grafika w obrazie kanału**

- Komendy na start i koniec każdej pozycji (TAKE / UPDATE / OUT) z danymi ramówki: `{title}`, `{next_title}`, `{next_start_iso}` (odliczanie do następnej audycji) i inne.
- Grafika zdejmowana na czas reklam i przywracana z pierwszym zwykłym programem.
- **Zdarzenia wtórne** – belki i zapowiedzi w zadanej sekundzie pozycji, dla konkretnej pozycji albo ścieżki pliku, z okresem ważności; zatwierdza administrator.
- Strefy grafiki liczone automatycznie (`area: auto`) – nakładka rysuje tylko tam, gdzie jest grafika (mniej CPU); renderer natywny dla prostych stron, Chromium dla efektów, których `vizrs-render` nie umie.
- **Znaki wodne** ErsatzTV rysowane nad grafiką VizRS; miniatury stron do wyboru w panelu.

**Live ingest – studio na antenie**

- Przejęcie kanału sygnałem RTMP / SRT, linkiem RTSP / HLS albo transmisją YouTube (odświeżanie ciasteczek konta przez yt-dlp); wybór wejścia w panelu.
- **ZDEJMIJ / WPUŚĆ** – operator decyduje, czy studio wchodzi na antenę; osobna grafika i znak wodny na czas live (audycja vs studio poza audycją).
- **Audycje LIVE w ramówce** – zaplanowane pozycje na żywo z planszą zastępczą, gdy studio nie nadaje; przebieg live w rozdzielczości kanału.

**Panel kanału (MCR)**

- **Na antenie**: co leci i co następne na każdym kanale, pasek postępu, warstwy VizRS z przyciskami Dalej / Zdejmij / Wprowadź stronę, zdjęcie całej grafiki, start / restart / stop emisji, podgląd grafiki `/output` i strumienia kanału, **mozaika** (0–16 podglądów).
- **Ramówka**: kanały (numeracja, logo), harmonogramy klasyczne i blokowe, szablony dnia, wystrój (deco), kalendarz, playouty, import z CSV / XML, kontrola ramówki (luki, nakładki, brakujące pliki, kończące się playouty), przewodnik EPG.
- **Media**: biblioteki, źródła zewnętrzne (Jellyfin, Emby, Plex), przeglądarka mediów z odtwarzaniem bezpośrednim, kolekcje, playlisty, wypełniacze, znaki wodne, profile kodowania (x264, NVENC, QSV, VAAPI).
- **As-run i logi**: co faktycznie poszło na antenę (pozycje, strony grafiki, przejęcia) i logi systemu emisji na jednej osi czasu, eksport CSV.
- **Konta i alarmy**: konta administratorów i operatorów (pierwsza konfiguracja kodem z logu), wspólne logowanie w pakiecie (Trio, Artist), alarmy w panelu (obraz i dźwięk) i webhook alarmów.
- Podgląd strumieni w przeglądarce i oknie (MSE: H.264, AAC, HEVC i AC-3 tam, gdzie przeglądarka je dekoduje).

**Granice**: nie zmienia kodu ErsatzTV i nie pisze do jego bazy (wszystko przez most); bez wbudowanego TLS (panel za reverse proxy); ingest nie transkoduje sygnału studia (wymaga H.264 + AAC); jeden sygnał live naraz na kanał; nie edytuje plików konfiguracyjnych na wolumenach.

## 3. Kto z kim rozmawia

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

Dodatkowo przeglądarka operatora panelu VizRS CG Playout osadza ramkę `/output` CG Systemu (token wyjścia) i linkuje do Trio (`?channel=N`) – to styk tylko po stronie przeglądarki, serwer panelu nie rozmawia bezpośrednio z CG Systemem. W oknie panelu (AppImage) ramka `/output` idzie przez lokalnego pośrednika okna (ta sama witryna co strona – ciasteczko tokenu wyjścia działa), a Trio otwiera się w przeglądarce systemowej.

## 4. Styki (kontrakty) – kto jest dostawcą

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

## 5. Wspólny kod (kopie, nie biblioteka)

| Plik(i) | Źródło | Kopie | Pilnowanie |
|---|---|---|---|
| `vizrs-ui.css` (rdzeń wyglądu) | CG System `source/web/` | Artist `web/`, CG Playout `panel/server/web/` | `tools/sync-cg.sh --check` (Artist, CI), `scripts/sync-ui.sh` (CG Playout) – **identyczne** |
| `renderer.js`, `motion.js`, `cgpack.js`, `pack-ui.js`, `dom.js`, `qr.js`, `richtext.js`, `ticker-*.js`, `color-picker.js`, fonty | CG System `source/web/` | Artist `web/` (commit w `web/CG_SYSTEM`) | `sync-cg.sh --check` w CI Artist |
| `gpu.rs`, `scale.rs`, `screen.rs` (okno Tauri na Linuksie: NVIDIA DMA-BUF, Skia CPU, XWayland przy skali ułamkowej), `conn_url.rs` (adres i token serwera w oknie połączenia) | CG System `source/shell/src/` | Artist `src/`, CG Playout `panel/desktop/src/` | **identyczne bajt w bajt** |

## 6. Stos technologiczny

| | CG System | CG Artist | CG Playout (sidecar + panel) |
|---|---|---|---|
| Rdzeń | Rust 2021, **0 zależności** (własny HTTP/1.1, SSE, JSON, OSC) | Rust + Tauri 2, `ureq`/rustls | Sidecar: Rust 2024 (1.87+), tylko `png`, `regex`; własny HTTP, JSON, DevTools.<br>Panel: Rust, **0 zależności** (serwer `vizrs-live`) |
| UI | czysty JS (ES modules), bez bundlera | ten sam JS + `native.js` | Sidecar: brak UI (API).<br>Panel: czysty JS SPA, MSE + własny demux TS→fMP4 |
| Okno | `vizrs-shell` (Tauri 2), `vizrs trio` (Edge/Chromium bez pasków) | Tauri 2 (WebKitGTK 4.1 / WebView2 / WKWebView) | Panel: `panel/desktop/` Tauri 2 (AppImage) |
| Render | przeglądarka; `vizrs-render` (tiny-skia, rustybuzz) | WebView (ten sam renderer.js) | Chromium headless shell albo `vizrs-render` |
| Inne | – | – | ffmpeg (nakładka `vizrs-ffmpeg`), musl; **C# / .NET 10** VizRS Bridge (startup hook w ErsatzTV) |
| Dystrybucja | binarki, `.deb/.rpm/AppImage`, Inno Setup, obraz `scratch` ~3 MB (amd64/arm64) | `.deb/.rpm/AppImage/.msi/.exe/.dmg` (bez Dockera) | Obrazy Docker: `ghcr.io/sdorpl/vizrs-cg`, `vizrs-seed`, `vizrs-live`, `vizrs-live-legacy` (wszystkie `:latest`), archiwa/binarki, AppImage panelu |

Wspólne cechy: Rust bez frameworków, UI bez bibliotek JS, wszystko po polsku, wersje kalendarzowe `RR.MM.N` (od 26.11.1, 2026-11-12; wcześniej semver), wydanie = tag `v*` → GitHub Actions (`release.yml`).

## 7. Stos produkcyjny (Docker)

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

Portainer GitOps (s1/s2/s3) bierze stos z `main` CG Playout; `stack-refresh.yml` co 15 min aktualizuje `.release` (wersje obrazów), co przeładowuje stosy. Profile compose: `grafika` (silnik VizRS i sidecar), `ingest` (odbiorniki live, wymaga `grafika`); bez profilu – sam ErsatzTV z panelem. Stosy z grafiką mają `COMPOSE_PROFILES=grafika,ingest` i włączone „Re-pull image” (od 2026-11-16).

Porty: **8088** CG System (w stosie wystawiony jako 8788) · **6100** TCP VizRS · **7700** sidecar · **8090** panel · **8409** widzowie (Caddy) · **1936–1943** RTMP · **9000–9007/udp** SRT · Artist: tylko `127.0.0.1:20000–31999`.

## 8. Słownik

- **Trio** – stanowisko playoutu stron (CG System `/trio`); **Artist** – projektowanie scen; nazwy wzorowane na Vizrt.
- **Scena / strona** – szablon graficzny / wypełniona instancja szablonu z numerem (np. `TAKE 7510`).
- **Antena kanału, `bus=ch-N`, `@N`** – osobny stan on-air CG Systemu dla kanału N ErsatzTV.
- **Burn-in / nakładka** – wtapianie `/output` w obraz kanału przez podmieniony ffmpeg (`vizrs-ffmpeg`).
- **Live ingest / takeover** – sygnał studia RTMP/SRT przejmuje kanał w miejsce ramówki; `on_live` – grafika na czas przejęcia.
- **ZDEJMIJ / WPUŚĆ** (hold/release) – operator blokuje/wpuszcza studio na antenę kanału.
- **`.cgpack`** – paczka ZIP scen+stron+zasobów (Artist ↔ CG System); `.vizrs.json` – dawny format sceny.
- **VizRS Bridge** – wtyczka C# ładowana do niezmienionego ErsatzTV legacy, wykonuje komendy MediatR z białej listy.
- **ErsatzTV legacy / Next** – backend kanałów; Next = nowy silnik nadawania używany przez legacy.

## 9. Stan połączenia

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
