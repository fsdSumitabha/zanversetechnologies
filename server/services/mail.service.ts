import nodemailer, { type Transporter } from "nodemailer";
import { office, site } from "@/constants/zan";
import { brandPalette as palette } from "@/lib/brand";
import type { Lead } from "@/lib/leads";
import { getMailEnv } from "../config/env";

/* ═══════════════════════════════════════════════════════════════════════════
   LEAD MAIL
   Two mails for every enquiry, both from the SMTP account.

   THE TEAM'S carries everything the visitor sent. Its Reply-To is the visitor,
   so pressing Reply answers them and not the sales mailbox.

   THE VISITOR'S is fixed text on purpose. Anyone can type someone else's address
   into a public form, so this mail goes to an address nobody has proved they
   own. If it repeated the message, anyone could send any words to anyone from
   the company's own account. It carries a greeting and nothing else that was
   typed, and the greeting is only used if it reads as a name.

   FROM is always SMTP_USER. Gmail rewrites any other From to the signed-in
   account, and the mismatch is what spam filters look for.
   ═══════════════════════════════════════════════════════════════════════════ */

let transporter: Transporter | null = null;

/** Built on first use: a build-time import of the route must not need a password. */
function transport(): Transporter {
  if (transporter) return transporter;
  const env = getMailEnv();
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    // On any other port the connection starts plain: refuse to send if it cannot upgrade.
    requireTLS: true,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    // Nodemailer waits minutes by default. The visitor is watching a spinner, and
    // the host ends the function long before that.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** Everything but `body` is the company's own text, so `body` does the escaping. */
function page(body: string): string {
  const logoHeight = 40;
  const logoWidth = Math.round((logoHeight * site.logo.width) / site.logo.height);
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px 16px;background:${palette.bg};color:${palette.ink};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6">
  <div style="max-width:560px;margin:0 auto">
    <div style="padding-bottom:16px;border-bottom:3px solid ${palette.brand}">
      <img src="${site.url}${site.logo.png}" alt="${site.name}" width="${logoWidth}" height="${logoHeight}" style="display:block">
    </div>
    ${body}
  </div>
</body>
</html>`;
}

/** The team's mail. Throws if it did not go: the caller tells the visitor. */
export async function sendLeadNotification(lead: Lead): Promise<void> {
  const env = getMailEnv();
  const fields: [label: string, value: string | undefined][] = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Service", lead.service],
    ["Interested in", lead.interest],
    ["Source", lead.source],
    ["Page", lead.page],
  ];
  const rows = fields.filter((row): row is [string, string] => Boolean(row[1]));
  const details = lead.message || "No project details given.";

  await transport().sendMail({
    from: { name: site.name, address: env.SMTP_USER },
    to: env.MAIL_TO || site.email,
    replyTo: { name: lead.name, address: lead.email },
    subject: `New lead: ${lead.service} from ${lead.name}`,
    text: [...rows.map(([label, value]) => `${label}: ${value}`), "", "Project details:", details].join("\n"),
    html: page(`
    <h1 style="margin:20px 0 16px;font-size:20px;line-height:1.3">New lead</h1>
    <table role="presentation" style="width:100%;border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) => `<tr>
        <td style="padding:8px 12px 8px 0;border-bottom:1px solid ${palette.line};font-weight:700;vertical-align:top;white-space:nowrap">${label}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${palette.line};word-break:break-word">${escapeHtml(value)}</td>
      </tr>`,
        )
        .join("\n      ")}
    </table>
    <h2 style="margin:24px 0 8px;font-size:15px">Project details</h2>
    <p style="margin:0;white-space:pre-wrap;word-break:break-word">${escapeHtml(details)}</p>
    <p style="margin:24px 0 0;font-size:13px">Reply to this email to answer ${escapeHtml(lead.name)} directly.</p>`),
  });
}

/**
 * The name to greet, or nothing. No digits, and no dot followed by a letter, so
 * neither a phone number nor a web address can ride into someone's inbox as a
 * name. "Mary-Jane O'Neil" and "J. Smith" pass.
 */
function greetingName(name: string): string {
  return /^[\p{L}\p{M}' .-]{1,40}$/u.test(name) && !/\.\p{L}/u.test(name) ? name : "";
}

/** The visitor's mail. Fixed text: see the note at the top of this file. */
export async function sendLeadConfirmation(lead: Lead): Promise<void> {
  const env = getMailEnv();
  const name = greetingName(lead.name);
  const host = new URL(site.url).host;
  const address = office.addressLines.join(", ");
  const paragraphs = [
    `Thank you for writing to ${site.name}. Your enquiry is with our team, and someone will come back to you within 24 hours.`,
    `If it cannot wait, call us or message us on WhatsApp at ${office.phoneDisplay}.`,
    "To add anything, reply to this email.",
  ];
  const notYou = `You received this because this address was entered on the enquiry form at ${host}. If that was not you, you can ignore this message.`;

  await transport().sendMail({
    from: { name: site.name, address: env.SMTP_USER },
    to: lead.email,
    replyTo: env.MAIL_TO || site.email,
    subject: "We received your enquiry",
    // Stops an out-of-office reply answering this mail, and the two answering each other.
    headers: { "Auto-Submitted": "auto-generated" },
    text: [
      name ? `Hello ${name},` : "Hello,",
      ...paragraphs,
      `${site.name}\n${address}, ${office.city}\n${site.email}`,
      notYou,
    ].join("\n\n"),
    html: page(`
    <p style="margin:20px 0 12px">${name ? `Hello ${escapeHtml(name)},` : "Hello,"}</p>
    ${paragraphs.map((p) => `<p style="margin:0 0 12px">${p}</p>`).join("\n    ")}
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${palette.line};font-size:13px">
      <strong>${site.name}</strong><br>
      ${address}, ${office.city}<br>
      <a href="mailto:${site.email}" style="color:${palette.brandInk}">${site.email}</a>
    </p>
    <p style="margin:12px 0 0;font-size:12px">${notYou}</p>`),
  });
}
