export default function PrivacyPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "DeliveryRooms";
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-ink/80">
      <h1 className="text-2xl font-extrabold text-ink">Polityka prywatności</h1>
      <p className="mt-4">
        Ten dokument to szkielet do uzupełnienia przed uruchomieniem produkcyjnym —
        podmień go na pełną politykę zgodną z RODO, dopasowaną do tego, jakie dane
        faktycznie przetwarza {appName} (adresy e-mail twórców i klientów, pliki
        dostaw, logi otwarć/pobrań).
      </p>
      <h2 className="mt-8 text-lg font-bold text-ink">Jakie dane przetwarzamy</h2>
      <p className="mt-2">
        Konta twórców (imię, e-mail), dane dostaw (tytuł, imię i e-mail klienta,
        przesłane pliki), komentarze i opinie zostawione przez klientów oraz
        skrócone logi techniczne (czas otwarcia/pobrania, skrócony adres IP).
      </p>
      <h2 className="mt-8 text-lg font-bold text-ink">Pliki cookie</h2>
      <p className="mt-2">
        Używamy wyłącznie niezbędnych plików cookie: sesji logowania twórcy oraz
        zapamiętania dostępu do pojedynczego pokoju dostawy. Żadnych cookie
        reklamowych ani śledzących.
      </p>
      <h2 className="mt-8 text-lg font-bold text-ink">Usunięcie danych</h2>
      <p className="mt-2">
        Aby poprosić o usunięcie swoich danych (np. jako klient, który otrzymał
        dostawę), napisz na adres administratora podany w stopce.
      </p>
    </main>
  );
}
