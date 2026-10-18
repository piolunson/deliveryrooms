// Wszystkie teksty interfejsu w jednym miejscu.
// {APP_NAME} jest podmieniane w czasie renderowania na NEXT_PUBLIC_APP_NAME.

export const pl = {
  landing: {
    nav: {
      features: "Funkcje",
      reviews: "Opinie",
      signIn: "Zaloguj się",
      requestAccess: "Poproś o dostęp →",
    },
    hero: {
      title: "Każda dostawa, dokładnie w Twoim stylu.",
      subtitle:
        "{APP_NAME} zamienia folder surowych plików w pokój dostawy, który wygląda, jakbyś zrobił go sam – bo tak jest. Bez cudzego logo, bez zwykłego dysku, bez tłumaczenia, czym jest „udostępniony folder”.",
      ctaPrimary: "Utwórz pokój →",
      ctaSecondary: "Zaloguj się",
      chips: ["Przestrzeń na pliki", "Pokoje dostaw", "Portfolio", "Akceptacje"],
    },
    compare: {
      heading: "Link, który wysyłasz, to pierwsza rzecz, którą ocenia klient",
      leftLabel: "ZWYKŁY DYSK W CHMURZE",
      rightLabel: "TWÓJ POKÓJ DOSTAWY",
      cons: [
        "Folder z wierszami i miniaturkami, jak u każdego",
        "Ich logo i ich kolory na Twojej pracy",
        "Uwagi i akceptacje rozsypane po wiadomościach i mailach",
      ],
      pros: [
        "Pełnoekranowa prezentacja na tle, które sam wybierasz",
        "Twoje imię na pokoju, dostarczone przez Ciebie",
        "Akceptuj lub zgłaszaj poprawki do każdego pliku – prosto w pokoju",
      ],
    },
    features: [
      {
        title: "Twój brand",
        desc: "Własne tło, logo, kolory i krój pisma. Klient widzi Ciebie, nie narzędzie.",
      },
      {
        title: "Akceptacje przy każdym pliku",
        desc: "Zatwierdzaj, zgłaszaj poprawki i komentuj bez wymiany dziesiątek maili.",
      },
      {
        title: "Duże pliki, prosty upload",
        desc: "Wrzucaj setki zdjęć i wideo. Przerwane wysyłanie wznowi się samo.",
      },
      {
        title: "Jeden link",
        desc: "Wyślij link lub kod QR. Klient nie musi zakładać konta.",
      },
    ],
    reviewsLabel: "OPINIE KLIENTÓW",
    ctaEnd: {
      heading: "Następna dostawa może wyglądać zupełnie inaczej.",
      button: "Utwórz pierwszy pokój",
    },
    footer: {
      copyright: "© {year} {APP_NAME}. Zrobione dla twórców.",
      privacy: "Polityka prywatności",
      terms: "Regulamin",
    },
    requestForm: {
      title: "Poproś o dostęp",
      subtitle: "Zostaw adres e-mail, a odezwiemy się z danymi do logowania.",
      email: "Adres e-mail",
      submit: "Wyślij prośbę",
      success: "Dzięki! Odezwiemy się wkrótce.",
    },
  },

  auth: {
    login: {
      title: "Witaj z powrotem",
      subtitle: "Zaloguj się, aby wysyłać dostawy swoim klientom.",
      email: "Adres e-mail",
      password: "Hasło",
      submit: "Zaloguj się",
      forgot: "Nie pamiętasz hasła?",
      error: "Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.",
      noAccount: "Nie masz konta? Skontaktuj się z administratorem.",
    },
    reset: {
      title: "Zresetuj hasło",
      subtitle: "Podaj adres e-mail, a wyślemy link do zmiany hasła.",
      submit: "Wyślij link",
      success: "Jeśli konto istnieje, wysłaliśmy wiadomość z linkiem.",
    },
    firstLogin: {
      title: "Ustaw własne hasło",
      subtitle:
        "Na start dostałeś hasło tymczasowe. Wybierz nowe, aby dokończyć konfigurację.",
      newPassword: "Nowe hasło",
      repeatPassword: "Powtórz hasło",
      submit: "Zapisz i przejdź dalej",
      errorTooShort: "Hasło musi mieć co najmniej 10 znaków.",
    },
    signOut: "Wyloguj się",
  },

  dashboard: {
    nav: { rooms: "Pokoje", brand: "Mój brand", settings: "Ustawienia" },
    heading: "Twoje pokoje dostaw",
    newRoom: "+ Nowa dostawa",
    search: "Szukaj po tytule lub kliencie",
    empty: {
      title: "Nie masz jeszcze żadnych pokoi.",
      subtitle:
        "Wrzuć pliki, wybierz wygląd i wyślij link – klient zobaczy wszystko jak na własnej stronie.",
      cta: "Utwórz pierwszy pokój",
    },
    status: {
      draft: "Szkic",
      active: "Aktywny",
      expired: "Wygasł",
      disabled: "Wyłączony",
      opened: "Otwarty",
      pending: "Oczekuje",
      changesRequested: "Do poprawki",
      approved: "Zaakceptowany",
    },
  },

  wizard: {
    steps: ["Pliki", "Szczegóły", "Wygląd", "Gotowe"],
    step1: {
      title: "Dodaj pliki",
      dropzone: "Przeciągnij tutaj pliki lub foldery albo kliknij, aby wybrać.",
      limit: "Do 5 GB na plik.",
      uploading: "Wysyłanie… {n}%",
      dontClose: "Nie zamykaj tej karty, dopóki wysyłanie się nie zakończy.",
      chooseCover: "Wybierz okładkę",
      noSpace: "Brakuje miejsca na koncie. Skontaktuj się z administratorem.",
    },
    step2: {
      title: "Szczegóły dostawy",
      deliveryTitle: "Tytuł dostawy",
      deliveryTitlePlaceholder: "np. Sesja AMG GTR – czerwiec",
      clientName: "Dla kogo?",
      clientNamePlaceholder: "Imię lub nazwa klienta",
      clientEmail: "E-mail klienta (opcjonalnie)",
      coCreators: "Dostarczone przez (do 3 osób)",
      message: "Wiadomość dla klienta",
      messagePlaceholder:
        "Cześć! Tu są Twoje pliki. Zaakceptuj je lub daj znać, co poprawić.",
      expiry: "Link ważny przez",
      password: "Zabezpiecz hasłem (opcjonalnie)",
      allowZip: "Pozwól pobrać wszystko jako ZIP",
      allowSingleDownload: "Pozwól pobierać pojedyncze pliki",
      hideBranding: "Ukryj „Obsługiwane przez {APP_NAME}”",
    },
    step3: {
      title: "Wygląd pokoju",
      background: "Tło",
      logo: "Logo",
      accentColor: "Kolor akcentu",
      font: "Krój pisma",
      theme: "Motyw jasny/ciemny",
      layout: "Układ: siatka / mozaika",
      saveDefault: "Zapisz jako mój domyślny styl",
      previewDesktop: "Komputer",
      previewMobile: "Telefon",
    },
    step4: {
      title: "Pokój gotowy 🎉",
      subtitle: "Skopiuj link i wyślij go klientowi.",
      copyLink: "Kopiuj link",
      sendEmail: "Wyślij mailem",
      showQr: "Pokaż kod QR",
      createAnother: "Utwórz kolejną dostawę",
    },
    toasts: {
      linkCopied: "Link skopiowany.",
      emailSent: "Wiadomość wysłana do {email}.",
      saved: "Dostawa została zapisana.",
      changesSaved: "Zmiany zapisane.",
    },
    errors: {
      uploadFailed: "Nie udało się wysłać pliku {name}. Spróbuj ponownie.",
      noFiles: "Dodaj co najmniej jeden plik.",
      noTitle: "Podaj tytuł dostawy.",
      generic: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
    },
  },

  roomDetails: {
    tabs: { activity: "Aktywność", comments: "Komentarze", stats: "Statystyki" },
    opened: "Otwarty {date}",
    downloadedTimes: "Pobrano {n} razy",
    notOpenedYet: "Jeszcze nie otwarty",
    approvedCount: "{client} zaakceptował(a) {n} z {m} plików",
    newComment: "Nowy komentarz od {client}",
    reply: "Odpowiedz",
    replaceFile: "Podmień plik",
    actions: {
      changeExpiry: "Zmień termin ważności",
      disableLink: "Wyłącz link",
      enableLink: "Włącz link",
      duplicate: "Duplikuj",
      deleteRoom: "Usuń dostawę",
    },
    deleteConfirm: {
      title:
        "Na pewno usunąć ten pokój? Klient straci dostęp do plików, a tej operacji nie można cofnąć.",
      confirm: "Usuń",
      cancel: "Anuluj",
    },
  },

  brand: {
    heading: "Mój brand",
    subtitle: "Ustaw wygląd, który będzie domyślny dla nowych pokoi.",
  },

  settings: {
    emailNotifications: "Powiadomienia e-mail",
    onOpen: "Gdy klient otworzy dostawę",
    onCommentOrChanges: "Gdy klient skomentuje lub zgłosi poprawki",
    onApproveAll: "Gdy klient zaakceptuje wszystko",
    onNewTestimonial: "Gdy pojawi się nowa opinia",
    digest: "Grupuj powiadomienia w dzienne podsumowanie",
    changePassword: "Zmień hasło",
  },

  room: {
    topbar: { label: "POKÓJ DOSTAW", poweredBy: "Obsługiwane przez {APP_NAME}" },
    hero: {
      preparedFor: "Przygotowane dla {client}",
      deliveredBy: "Dostarczone przez {creators}",
      downloadAll: "Pobierz wszystkie pliki ({n})",
    },
    filesHeading: "Materiały",
    tileTooltips: {
      requestChanges: "Poproś o zmiany",
      approve: "Akceptuję",
      comment: "Komentarz",
    },
    ribbonTooltips: {
      pending: "Oczekuje na Twoją decyzję",
      approved: "Zaakceptowane",
      changesRequested: "Do poprawki",
    },
    progress: {
      label: "{n} z {m} zaakceptowanych",
      approveAll: "Zatwierdź wszystko",
      approveAllConfirm:
        "Zatwierdzić wszystkie pliki? Możesz jeszcze zmienić decyzję przy pojedynczych zdjęciach.",
    },
    comments: {
      placeholder: "Dodaj komentarz do tego zdjęcia…",
      send: "Wyślij",
      askName: "Jak masz na imię?",
      empty: "Jeszcze brak komentarzy.",
    },
    toasts: {
      creatorNotified: "Dzięki! {creator} dostał informację.",
      changesRequested: "Zgłoszono prośbę o zmiany.",
      fileApproved: "Plik zaakceptowany.",
    },
    password: {
      protected: "Ten pokój jest chroniony hasłem.",
      placeholder: "Wpisz hasło",
      submit: "Odblokuj",
      error: "Nieprawidłowe hasło.",
    },
    expired: {
      title: "Ta dostawa wygasła.",
      subtitle: "Poproś nadawcę o nowy link.",
    },
    disabled: { title: "Ta dostawa nie jest już dostępna." },
    zip: {
      preparing: "Przygotowujemy paczkę…",
      split: "Paczka jest duża, dlatego podzieliliśmy ją na {n} części.",
    },
    footer: "Bezpieczne przesyłanie plików",
    cookies: {
      text:
        "Używamy tylko niezbędnych plików cookie do zapamiętania Twojego imienia i dostępu do pokoju. Bez reklam i śledzenia.",
      accept: "Rozumiem",
    },
  },

  testimonial: {
    heading: "Jak Ci się podobała ta dostawa?",
    subtitle: "Twoja opinia pomoże twórcy i innym klientom.",
    name: "Imię",
    role: "Rola (opcjonalnie)",
    body: "Twoja opinia",
    consent: "Zgadzam się na publikację mojej opinii na stronie głównej.",
    submit: "Wyślij opinię",
    skip: "Pomiń",
    success: "Dziękujemy! Opinia trafi do zatwierdzenia.",
  },

  admin: {
    users: {
      heading: "Użytkownicy",
      add: "+ Dodaj użytkownika",
      name: "Imię",
      email: "E-mail",
      storageLimit: "Limit miejsca (GB)",
      generatePassword: "Wygeneruj hasło tymczasowe",
      sendByEmail: "Wyślij dane mailem",
      resetPassword: "Zresetuj hasło",
      deactivate: "Dezaktywuj konto",
      delete: "Usuń konto",
      created: "Konto utworzone. Przekaż użytkownikowi dane logowania: {email} / {password}.",
    },
    testimonials: {
      heading: "Opinie do zatwierdzenia",
      approve: "Zatwierdź",
      reject: "Odrzuć",
      hide: "Ukryj",
      empty: "Brak opinii do moderacji.",
    },
  },

  system: {
    notFound: {
      title: "Nie znaleziono strony",
      subtitle: "Ten link nie prowadzi do żadnej dostawy.",
      cta: "Wróć na stronę główną",
    },
    error: {
      title: "Coś poszło nie tak",
      subtitle: "Pracujemy nad tym. Odśwież stronę lub spróbuj za chwilę.",
      cta: "Odśwież",
    },
    offline: "Brak połączenia z internetem. Wysyłanie wznowi się automatycznie po powrocie sieci.",
  },
} as const;

export function t(path: string, vars: Record<string, string | number> = {}): string {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = pl;
  for (const p of parts) node = node?.[p];
  if (typeof node !== "string") return path;
  return node.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
