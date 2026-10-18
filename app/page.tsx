import Link from "next/link";
import { ArrowRight, Box, Send, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { createServerSupabase } from "@/lib/supabase/server";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "DeliveryRooms";

function withApp(s: string) {
  return s.replaceAll("{APP_NAME}", APP_NAME);
}

async function getApprovedTestimonials() {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("public_testimonials")
    .select("*")
    .limit(4);
  return data ?? [];
}

export default async function LandingPage() {
  const testimonials = await getApprovedTestimonials();
  const [featured, ...rest] = testimonials;

  return (
    <main>
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
              <Box size={16} />
            </span>
            <span className="font-light text-ink">{APP_NAME.split(/(?=[A-Z])/)[0]}</span>
            <span className="text-accent">{APP_NAME.split(/(?=[A-Z])/).slice(1).join("")}</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
            <a href="#funkcje">{t("landing.nav.features")}</a>
            <a href="#opinie">{t("landing.nav.reviews")}</a>
            <Link href="/login">{t("landing.nav.signIn")}</Link>
          </nav>
          <Link
            href="#dostep"
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(47,111,235,0.6)] transition hover:bg-accent-dark"
          >
            {t("landing.nav.requestAccess")}
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-28 pt-24">
        <div className="constellation-bg pointer-events-none absolute inset-0 -z-10 motion-safe:animate-drift" />
        <div className="pointer-events-none absolute left-1/2 top-[55%] -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

        {/* floating chips */}
        <Chip className="left-[6%] top-10 hidden md:block" icon={<ImageIcon size={14} />} delay="0s">
          Przestrzeń na pliki
        </Chip>
        <Chip className="right-[4%] top-16 hidden md:block" icon={<Box size={14} />} delay="1.2s">
          Storage
        </Chip>
        <Chip className="bottom-24 left-[4%] hidden md:block" icon={<Send size={14} />} delay="0.6s">
          Delivery Rooms
        </Chip>
        <Chip className="bottom-16 right-[8%] hidden md:block" icon={<CheckCircle2 size={14} />} delay="1.8s">
          Portfolios
        </Chip>

        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-ink md:text-7xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-ink/60 md:text-lg">
            {withApp(t("landing.hero.subtitle"))}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(47,111,235,0.7)] transition hover:bg-accent-dark"
            >
              {t("landing.hero.ctaPrimary")} <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-black/[0.03]"
            >
              {t("landing.hero.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section id="funkcje" className="px-6 py-20">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          {t("landing.compare.heading")}
        </h2>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2">
          {/* left: generic drive mock */}
          <div>
            <span className="inline-block rounded-full bg-black/5 px-3 py-1 text-xs font-semibold tracking-wide text-ink/60">
              {t("landing.compare.leftLabel")}
            </span>
            <div className="mt-4 rounded-card border border-black/10 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center gap-2 border-b border-black/5 pb-2">
                <div className="h-5 w-5 rounded bg-ink/10" />
                <div className="h-2 w-20 rounded bg-ink/10" />
                <div className="ml-auto h-5 w-5 rounded-full bg-ink/10" />
              </div>
              {["Project Assets", "Brand Guidelines.pdf", "Q2 Budget.xlsx", "Campaign Video.mp4"].map(
                (row) => (
                  <div
                    key={row}
                    className="flex items-center gap-3 border-b border-black/5 py-2 text-xs text-ink/50 last:border-0"
                  >
                    <div className="h-4 w-4 rounded bg-ink/10" />
                    <span className="flex-1 truncate">{row}</span>
                    <span>2,1 MB</span>
                  </div>
                )
              )}
            </div>
            <ul className="mt-5 space-y-3 border-t border-black/5 pt-4 text-sm text-ink/60">
              {[
                "Folder z wierszami i miniaturkami, jak u każdego",
                "Ich logo i ich kolory na Twojej pracy",
                "Uwagi i akceptacje rozsypane po wiadomościach i mailach",
              ].map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <span className="mt-0.5 text-ink/30">✕</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* right: delivery room mock */}
          <div>
            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wide text-accent">
              {t("landing.compare.rightLabel")}
            </span>
            <div className="aurora-amber mt-4 overflow-hidden rounded-card p-5 shadow-lg">
              <div className="text-serif font-serif text-2xl font-bold uppercase leading-tight text-white">
                AMG
                <br />
                GTR
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[4px] bg-white/10 backdrop-blur-sm"
                  />
                ))}
              </div>
            </div>
            <ul className="mt-5 space-y-3 border-t border-black/5 pt-4 text-sm text-ink/70">
              {[
                "Pełnoekranowa prezentacja na tle, które sam wybierasz",
                "Twoje imię na pokoju, dostarczone przez Ciebie",
                "Akceptuj lub zgłaszaj poprawki do każdego pliku – prosto w pokoju",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Twój brand", desc: "Własne tło, logo, kolory i krój pisma. Klient widzi Ciebie, nie narzędzie." },
            { title: "Akceptacje przy każdym pliku", desc: "Zatwierdzaj, zgłaszaj poprawki i komentuj bez wymiany dziesiątek maili." },
            { title: "Duże pliki, prosty upload", desc: "Wrzucaj setki zdjęć i wideo. Przerwane wysyłanie wznowi się samo." },
            { title: "Jeden link", desc: "Wyślij link lub kod QR. Klient nie musi zakładać konta." },
          ].map((f) => (
            <div key={f.title} className="rounded-card border border-black/5 p-5">
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — renders only if there is approved, consented content */}
      {featured && (
        <section id="opinie" className="px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold tracking-[0.2em] text-ink/40">
              {t("landing.reviewsLabel")}
            </span>
            <div className="mt-3 flex justify-center gap-1 text-star">
              {"★★★★★"}
            </div>
            <p className="mt-6 text-2xl font-bold leading-snug text-ink md:text-4xl">
              &ldquo;{featured.body}&rdquo;
            </p>
            <p className="mt-4 text-sm">
              <span className="font-semibold uppercase tracking-wide">
                {featured.author_name}
              </span>
              {featured.author_role && (
                <span className="text-ink/50"> — {featured.author_role}</span>
              )}
            </p>
          </div>

          {rest.length > 0 && (
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 border-t border-black/5 pt-12 sm:grid-cols-3">
              {rest.slice(0, 3).map((r) => (
                <div key={r.id}>
                  <div className="flex gap-0.5 text-star text-sm">{"★★★★★".slice(0, r.rating)}</div>
                  <p className="mt-3 text-sm text-ink/70">&ldquo;{r.body}&rdquo;</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink/80">
                    {r.author_name}
                    {r.author_role && (
                      <span className="font-normal normal-case text-ink/40"> — {r.author_role}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CTA END */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-card bg-ink px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-extrabold md:text-4xl">
            {t("landing.ctaEnd.heading")}
          </h2>
          <Link
            href="/login"
            id="dostep"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {t("landing.ctaEnd.button")} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 px-6 py-10 text-center text-sm text-ink/50">
        <p>{withApp(t("landing.footer.copyright")).replace("{year}", String(new Date().getFullYear()))}</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/polityka-prywatnosci">{t("landing.footer.privacy")}</Link>
          <Link href="/regulamin">{t("landing.footer.terms")}</Link>
        </div>
      </footer>
    </main>
  );
}

function Chip({
  children,
  icon,
  className = "",
  delay = "0s",
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute z-10 flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-medium text-ink/70 shadow-md motion-safe:animate-float ${className}`}
      style={{ animationDelay: delay }}
    >
      <span className="text-accent">{icon}</span>
      {children}
    </div>
  );
}
