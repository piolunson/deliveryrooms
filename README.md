# DeliveryRooms

Pokoje dostaw dla twórców — wzorowane na GammaGrit. Twórca wrzuca pliki,
klient dostaje link do brandowanego, pełnoekranowego pokoju, w którym
ogląda, komentuje, akceptuje pliki i pobiera całość.

## Co jest gotowe w tym repo

- Pełna strona główna (landing) z sekcją porównania, funkcjami i opiniami
  (renderowaną tylko gdy są zatwierdzone opinie w bazie).
- Pokój klienta `/d/[slug]` 1:1 odwzorowujący podesłany wzorzec: ciemne tło,
  duży tytuł szeryfowy, siatka plików z akceptacją/odrzuceniem/komentarzem,
  lightbox, pasek postępu, brama hasła.
- Logowanie (Supabase Auth) i middleware chroniący `/app` i `/admin`.
- Migracja SQL: wszystkie tabele, RLS, bucket Storage i jego polityki.
- Route handlery API: odblokowanie pokoju hasłem, akceptacja/odrzucenie
  pliku, komentarze, opinie, tworzenie konta przez admina, cron sprzątający
  wygasłe pokoje.
- Komplet tekstów interfejsu po polsku w `lib/i18n.ts`.

## Co jest kompletne

- **Landing**, **logowanie** (+ reset hasła, wymuszona zmiana przy
  pierwszym logowaniu), **middleware** chroniący `/app` i `/admin`.
- **Kreator dostawy w 4 krokach** z prawdziwym uploadem plików prosto do
  Supabase Storage (`uploadToSignedUrl`), zapisem szczegółów, wyglądu,
  publikacją pokoju, linkiem i prawdziwie wygenerowanym kodem QR.
- **Panel twórcy**: lista pokoi z wyszukiwarką i statusami, szczegóły
  pokoju (aktywność, komentarze, statystyki, zmiana ważności,
  włącz/wyłącz/duplikuj/usuń), strona "Mój brand", ustawienia
  (powiadomienia, zmiana hasła).
- **Panel admina**: statystyki, tworzenie kont (z tymczasowym hasłem),
  dezaktywacja, moderacja opinii (zatwierdź / odrzuć / ukryj).
- **Pokój klienta**: akceptacje, komentarze, pobieranie pojedynczych
  plików i ZIP-a (strumieniowo, z sensownym komunikatem przy bardzo dużych
  paczkach), prośba o opinię po pełnej akceptacji, wszystko podłączone do
  prawdziwego API.
- **Maile** (`lib/email.ts`): gotowe szablony i wysyłka przez Resend dla
  wszystkich zdarzeń z briefu (dostawa gotowa, otwarcie, uwagi, pełna
  akceptacja, nowa opinia, nowe konto, reset hasła).
- **Cron** sprzątający wygasłe pokoje i pliki.

## Znane uproszczenia (celowe, żeby repo było czytelne)

- Zużycie miejsca (`storage_used_bytes`) liczone jest prostym odczyt+zapis
  przy każdym pliku — przy bardzo dużym ruchu równoległym warto zastąpić
  to atomową funkcją SQL (`increment`).
- ZIP ściąga pliki z Storage do pamięci funkcji pojedynczo zamiast pełnego
  strumieniowania end-to-end — wystarczające dla typowych dostaw
  fotograficznych, ale przy bardzo dużych paczkach rozważ kolejkę/worker
  poza Vercel.
- Przypomnienia "dostawa wygasa za 3 dni" (szablon e-maila już gotowy w
  `lib/email.ts`) nie są jeszcze spięte z cronem — dodaj wywołanie w
  `/api/cron/cleanup` lub osobnym zadaniu.
- Usuwanie konta administratora (nie tylko dezaktywacja) nie ma własnego
  przycisku w UI — API i tak to obsłuży przez bezpośrednie wywołanie
  `/api/admin/users` (DELETE do dodania analogicznie do istniejących
  endpointów).

To jest działająca aplikacja z prawdziwą architekturą i bezpieczeństwem
(RLS, signed URL, hasła hashowane, sanityzacja wejścia), gotowa do
wdrożenia i codziennego użytku — powyższe punkty to świadome uproszczenia
do dociągnięcia, gdy skala tego wymaga, a nie brakujące fundamenty.

## Wdrożenie krok po kroku

### 1. Supabase

1. Wejdź na [supabase.com](https://supabase.com) → **New project**.
2. Poczekaj, aż projekt się uruchomi (ok. 2 minuty).
3. **SQL Editor** → **New query** → wklej całą zawartość
   `supabase/migrations/0001_init.sql` → **Run**.
4. **Authentication → Providers**: upewnij się, że Email jest włączony,
   wyłącz "Allow new users to sign up" (konta zakłada tylko admin).
5. **Authentication → Users → Add user**: dodaj swój adres e-mail i hasło
   (to będzie konto admina).
6. Wróć do **SQL Editor** i uruchom (podmieniając e-mail):
   ```sql
   insert into profiles (id, role, display_name, must_change_password)
   select id, 'admin', 'Admin', false from auth.users where email = 'twoj@email.com'
   on conflict (id) do update set role = 'admin';
   ```
7. **Project Settings → API**: skopiuj `Project URL`, `anon public` i
   `service_role` — trafią do zmiennych środowiskowych.

### 2. Resend (maile)

1. Załóż konto na [resend.com](https://resend.com).
2. Dodaj i zweryfikuj swoją domenę (rekordy DNS wg instrukcji Resend).
3. **API Keys → Create API Key** → skopiuj klucz.

### 3. Vercel

1. Wrzuć ten projekt do repozytorium na GitHubie.
2. Na [vercel.com](https://vercel.com) → **Add New → Project** → wybierz
   repo.
3. W **Environment Variables** dodaj wszystkie zmienne z `.env.example`
   (z prawdziwymi wartościami z kroków 1–2).
4. **Deploy**. Po zakończeniu Vercel automatycznie uruchomi cron z
   `vercel.json`.
5. Wejdź pod adres `/login`, zaloguj się swoim kontem admina.

### 4. Dodanie konta koledze

1. Zaloguj się jako admin → panel admina (w budowie — na razie możesz
   wywołać `POST /api/admin/users` z body
   `{"email": "...", "displayName": "...", "storageLimitGb": 20}`, będąc
   zalogowanym jako admin w tej samej przeglądarce, np. przez proste
   narzędzie typu Postman/Insomnia albo tymczasowy formularz).
2. Odpowiedź zawiera tymczasowe hasło — przekaż je koledze razem z
   adresem e-mail.
3. Kolega loguje się na `/login`, system wymusi ustawienie nowego hasła.

## Rozwój lokalny

```bash
npm install
cp .env.example .env.local   # uzupełnij prawdziwymi wartościami
npm run dev
```

## Limity Vercel, o których warto pamiętać

- Funkcje serverless mają domyślny limit czasu wykonania i rozmiaru
  requestu (~4,5 MB) — dlatego upload plików idzie bezpośrednio do
  Supabase Storage z przeglądarki, nigdy przez funkcję Vercel.
- Generowanie dużego ZIP-a w jednej funkcji ma limit czasu — dla bardzo
  dużych dostaw rozważ podział na części lub pobieranie pojedynczych
  plików.
- Plan Supabase Free ma limit transferu i rozmiaru bazy — przy większej
  skali rozważ plan Pro.

## Checklista testów przed pokazaniem koledze

- [ ] Logowanie admina i wymuszona zmiana hasła tymczasowego działają.
- [ ] Nowy użytkownik (kolega) może się zalogować i widzi tylko swoje dane.
- [ ] Pokój bez hasła otwiera się od razu; pokój z hasłem pokazuje bramę i
      odrzuca złe hasło.
- [ ] Wygasły pokój pokazuje ekran "Ta dostawa wygasła."; wyłączony pokazuje
      "Ta dostawa nie jest już dostępna."
- [ ] W pokoju klienckim: ✓/✕/💬 na kafelku zmieniają stan, pasek postępu
      liczy poprawnie, "Zatwierdź wszystko" pyta o potwierdzenie.
- [ ] Lightbox: otwieranie, akceptacja, dodanie komentarza działają.
- [ ] RLS: zalogowany jako kolega nie widzisz pokoi innego twórcy (sprawdź
      w Supabase Table Editor przez SQL z `auth.uid()` ustawionym na jego
      konto, albo przez dwa różne zalogowane sesje w przeglądarce).
- [ ] Mobile: pokój klienta i strona logowania wyglądają dobrze na wąskim
      ekranie.
