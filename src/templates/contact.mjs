import { esc, copy, pageTitle, clampDescription } from "../lib.mjs";

// Every route this site advertises has to resolve to something real.
//
// Until 27 August the header, the author band and the about page all offered
// to book a call, and all three linked to the email capture form. A button
// that does not do what it says is the exact failure this site was built to
// argue against, and it was on every page of it.
//
// The fix is not better copy. It is that a route is rendered only when it is
// configured, and the label is derived from the configuration rather than
// typed next to it. Fill in content/site.json and the routes appear
// everywhere at once. Leave a field empty and nothing anywhere claims it.

const cfg = (site) => site.contact || {};

export function bookingUrl(site) {
  const b = (cfg(site).booking || "").trim();
  // A prefix test is not a URL test: "https://" passes it and resolves
  // nowhere. Parse it, and insist on https and a host with a dot in it.
  try {
    const u = new URL(b);
    return u.protocol === "https:" && /\./.test(u.hostname) ? b : "";
  } catch {
    return "";
  }
}

export function emailUrl(site) {
  const e = (cfg(site).email || "").trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? `mailto:${e}` : "";
}

export function whatsappUrl(site) {
  // Stored as digits, rendered as a wa.me link, so the file cannot hold a
  // half-written URL that looks configured and resolves nowhere.
  const digits = String(cfg(site).whatsapp || "").replace(/[^0-9]/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : "";
}

// The slot that used to say "Book a call" unconditionally. It now says what
// is true: the booking label only where there is something to book.
export function primaryCta(site) {
  const b = bookingUrl(site);
  return b
    ? { label: "Book a call", href: b, external: true }
    : { label: "Get in touch", href: "/contact/", external: false };
}

export function routes(site) {
  const a = site.author || {};
  const out = [];
  const b = bookingUrl(site);
  if (b)
    out.push({
      key: "booking",
      label: "Book a call",
      href: b,
      external: true,
      note: "A slot in the diary, with no obligation attached to it.",
    });
  const e = emailUrl(site);
  if (e)
    out.push({
      key: "email",
      label: cfg(site).email.trim(),
      href: e,
      external: false,
      note: "Best for anything with a document attached, and for corrections.",
    });
  const w = whatsappUrl(site);
  if (w)
    out.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: w,
      external: true,
      note: "Quickest for a short question. Gulf hours.",
    });
  if (a.linkedin)
    out.push({
      key: "linkedin",
      label: "LinkedIn",
      href: a.linkedin,
      external: true,
      note: "Public, and the easiest way to check who you are talking to before you talk to them.",
    });
  return out;
}

export function contactPage({ site }) {
  const a = site.author || {};
  const rs = routes(site);
  const hours = Number(cfg(site).responseHours) || 48;
  const hasDirect = rs.some((r) => r.key === "email" || r.key === "whatsapp" || r.key === "booking");

  const list = `<div class="pth__terms" style="margin:0 0 10px">${rs
    .map(
      (r) =>
        `<a class="pth__term" href="${esc(r.href)}"${r.external ? ' rel="noopener"' : ""}>${esc(r.label)}</a>`
    )
    .join("")}</div>
  <dl class="cx">${rs
    .map((r) => `<dt>${esc(r.label)}</dt><dd>${esc(copy(r.note))}</dd>`)
    .join("")}</dl>`;

  // With no direct route configured, the page says so rather than implying
  // one. Publishing "we would love to hear from you" over a dead end is the
  // thing being fixed here, not a smaller version of it.
  const thin = hasDirect
    ? `<p>Anything below reaches the same person. Expect a reply inside ${hours} hours on a working day, and a slower one over a UAE weekend.</p>`
    : `<p>There is no direct line published here yet, and rather than print an address that bounces, this page lists only what genuinely works today. LinkedIn reaches ${esc(
        a.name || "the author"
      )} directly, and the Playbook form starts an email thread that a person reads.</p>`;

  const body = `<section class="band"><div class="wrap">
  <div class="section-head rise" style="margin-bottom:30px">
    <p class="eyebrow">Contact</p>
    <h1>Reaching the desk</h1>
    <p>Corrections, questions about how a figure was sourced, or a conversation about a decision you are weighing. All of it comes to the same place.</p>
  </div>

  <div class="article rise">
  ${thin}

  <h2>The routes</h2>
  ${list}

  <h2>Corrections</h2>
  <p>The <a href="/disclosure/">editorial and disclosure standards</a> commit to a corrections policy, and a policy without a route is a paragraph. If a number on this site is wrong, say which page and which figure${
    emailUrl(site) ? ` and use the email address above` : ` through any route above`
  }.</p>
  <p>Typographical errors are fixed silently. A factual error is corrected on the page it appeared on, noted at the top of the next daily brief, and listed permanently on <a href="/record/">the Record</a>, whether or not anyone else noticed it.</p>

  <h2>What a conversation is, and what it is not</h2>
  <p>Worth knowing who you are writing to before you write: <a href="/about/">who publishes this and why</a> sets out what the site is for and what it deliberately is not.</p>
  <p>${esc(a.name || "The author")} ${
    a.role ? `is ${esc(a.role)}` : "works in the market this site writes about"
  }, which means there is a commercial interest in some of what gets discussed. That is declared in full on the <a href="/disclosure/">disclosure page</a> and it does not go away because a conversation is friendly.</p>
  <p>So, plainly: nothing said here or on any page of this site is personal investment advice, and nothing is a solicitation. A conversation is a conversation. Where a question needs a lawyer, a tax adviser or a licensed financial adviser, the useful answer is to say so, and that is the answer you will get.</p>

  <h2>Before you write</h2>
  <p>If the question is arithmetic, the <a href="/calculators/">calculators</a> run it on your own figures without sending anything anywhere, and the <a href="/playbooks/">framework library</a> shows the working. If you are not sure which part of the library applies to you, <a href="/start/">the six starting paths</a> are built for exactly that, and they are faster than waiting for a reply.</p>
  </div>

  <p style="font-size:12px;color:var(--muted);margin-top:40px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: pageTitle("Contact", site.name),
    description: clampDescription(
      "How to reach Investments Playbook: corrections, questions about sourcing, and the commercial interests declared before any conversation starts."
    ),
    path: "/contact/",
    body,
  };
}
