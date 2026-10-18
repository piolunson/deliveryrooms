export default function TermsPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "DeliveryRooms";
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-ink/80">
      <h1 className="text-2xl font-extrabold text-ink">Regulamin</h1>
      <p className="mt-4">
        Ten dokument to szkielet do uzupełnienia przed uruchomieniem produkcyjnym —
        opisz w nim zasady korzystania z {appName}: kto może założyć konto, jak
        działają pokoje dostaw, limity miejsca, zasady usuwania wygasłych plików
        oraz odpowiedzialność za treści wrzucane przez twórców.
      </p>
      <h2 className="mt-8 text-lg font-bold text-ink">Konta</h2>
      <p className="mt-2">
        Konta zakłada wyłącznie administrator. Użytkownik odpowiada za
        bezpieczeństwo swojego hasła i za treści, które przesyła klientom.
      </p>
      <h2 className="mt-8 text-lg font-bold text-ink">Dostępność usługi</h2>
      <p className="mt-2">
        Dokładamy starań, by usługa działała nieprzerwanie, ale nie gwarantujemy
        100% dostępności. Pliki po wygaśnięciu pokoju są usuwane zgodnie z opisem
        w Polityce prywatności.
      </p>
    </main>
  );
}
