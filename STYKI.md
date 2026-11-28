# Styki pakietu VizRS

Styk w pakiecie VizRS stanowi formalny kontrakt techniczny pomiędzy aplikacją będącą jego dostawcą a aplikacjami pełniącymi rolę klientów. Szczegółowy opis techniczny każdego interfejsu znajduje się w dokumentacji źródłowej dostawcy, natomiast niniejszy dokument stanowi całościową mapę styków pakietu oraz reguł zarządzania ich kompatybilnością.

---

## 1. Protokół VizRS

Główny protokół komunikacyjny silnika grafiki czasu rzeczywistego. Obejmuje sterowanie emisją przez TCP, transmisję stanu i operacje na danych przez HTTP/SSE, dedykowane renderowane wyjście wizyjne dla mikserów i nakładek oraz mechanizm uprawnień do odczytu wyjścia.

| Element | Dostawca | Klienci | Opis u dostawcy |
|---|---|---|---|
| **TCP 6100** | VizRS CG System | VizRS CG Playout (sidecar `vizrs-cg`), Companion, zewnętrzne systemy automatyki | [VizRS-CG-System: docs/API.md §TCP](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md#tcp-port-6100-przy---token-pierwsza-linia-auth-token) |
| **Wyjście `/output`** | VizRS CG System | OBS, vMix, VizRS CG Playout (Chromium headless), przeglądarka panelu VizRS CG Playout | [VizRS-CG-System: docs/API.md §Wyjście /output](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md#wyj%C5%9Bcie-output) |
| **HTTP / SSE** | VizRS CG System | VizRS CG Playout (sidecar `vizrs-cg`), VizRS CG Artist (klient proxy), Companion, panele operatorskie | [VizRS-CG-System: docs/API.md](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md) |
| **Token wyjścia** | VizRS CG System | OBS, VizRS CG Playout (Chromium headless, miniatury `vizrs-render`, ramka podglądu panelu) | [VizRS-CG-System: docs/API.md](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md) |

### Szczegóły techniczne elementów styku
- **TCP 6100 (komendy):** Tekstowy protokół w stylu Viz z komendami zakończonymi znakiem nowej linii (`\n`). Przy włączonym uwierzytelnianiu pierwszą wymaganą komendą jest `AUTH <token>`. Kluczowe komendy: `TAKE <strony>`, `ARM <strona>`, `CONTINUE <warstwy|strony>`, `OUT <warstwy|strony>`, `CLEAR`, `UPDATE <strona> k=v`, `LIVE <strona> k=v`, `TICKER <strona[:pole]> ...`, `NEXT <rundown>`, `RUNDOWN ...`, `MACRO <nazwa>`, `CAROUSEL ...`, `STATE`, `PING`. Odpowiedź serwera: `OK {json}` albo `ERR komunikat`.
  - **Anteny kanałów (`@<kanał>`):** Prefiks `@<kanał> <komenda>` (np. `@2 TAKE 4001`) kieruje wykonanie na niezależną antenę kanału (do 64 anten w systemie; lista w `channels.json`). Każda antena ma własny stan warstw, bufor rundownu, makra i powiązania (dock).
- **Wyjście `/output` (strona wyjścia):** Przezroczysta strona HTML/JS renderowana w 1920×1080 (domyślnie) lub zadanym rozmiarze (`?w=...&h=...`). Obsługuje parametry:
  - `bus=preview` – podgląd uzbrojonej grafiki (ARM).
  - `bus=ch-<kanał>` – dedykowana antena kanału playoutu sterowana przez TCP `@<kanał>`.
  - `layers=main,front` – filtrowanie warstw widocznych na danym wyjściu.
  - `mode=fill` oraz `mode=key` – rozdzielenie na obraz barwny i sygnał kluczujący dla wejść Fill/Key mikserów wizyjnych.
  - `?fps=25` oraz `?fx=step` – lekkie wyjście dla procesów bezgłowych (animacje skokowe, ograniczenie klatkażu).
  - `window.vizrsTape` – API DevTools do sterowania przesuwem taśmy crawla przez sidecar.
- **HTTP / SSE (`/api/show`, zdarzenia):** 
  - REST API serwera `vizrs`: odczyt całego projektu (`GET /api/show`), modyfikacja elementów (`/scenes`, `/pages`, `/playlists`, `/rundowns`, `/macros`), stan silnika (`GET /api/state`), zmienne dla kontrolerów (`GET /api/variables`), lista kanałów (`/api/channels`), zasoby binarne (`/api/assets`), wbudowane czcionki (`/api/fonts`) oraz kontrola zdrowia (`GET /health`, `GET /api/health`).
  - Strumień zdarzeń SSE (`GET /events`): jednokierunkowy strumień zdarzeń w czasie rzeczywistym (`snapshot`, `take`, `continue`, `out`, `clear`, `update`, `rescene`, `relayer`, `dock`, `show`, `state`, `error`, `wordreplace`). Silnik nie korzysta z protokołu WebSocket.
- **Token wyjścia (`--output-token`):** Specjalny token ograniczający uprawnienia klienta wyłącznie do bezpiecznego odczytu: `GET /output`, `/events`, `/fonts/*`, `/assets/*`, `/health`, `GET /api/assets`, `POST /api/report`. Wszelkie próby modyfikacji stanu i konfiguracji kończą się kodem HTTP 403. Przeglądarka panelu VizRS CG Playout używa go do bezpiecznego osadzania ramki podglądu PGM bez ryzyka przejęcia uprawnień operatorskich. Po wejściu na `/output?token=…` serwer ustawia ciasteczko `vizrs_token` (`SameSite=Strict`), którym autoryzuje skrypty strony i `/events`; dlatego ramka działa tylko z tej samej witryny co strona osadzająca – w oknie panelu (AppImage, strona na `127.0.0.1`) ramka idzie przez lokalnego pośrednika okna (§5).

---

## 2. Format scen i paczek

Wspólne formaty zapisu projektów graficznych, wymiany szablonów i stron pomiędzy edytorem a playoutem oraz bezpośredni protokół renderera natywnego dla środowisk pozbawionych GPU.

| Element | Dostawca | Klienci | Opis u dostawcy |
|---|---|---|---|
| **Format show (`show.json`)** | VizRS CG System | VizRS CG Artist, VizRS CG Playout (odczyt granic stron i miniatur) | [VizRS-CG-System: docs/DOKUMENTACJA.md §3–§4](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md#3-model-danych-showjson) |
| **Paczka belek (`.cgpack`)** | VizRS CG System | VizRS CG Artist, VizRS CG System (Trio, serwer `vizrs`) | [VizRS-CG-System: docs/DOKUMENTACJA.md §8.7](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md#87-paczka-belek-i-stron-cgpack) |
| **Renderer natywny `vizrs-render`** | VizRS CG System | VizRS CG Playout (sidecar `vizrs-cg`, panel) | [VizRS-CG-System: docs/DOKUMENTACJA.md §10.1](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md#101-renderer-natywny-vizrs-render) |

### Szczegóły techniczne elementów styku
- **`show.json`:** Główny dokument danych projektu graficznego. Zawiera tablice definicji: sceny (`scenes[]`: węzły, klucze animacji, warstwy, stop pointy, reguły powiązań dock), strony (`pages[]`: numer, przypisana scena, słownik wartości `values{}`), playlisty karuzeli (`playlists[]`), listy odtwarzania (`rundowns[]`), sekwencje automatyzacji (`macros[]`), reguły typografii i walidacji pól (`fieldMeta{}`), bibliotekę animacji (`animpresets`) oraz słownik zamian (`wordreplace`). Stan projektu chroniony jest atomowym zapisem dyskowym oraz numerem rewizji (`rev`) zapobiegającym nadpisaniom przy pracy równoległej.
- **`.cgpack`:** Standardowy format przenoszenia kompletnych belek, scen i powiązanych z nimi stron. Archiwum w formacie ZIP zawiera:
  - `manifest.json` – metadane (`_type: "vizrs_pack"`, `_packVersion: 1`, sumy kontrolne CRC-32 plików).
  - `scenes.json` – wyodrębniony fragment `show.json` ze scenami i stronami.
  - `assets/` – dołączone zasoby graficzne, wideo i czcionki (TTF, OTF, WOFF, WOFF2).
  - Import paczki opiera się na dwuetapowym kontrakcie (`planImport` -> `importPack`): najpierw generowany jest plan uwzględniający identyfikatory UUID (`id`), ewentualne konflikty nazw i wersji oraz przesunięcia numeracji stron, a dopiero po akceptacji operatora następuje zapis do magazynu.
- **`vizrs-render` (protokół klatek i analizy CPU):** Samodzielna binarka rastrująca sceny na CPU (tiny-skia, rustybuzz) z trzema podkomendami stanowiącymi styk:
  - `stream`: Protokół strumieniowania klatek grafiki do procesu `vizrs-cg` przez stdin/stdout. Stdin przyjmuje ramki: `F <czas_ms> <ścienny_ms> [cfp]` oraz polecenie zakończenia `Q`. Stdout zwraca 16-bajtowy nagłówek binarny (`VZR1`, rodzaj rekordu u8, flagi u8, 2 bajty rezerwy, szerokość u32 LE, wysokość u32 LE) wraz z pikselami RGBA. Rodzaje rekordu: 0 – bez zmian, 1 – pełna klatka, 2 – klatka pusta, 3 – brak możliwości narysowania natywnego (żądanie przejścia na Chromium), 4 – prostokąt z grafiką, 5 – zestaw prostokątów dla wielu stref, 6 – łata (patch) podmieniająca zmieniony fragment poprzedniego obrazu.
  - `bounds`: Analiza granic renderowania stron (`--show`, `--size`, `--page N` lub `--all 1`, `--url`). Zwraca na stdout wiersze JSON `{id, number, size, cell, rects, issues}` określające zajętość siatki 16 px, wykorzystywane przez sidecar do dynamicznego wyznaczania stref nakładki (`area: auto`).
  - `thumb`: Generowanie statycznych miniatur stron w formacie PNG (`--show`, `--dir`, `--width 320`, `--url`). Zwraca wiersze JSON `{number, file, crop, issues}`. Wyniki trafiają do pamięci podręcznej sidecara dla potrzeb panelu.

---

## 3. Live API sidecara `:7700`

Interfejs REST sidecara grafiki i live ingestu (`vizrs-cg`) wchodzący w skład produktu VizRS CG Playout. Zapewnia kontrolę nad stanem przejmowania kanałów, koderem nakładki, regułami automatycznej grafiki, miniaturyzacją oraz as-run logiem.

| Element | Dostawca | Klienci | Opis u dostawcy |
|---|---|---|---|
| **`/api/live/*`** | VizRS CG Playout (`vizrs-cg`) | Panel kanału VizRS CG Playout (pośrednik `/api/cg/*`) | [VizRS-CG-Playout: docs/API.md §1](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md#1-live-api-sidecara-apilive-etv-ffmpeg-ingest-health) |
| **`/health`** | VizRS CG Playout (`vizrs-cg`) | Monitoring, Docker compose, panel VizRS CG Playout | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §1](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#1-jak-to-dzia%C5%82a) |
| **`/etv*`** | VizRS CG Playout (`vizrs-cg`) | `vizrs-etv-client` (kontener ErsatzTV), panel VizRS CG Playout | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §1](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#1-jak-to-dzia%C5%82a) |
| **`/ffmpeg*`** | VizRS CG Playout (`vizrs-cg`) | `vizrs-ffmpeg` (nakładka w procesie transkodowania ErsatzTV) | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §1](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#nak%C5%82adka-ffmpeg) |
| **`/ingest*`** | VizRS CG Playout (`vizrs-cg`) | Nakładka ffmpeg, panel VizRS CG Playout | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §1](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#live-ingest) |
| **`panel_token`** | VizRS CG Playout (`vizrs-cg`) | Serwer panelu VizRS CG Playout (`VIZRS_LIVE_CG_TOKEN`) | [VizRS-CG-Playout: docs/API.md §1](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md#1-live-api-sidecara-apilive-etv-ffmpeg-ingest-health) |

### Szczegóły techniczne elementów styku
- **Uwierzytelnianie (`panel_token`):** Włączane zmienną środowiskową `VIZRS_PANEL_TOKEN` w kontenerze `cg`. Przekazywane przez klienta w nagłówku `X-Panel-Token` lub `Authorization: Bearer <token>`. Pusty token wyłącza endpointy `/api/live/*` (zwracają HTTP 404). Zabezpieczenie CSRF weryfikuje nagłówki `Sec-Fetch-Site` oraz `Origin`. Nagłówek `X-Operator` rejestruje nazwę stanowiska w dzienniku audytu.
- **Główne punkty końcowe Live API:**
  - `GET /health` – status działania sidecara, metryki stref grafiki (`zones`: liczba śladów stron, granice, aktywne przebiegi nakładki).
  - `GET /etv/pages?channel=<n>` – lista stron skonfigurowanych dla kanału w ErsatzTV.
  - `GET /ingest/state?channel=<n>` – informacja czy dany kanał jest aktualnie przejęty przez sygnał live (`"live": true|false`); od 26.11.36 także `"window"` – tytuł trwającego okna nagłej emisji albo `null`.
  - `GET /ffmpeg?channel=<n>`, `GET /ffmpeg/frames`, `GET /ffmpeg/zones` – wewnętrzne punkty przejmowania sesji klatek nakładki ffmpeg i dynamicznej aktualizacji stref.
  - `GET /api/live/state` – całościowy stan: parametry sygnału live (kodek, parametry audio, czas trwania), stany `on_air`, `takeover`, `hold`, `anytime`, audycje LIVE z EPG, lista portów wejściowych `inputs`, zdarzenia oraz pole `features` – lista obsługiwanych funkcji, po której panel włącza swoje widoki (starszy sidecar = brak funkcji, nie błąd). W 26.11.31: `layers`, `take`, `asrun`, `encoder`, `thumbs`, `logs`, `on_live`, `input_on_live`, `live_watermark`, `input_select`, `youtube_cookies`, `events`, `approval`, `webhook`, `library`, `store`, `graphics_off`, `graphics_off_since`.
  - `POST /api/live/channels/<n>/hold` oraz `/release` – natychmiastowe wstrzymanie (powrót do ramówki) i przywrócenie sygnału studia na antenę.
  - `PUT /api/live/channels/<n>` – zmiana flagi `anytime` (przejmowanie kanału poza zdefiniowanymi oknami audycji LIVE) oraz wybór wejścia kanału `{"input": id|null}` (`input_select`; `null` = automatycznie – pierwsze z sygnałem).
  - `POST /api/live/channels/<n>/rebuild` – zlecenie resetu playoutu kanału w ErsatzTV (kasuje postęp odcinków; panel od 26.11.36 przebudowuje Refreshem przez most `BuildPlayout`).
  - `GET|POST /api/live/channels/<n>/windows`, `DELETE /api/live/channels/<n>/windows/<id>` – okna nagłej emisji (od 26.11.36, cechy `windows` i `windows_keep`): w oknie kanał bierze sygnał studia jak przy `anytime`, bez wstrzymania; po końcu wraca stan sprzed okna; pole `keep` – jednodniowy harmonogram zastępczy, który panel postawił w legacy dla „zachowaj odcinek” (opis: `docs/API.md` §1 CG Playout).
  - `POST /api/live/channels/<n>/take`, `/continue`, `/out` – ręczne wyzwalanie komend grafiki na antenie danego kanału z poziomu panelu (Quick Take).
  - `GET|POST|PUT|DELETE /api/live/shows` – zarządzanie audycjami LIVE w ErsatzTV (tworzenie plików `.yml`, wyzwalanie skanowania biblioteki, zakładanie Smart Collections).
  - `GET|PUT /api/live/graphics` – odczyt i modyfikacja reguł automatycznej grafiki (`graphics.json`), w tym zdarzeń wtórnych (`secondary`: strony w zadanych chwilach pozycji wybranej po tytule, ścieżce pliku albo starcie, z datami ważności i zatwierdzaniem – `events`, `approval`; zatwierdza tylko administrator panelu).
  - `POST /api/live/graphics/off` oraz `/on` – zdjęcie i przywrócenie grafiki kanału z odegraniem pełnych animacji wyjścia/wejścia.
  - `GET|PUT /api/live/inputs` – konfiguracja wejść kanałów: odbiorniki RTMP (porty 1936–1943) i SRT (9000–9007), transmisje YouTube i strumienie z linku (HLS, RTMP, SRT, RTSP) pobierane przez sidecar; grafika i znak wodny na czas przejęcia z danego wejścia (`on_live`, `live_watermark`); ciasteczka konta YouTube (`youtube_cookies`).
  - `GET|PUT /api/live/encoder` – parametry kodera w nakładce ffmpeg (presety, profile x264/NVENC/QSV, parametry klatek B).
  - `GET /api/live/thumbs/<numer>.png` – serwowanie miniatur wygenerowanych przez `vizrs-render thumb` (buforowane w `<etv_config>/vizrs-live/thumbs/`).
  - `GET /api/live/asrun` – dziennik zdarzeń emisyjnych as-run w formacie JSONL (czasy w UTC, retencja 30 dni).
  - `GET /api/live/logs` – dostęp do rotowanych logów emisyjnych (`cg`, `ingest`, `takeover`).

---

## 4. Most VizRS Bridge `/vizrs-bridge/*`

Wewnętrzny styk integracyjny produktu VizRS CG Playout. Zapewnia bezpieczną komunikację pomiędzy serwerem panelu `vizrs-live` a procesem aplikacji ErsatzTV legacy bez wprowadzania modyfikacji w jej kodzie źródłowym.

| Element | Dostawca | Klienci | Opis u dostawcy |
|---|---|---|---|
| **`/vizrs-bridge/*`** | VizRS CG Playout (most C# w ErsatzTV legacy) | Panel VizRS CG Playout (`panel/server/` – `vizrs-live`) | [VizRS-CG-Playout: docs/API.md §3](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md#3-api-mostu-vizrs-bridge) |
| **Token mostu** | VizRS CG Playout (most C#) | Panel VizRS CG Playout (`--bridge-token`) | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §10](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#10-most-vizrs-bridge) |
| **Biała lista `commands.txt`** | VizRS CG Playout (`panel/bridge/`) | Most C# w ErsatzTV legacy | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §10](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#10-most-vizrs-bridge) |

### Szczegóły techniczne elementów styku
- **Charakter styku:** Po połączeniu projektów (decyzja D1) most jest elementem wewnątrz repozytorium VizRS CG Playout (`panel/bridge/`). Nie stanowi interfejsu publicznego pakietu.
- **Uwierzytelnianie:** Wymagany nagłówek `X-VizRS-Token` o wartości zgodnej ze zmienną `VIZRS_BRIDGE_TOKEN`.
- **Biała lista (`commands.txt`):** Plik konfiguracyjny definiujący dozwolone komendy wewnętrzne MediatR silnika ErsatzTV. Próba wykonania komendy niewymienionej w pliku zostaje odrzucona przez most.
- **Endpointy mostu:**
  - `GET /vizrs-bridge/health` – weryfikacja dostępności mostu, wersji oraz stanu filtra klatkażu.
  - `GET /vizrs-bridge/commands` – lista dozwolonych komend z parametrami i typami.
  - `POST /vizrs-bridge/command/{Nazwa}` – wykonanie komendy MediatR w procesie legacy z przekazaniem parametrów w ciele JSON.
  - `GET /vizrs-bridge/sessions` – odczyt aktywnych sesji transkodera (`IFFmpegSegmenterService.Workers`).
  - `POST /vizrs-bridge/session/{kanał}/stop` – zatrzymanie sesji emisyjnej danego kanału.
  - `POST /vizrs-bridge/upload/{Logo|Watermark}` – zapis plików graficznych do pamięci legacy z pominięciem jej web GUI.
  - `GET /vizrs-bridge/framerates` oraz `POST /vizrs-bridge/framerate/{IdProfilu}` – kontrola stałego klatkażu w profilach FFmpeg (np. wymuszenie 25 kl./s dla standardu telewizyjnego).
  - `GET /vizrs-bridge/watermarks/{kanał}/{IdPozycji}` – znaki wodne, które legacy rysowałby w płótnie grafiki pozycji (wybór, położenie, skala, krycie); klient: nakładka `vizrs-ffmpeg`, która rysuje je sama nad grafiką VizRS. `GET /vizrs-bridge/watermarks/{kanał}?ids=…` – wybrane znaki wodne na czas przejęcia przez live ingest (`live_watermark`). Wymaga `VIZRS_BRIDGE_TOKEN` także w kontenerze ErsatzTV.

---

## 5. API panelu `/api/*`

Wewnętrzny interfejs serwera aplikacji panelu VizRS CG Playout (`panel/server/`), obsługujący interfejs webowy SPA oraz natywną aplikację okienną.

| Element | Dostawca | Klienci | Opis u dostawcy |
|---|---|---|---|
| **`/api/*`** | VizRS CG Playout (`panel/server/` – `vizrs-live`) | Przeglądarka internetowa operatora, okno desktopowe (Tauri 2 w `panel/desktop/`) | [VizRS-CG-Playout: docs/API.md §2](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md#2-api-panelu-api) |
| **Konta, token panelu i sesje** | VizRS CG Playout (`vizrs-live`) | Przeglądarka internetowa, klient okienny | [VizRS-CG-Playout: docs/API.md §2](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md#2-api-panelu-api) |
| **Nagłówek `X-VizRS-Live`** | Klient UI panelu (SPA / Tauri 2) | Serwer panelu VizRS CG Playout | [VizRS-CG-Playout: docs/API.md §2](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md#2-api-panelu-api) |

### Szczegóły techniczne elementów styku
- **Charakter styku:** Wewnętrzny styk aplikacji VizRS CG Playout (port domyślny 8090).
- **Bezpieczeństwo i sesje:**
  - **Konta operatorów** (gdy panel ma katalog danych): `GET /api/auth` (czy logowanie wymagane, czy są konta), `POST /api/setup` (pierwsze konto administratora z kodem z logu), `POST /api/login` z `{"user","password"}`, `POST /api/logout`, zarządzanie kontami `/api/users…` (tylko administrator); role `admin` i `operator`. Token panelu działa dalej jako ścieżka awaryjna i dla paneli bez kont.
  - Logowanie za pomocą tokenu (`POST /api/login`) tworzy sesję w pamięci serwera (do 256 sesji, identyfikator 32-bajtowy) i ustawia ciasteczko `vizrs_live` (HttpOnly, SameSite=Strict, retencja 30 dni bezczynności). Skrypty mogą autoryzować się nagłówkiem `Authorization: Bearer <token>`.
  - Żądania modyfikujące (`POST`, `PUT`, `DELETE`) bezwzględnie wymagają obecności nagłówka `X-VizRS-Live: 1`, co uniemożliwia ich wykonanie z poziomu obcych witryn (zabezpieczenie CSRF).
  - Ochrona przed atakami brute-force: limit 10 błędnych prób logowania na 60 sekund na adres IP klienta.
  - Automatyczne maskowanie sekretów: pola kończące się na `apikey`, `token`, `password`, `secret` są w odpowiedziach zamieniane na ciąg `"********"`.
- **Główne funkcje API:**
  - `GET /health` – status gotowości serwera panelu (bez uwierzytelniania).
  - `GET /api/status` – wersje składników, stan połączenia z mostem i sidecarem.
  - `GET /api/exposure` – diagnostyka widoczności ścieżek od strony sieci publicznej.
  - `POST /api/cmd/{Nazwa}` – bezpieczne pośredniczenie do komend mostu ErsatzTV.
  - `GET|POST|PUT|DELETE /api/cg/*` – transparentne pośredniczenie do Live API sidecara `:7700` z weryfikacją uprawnień i dekodowaniem nazwy stanowiska w `X-Operator`.
  - `GET /api/stream/*` – podgląd strumienia HLS kanału (HLS proxy z przepisywaniem ścieżek segmentów i nagłówkiem synchronizacji zegara `X-VizRS-Now`).
  - `POST /api/play/*` – testowe uruchamianie pozycji z poziomu przeglądarki.
  - `GET /api/artwork/*` – serwowanie grafik i okładek z bazy mediów.
  - `POST /api/vod/open`, `GET /api/vod/{id}` – bezpośrednie odtwarzanie materiałów VOD (Jellyfin / pliki lokalne) z obsługą nagłówków `Range: bytes` bez transkodowania przez ErsatzTV.
- **Okno panelu (`panel/desktop/`, AppImage) jako klient:** łączy się z panelem na serwerze przez lokalnego pośrednika (`127.0.0.1`, losowy port), który dokleja token albo sesję konta – strona okna nie zna ani tokenu, ani identyfikatora sesji (sesję konta zapisuje program w `live-connections.json`). Drugi port pośrednika obsługuje tylko ramkę podglądu VizRS `/output`: adres VizRS bierze z `vizrsUrl` w `GET /api/status`, a stronie dopisuje tam `vizrsOutputProxy`, którego `core.js` panelu używa wyłącznie dla `/output` (od 26.11.31). Trio i inne odnośniki zewnętrzne otwiera przeglądarka systemowa.

---

## 6. ErsatzTV

Zewnętrzny, niezmieniany składnik stosu emisyjnego (.NET 10). Integracja odbywa się wyłącznie za pośrednictwem oficjalnych lub systemowych mechanizmów rozszerzeń, bez wprowadzania zmian w kodzie źródłowym samego silnika emisyjnego.

| Element | Dostawca | Klienci | Opis u dostawcy |
|---|---|---|---|
| **Element grafiki „script”** | ErsatzTV legacy | VizRS CG Playout (`vizrs-etv-client`) | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §1](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#1-jak-to-dzia%C5%82a) |
| **Ścieżka FFmpeg (`vizrs-ffmpeg`)** | VizRS CG Playout (`vizrs-ffmpeg`) | ErsatzTV legacy (konfiguracja `FFmpeg Path`) | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §1](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#nak%C5%82adka-ffmpeg) |
| **Startup hook mostu** | Środowisko uruchomieniowe .NET / ErsatzTV | VizRS CG Playout (`VizRS.Bridge.dll`) | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §10](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#10-most-vizrs-bridge) |
| **Komendy MediatR** | ErsatzTV legacy | Most VizRS Bridge (`panel/bridge/`) | [VizRS-CG-Playout: docs/DOKUMENTACJA.md §10](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/DOKUMENTACJA.md#10-most-vizrs-bridge) |

### Szczegóły techniczne elementów styku
- **Element grafiki „script”:** Mechanizm graficzny ErsatzTV uruchamia proces elementu dla każdej pozycji ramówki. Statyczna binarka `vizrs-etv-client` (musl) odbiera na standardowym wejściu stdin metadane pozycji w formacie JSON (ścieżka pliku, czasy, klatkaż, rozdzielczość, EPG) i przesyła je protokołem HTTP do sidecara `vizrs-cg` (`POST /etv`), po czym przekazuje odebrane pakiety surowej grafiki ze stdout do silnika graficznego ErsatzTV.
- **Ścieżka FFmpeg (`vizrs-ffmpeg`):** Nakładka zastępująca binarkę ffmpeg w konfiguracji ErsatzTV (**Settings → FFmpeg → FFmpeg Path** = `/vizrs/vizrs-ffmpeg`).
  - Przy wywołaniach standardowych nakładka natychmiast przekazuje sterowanie do właściwego FFmpeg (`exec`).
  - W przypadku wykrycia generowania płótna grafiki (`-i http://.../internal/graphics/<kanał>/<pozycja>`), nakładka samodzielnie odczytuje płótno (aktywując element „script”), przejmuje sesję klatek z sidecara przez `GET /ffmpeg?channel=<kanał>` i wstrzykuje surowy strumień wideo `yuva420p` (lub deltę zmian klatek) za pośrednictwem pary gniazd uniksowych (`socketpair`) jako `-i pipe:N`.
  - Eliminuje to narzut pośredniego kodowania FFV1 w procesie .NET ErsatzTV i pozwala na płynne nakładanie grafiki bezpośrednio w filtrach docelowego FFmpeg (`overlay`, `overlay_cuda`, `overlay_vaapi`).
- **Startup hook mostu:** Załadowanie biblioteki `VizRS.Bridge.dll` do procesu aplikacji następuje poprzez standardową zmienną środowiskową platformy .NET: `DOTNET_STARTUP_HOOKS=/app/VizRS.Bridge.dll`. Hook uruchamia lekki serwer HTTP wewnątrz procesu ErsatzTV przed startem głównej aplikacji.
- **Komendy MediatR:** Most uzyskuje referencję do wewnętrznego kontenera zależności ErsatzTV i wywołuje zarejestrowane procedury szyny MediatR (np. `StopChannel`, `SaveArtworkToDisk`, zapytania o kolekcje i playouty) z zachowaniem pełnej spójności transakcyjnej bazy danych SQLite/EF Core.

---

## 7. Kod wspólny

Współdzielone pliki źródłowe, komponenty wyglądu oraz moduły okna natywnego kopiowane pomiędzy repozytoriami pakietu za pomocą skryptów weryfikowanych w potokach CI.

| Element | Dostawca | Klienci | Opis u dostawcy |
|---|---|---|---|
| **`vizrs-ui.css`** | VizRS CG System (`source/web/`) | VizRS CG Artist (`web/`), VizRS CG Playout (`panel/server/web/`) | [VizRS-CG-System: source/web/vizrs-ui.css](https://github.com/sdorpl/VizRS-CG-System/blob/main/source/web/vizrs-ui.css) |
| **Moduły okna (`gpu.rs`, `scale.rs`, `screen.rs`, `conn_url.rs`)** | VizRS CG System (`source/shell/src/`) | VizRS CG Artist (`src/`), VizRS CG Playout (`panel/desktop/src/`) | [VizRS-CG-System: docs/DOKUMENTACJA.md §12](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md#12-uruchamianie-opcje-bezpiecze%C5%84stwo) |
| **Zasady pakietu (`CLAUDE.md`, `AGENTS.md`...)** | VizRS CG System (`CLAUDE.md`, `tools/sync-zasady.sh`) | VizRS CG Artist, VizRS CG Playout, repozytorium nadrzędne VizRS | [VizRS-CG-System: CLAUDE.md](https://github.com/sdorpl/VizRS-CG-System/blob/main/CLAUDE.md) |
| **Moduły renderera i edycji scen** | VizRS CG System (`source/web/`) | VizRS CG Artist (`web/`) | [VizRS-CG-System: docs/DOKUMENTACJA.md §4](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md#4-renderowanie-scen-i-tekstu-rendererjs) |

### Szczegóły techniczne elementów styku
- **Zarządzanie kodem wspólnym:** W pakiecie obowiązuje zasada braku zewnętrznych zależności bibliotecznych w rdzeniach serwerów. Kod wspólny nie jest wydzielany do osobnej biblioteki (crate/npm), lecz synchronizowany bezpośrednio w postaci plików źródłowych ze sprawdzaniem zgodności `--check` w CI.
- **`vizrs-ui.css`:** Wspólny rdzeń wizualny platformy VizRS (definicje tokenów kolorystycznych, typografii, kontrolek formularzy, kart, przycisków akcji TAKE/OUT/ARM oraz statusów połączeń). Synchronizowany skryptami `tools/sync-cg.sh` (Artist) oraz `panel/scripts/sync-ui.sh` (CG Playout).
- **Moduły okna Tauri (`gpu.rs`, `scale.rs`, `screen.rs`, `conn_url.rs`):** Identyczne bajt w bajt implementacje obsługi specyfiki Linuksa w aplikacjach desktopowych:
  - `gpu.rs`: Wykrywanie sterowników GPU, obsługa obejścia problemów ze sprzętowym renderowaniem WebKitGTK na układach NVIDIA (wybór buforów DMA-BUF lub programowego backendu Skia).
  - `scale.rs`: Rozwiązanie problemu braku natywnej obsługi ułamkowego skalowania Wayland w GTK 3 / WebKitGTK 4.1 poprzez automatyczne przełączanie na sesję XWayland pod kompozytorem KWin.
  - `screen.rs`: Ograniczanie początkowego rozmiaru nowo otwieranych okien do maksymalnie 92% szerokości i 90% wysokości monitora roboczego.
  - `conn_url.rs`: Sprawdzanie adresu (`normalize_url`) i tokenu (`valid_token`) serwera w oknie „Połącz z serwerem”; reszta `connect.rs` różni się między oknami i nie jest synchronizowana.
- **Zasady pakietu:** Bloki wspólne (`pakiet:A`, `pakiet:B`, `pakiet:C`, `pakiet:D`, `pakiet:S`) w plikach instrukcji agentów (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `docs/AGENCI.md`) są dystrybuowane skryptem `tools/sync-zasady.sh`.
- **Moduły strony Artist:** Moduły `renderer.js`, `motion.js`, `qr.js`, `richtext.js`, `ticker-*.js`, `color-picker.js`, `cgpack.js`, `pack-ui.js`, `dom.js` (zapis HTML szablonem `html` z escapowaniem), `ui.css` oraz zestawy fontów offline w VizRS CG Artist są kopiami z `source/web/` w VizRS CG System (wersja odnotowywana w pliku `web/CG_SYSTEM`). Wszelkie zmiany logiki rysowania muszą być najpierw wprowadzane w silniku CG System, a następnie propagowane do edytora Artist.

---

## 8. Logowanie w pakiecie (konta panelu w Trio i Artist)

Opcjonalny styk między panelem VizRS CG Playout (dostawca kont) a VizRS CG System (Trio, a przez serwer `vizrs` także okno VizRS CG Artist): jedno konto w całym stosie. Domyślnie wyłączony – administrator panelu włącza przełącznik „Logowanie w pakiecie VizRS” (ekran Użytkownicy).

| Element | Dostawca | Klienci | Opis u dostawcy |
|---|---|---|---|
| **`/api/sso`, `/api/sso/verify`, `/api/sso/session`** | VizRS CG Playout (`vizrs-live`) | VizRS CG System (`--panel-login` / `VIZRS_PANEL_LOGIN`) | [VizRS-CG-Playout: docs/API.md §2](https://github.com/sdorpl/VizRS-CG-Playout/blob/main/docs/API.md#2-api-panelu-api) |
| **`/login/info`, `/login`, `/logout`, ciasteczko `vizrs_session`** | VizRS CG System (`vizrs`) | Trio (przeglądarka, `vizrs-shell`), okno VizRS CG Artist („Połącz z serwerem”) | [VizRS-CG-System: docs/API.md](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/API.md), [docs/DOKUMENTACJA.md §12](https://github.com/sdorpl/VizRS-CG-System/blob/main/docs/DOKUMENTACJA.md) |

### Szczegóły techniczne elementów styku
- **Weryfikacja konta:** serwer `vizrs` przekazuje login i hasło do `POST /api/sso/verify` panelu (ten sam limit prób co logowanie w panelu) i dostaje użytkownika z rolą oraz sesję; ciasteczko `vizrs_session` działa w `vizrs` jak token operatora, a log audytowy podpisuje operacje kontem.
- **Wspólna sesja:** kto jest zalogowany w panelu pod tym samym adresem serwera, wchodzi do Trio bez ponownego logowania (`GET /api/sso/session` z ciasteczkiem panelu).
- **Ważność:** serwer `vizrs` sprawdza sesję w panelu co 15 s – usunięcie konta, zmiana hasła albo wyłączenie przełącznika kończy sesję w Trio najpóźniej po 15 s. Gdy panel nie odpowiada, zalogowane Trio działa dalej.
- **Zgodność:** token serwera `vizrs` działa zawsze; Trio uruchomione samodzielnie (np. dla OBS) nie zależy od panelu; starszy VizRS albo panel bez kont = logowanie tylko tokenem. W stosie CG Playout nakładka `docker-compose.live.yml` ustawia `VIZRS_PANEL_LOGIN=http://live:8090`.
- **Okno VizRS CG Artist (26.11.12) i `vizrs-shell` (26.11.13):** okno połączenia przyjmuje login i hasło, gdy `GET /login/info` serwera zgłasza logowanie kontem panelu; sesję trzyma program (nie strona).

---

## Reguły zmian styku

Wszystkie aplikacje wchodzące w skład pakietu VizRS w bieżących wersjach muszą bezwzględnie działać ze sobą w sposób spójny i niezawodny. Wprowadzanie jakichkolwiek modyfikacji w zdefiniowanych stykach podlega trzem fundamentalnym zasadom pakietu:

- **Styk zmienia się po obu stronach w tym samym cyklu.** Opis styku jest u dostawcy; klient opisuje tylko, jak z niego korzysta.
- **Starsza wersja sąsiada nie psuje aplikacji ani emisji** – brak nowego pola lub ścieżki to „niedostępne w tej wersji”, nie błąd.
- **Wydania razem:** przed wydaniem sprawdź z bieżącymi wersjami sąsiadów; zmianę wymagającą nowszego sąsiada odnotuj w `CHANGELOG.md` z minimalną wersją.

Styki wewnętrzne produktu VizRS CG Playout (Live API sidecara `:7700`, most VizRS Bridge, API panelu `/api/*`, konfiguracja stosu compose) po połączeniu aplikacji (decyzja D1 z dnia 2026-11-15) podlegają wspólnemu, pojedynczemu cyklowi wydawniczemu i są modyfikowane atomowo w ramach jednego commitu.
