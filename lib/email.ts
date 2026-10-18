import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "DeliveryRooms <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY nieustawiony — pomijam wysyłkę maila:", opts.subject);
    return { skipped: true };
  }
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "DeliveryRooms";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const ACCENT = "#2F6FEB";

function emailShell(bodyHtml: string, buttonLabel?: string, buttonUrl?: string) {
  return `<!doctype html>
<html lang="pl">
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:${ACCENT};padding:20px 32px;color:#ffffff;font-weight:800;font-size:18px;">
          ${APP_NAME}
        </td></tr>
        <tr><td style="padding:32px;color:#1A1A1A;font-size:15px;line-height:1.6;">
          ${bodyHtml}
          ${
            buttonLabel && buttonUrl
              ? `<div style="margin-top:28px;"><a href="${buttonUrl}" style="background:${ACCENT};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;display:inline-block;">${buttonLabel}</a></div>`
              : ""
          }
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const emailTemplates = {
  deliveryReady(opts: {
    to: string;
    clientName: string;
    creatorName: string;
    title: string;
    message?: string;
    expiresAt?: string;
    roomUrl: string;
  }) {
    const subject = `${opts.creatorName} przesłał Ci pliki: ${opts.title}`;
    const text = `Cześć ${opts.clientName}! ${opts.creatorName} przygotował dla Ciebie dostawę „${opts.title}”. ${
      opts.message ?? ""
    } Link: ${opts.roomUrl}`;
    const html = emailShell(
      `<p>Cześć ${opts.clientName}!</p>
       <p>${opts.creatorName} przygotował dla Ciebie dostawę <strong>„${opts.title}”</strong>.</p>
       ${opts.message ? `<p style="color:#555;">${opts.message}</p>` : ""}
       ${opts.expiresAt ? `<p style="color:#888;font-size:13px;">Link jest ważny do ${opts.expiresAt}.</p>` : ""}`,
      "Otwórz dostawę",
      opts.roomUrl
    );
    return { subject, html, text };
  },

  roomOpened(opts: { to: string; title: string; when: string; activityUrl: string }) {
    const subject = `${opts.title ? "" : ""}Klient otworzył Twoją dostawę`;
    const text = `Dostawa „${opts.title}” została właśnie otwarta (${opts.when}).`;
    const html = emailShell(
      `<p>Dostawa <strong>„${opts.title}”</strong> została właśnie otwarta (${opts.when}).</p>`,
      "Zobacz aktywność",
      opts.activityUrl
    );
    return { subject, html, text };
  },

  changesRequested(opts: { to: string; title: string; count: number; roomUrl: string }) {
    const subject = `Klient zostawił uwagi: ${opts.title}`;
    const text = `${opts.count} plików czeka na poprawki w dostawie „${opts.title}”.`;
    const html = emailShell(
      `<p><strong>${opts.count}</strong> plików czeka na poprawki w dostawie <strong>„${opts.title}”</strong>.</p>`,
      "Zobacz komentarze",
      opts.roomUrl
    );
    return { subject, html, text };
  },

  fullyApproved(opts: { to: string; clientName: string; title: string; roomUrl: string }) {
    const subject = "Dostawa zaakceptowana 🎉";
    const text = `${opts.clientName} zaakceptował wszystkie pliki w „${opts.title}”.`;
    const html = emailShell(
      `<p>🎉 <strong>${opts.clientName}</strong> zaakceptował wszystkie pliki w <strong>„${opts.title}”</strong>.</p>`,
      "Zobacz pokój",
      opts.roomUrl
    );
    return { subject, html, text };
  },

  newTestimonial(opts: { to: string; clientName: string; title: string; rating: number; body: string }) {
    const subject = `Nowa opinia od ${opts.clientName}`;
    const text = `${opts.clientName} ocenił dostawę „${opts.title}” na ${opts.rating}/5: ${opts.body}`;
    const html = emailShell(
      `<p><strong>${opts.clientName}</strong> ocenił dostawę <strong>„${opts.title}”</strong> na ${opts.rating}/5.</p>
       <p style="color:#555;font-style:italic;">„${opts.body}”</p>
       <p style="color:#888;font-size:13px;">Publikacja na stronie głównej wymaga zatwierdzenia przez administratora.</p>`
    );
    return { subject, html, text };
  },

  accountCreated(opts: { to: string; displayName: string }) {
    const subject = `Twoje konto w ${APP_NAME}`;
    const text = `Cześć ${opts.displayName}! Administrator utworzył dla Ciebie konto. Zaloguj się i ustaw własne hasło.`;
    const html = emailShell(
      `<p>Cześć ${opts.displayName}!</p>
       <p>Administrator utworzył dla Ciebie konto. Zaloguj się i ustaw własne hasło.</p>`,
      "Zaloguj się",
      `${SITE_URL}/login`
    );
    return { subject, html, text };
  },

  passwordReset(opts: { to: string; resetUrl: string }) {
    const subject = `Zmień hasło w ${APP_NAME}`;
    const text = `Kliknij link, aby ustawić nowe hasło (ważny 1 godzinę): ${opts.resetUrl}`;
    const html = emailShell(
      `<p>Kliknij przycisk, aby ustawić nowe hasło. Link jest ważny 1 godzinę.</p>`,
      "Ustaw nowe hasło",
      opts.resetUrl
    );
    return { subject, html, text };
  },

  expiringSoon(opts: { to: string; title: string; daysLeft: number; roomUrl: string }) {
    const subject = `Dostawa „${opts.title}” wygasa za ${opts.daysLeft} dni`;
    const text = subject;
    const html = emailShell(
      `<p>Dostawa <strong>„${opts.title}”</strong> wygasa za ${opts.daysLeft} dni.</p>`,
      "Zobacz pokój",
      opts.roomUrl
    );
    return { subject, html, text };
  },
};
