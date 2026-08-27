# The admin

`admin.investmentsplaybook.com` — your own back end. Sign in with your
own password and edit the site: the 40 frameworks, the 47 glossary
terms, the standing pages. Also see every lead, filter them, export a
CSV.

You never sign in to GitHub or MailerLite to run this. They sit
underneath as plumbing; the tokens belong to the Worker, not to you.
Editing a page here writes a commit and the site rebuilds itself, which
means every change has an author, a timestamp and a diff — a better
record than most content systems keep.

## Why it is a subdomain and not investmentsplaybook.com/admin

The main site is static files on GitHub Pages. Static files cannot keep
a secret: anything the page knows, every visitor knows, because they can
read the source. So an admin needs something that runs on a server, and
GitHub Pages does not run anything.

The admin therefore runs as a Cloudflare Worker on its own subdomain.
That was chosen over moving the whole site to Cloudflare because it adds
**one DNS record** and touches nothing that is already working. If the
admin breaks, the website does not notice. Moving the live site's
hosting to gain a login would have put the whole thing at risk for a
page only one person ever opens.

## What you need

- A free Cloudflare account. **You create it** — Claude does not create
  accounts or type passwords, and an assistant that would do either is
  one that can be talked into doing it somewhere it should not.
- Ten minutes.

Claude can watch your screen and tell you exactly what to click at each
step. Ask, and do the steps together rather than from this page.

## Steps

**1. Generate your password hash.** In the repository folder:

    node scripts/make-admin-hash.mjs

Type a password of at least twelve characters, twice. It is not shown as
you type and is never saved anywhere. The script prints two values:
`ADMIN_PASSWORD_HASH` and `SESSION_SECRET`. Keep the window open.

**2. Optional, and skippable for now.** For the leads tab:
MailerLite → Integrations → API → a token with read access to
subscribers. The admin works without it; the leads tab just says it is
not connected.

**3. Create the Worker.** Cloudflare dashboard → Workers & Pages →
Create → Worker. Name it `investments-playbook-admin`. Deploy the
starter, then Edit code, delete everything in the editor, and paste the
whole of **`admin/worker.bundled.js`** from this folder. Deploy.

Paste the bundled file, not `worker.js`. The source is split across
three modules so the schema is shared with the site's own build rather
than duplicated; Cloudflare's editor takes one file, and
`npm run buildadmin` produces it. The tests fail if the bundle is older
than the source, so it cannot drift.

**4. Add the variables.** Worker → Settings → Variables and Secrets.
Add each as **Secret**, not plain text. The first three are required;
the fourth only switches the leads tab on and can wait:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD_HASH` | the `pbkdf2$…` line from step 1 |
| `SESSION_SECRET` | the second line from step 1 |
| `GITHUB_TOKEN` | see below |
| `MAILERLITE_API_KEY` | optional, for the leads tab |

For `GITHUB_TOKEN`: github.com → Settings → Developer settings → Personal
access tokens → Fine-grained tokens → Generate. Give it access to the
`investments-playbook` repository only, and one permission: **Contents,
read and write**. Nothing else. Copy the token.

Deploy again so the Worker picks them up.

**5. Point the subdomain at it.** Worker → Settings → Domains & Routes →
Add → Custom domain → `admin.investmentsplaybook.com`.

Cloudflare will ask you to add a DNS record. Your DNS is at Bluehost, in
the cPanel Zone Editor for `box4186`. Add the **CNAME** exactly as
Cloudflare gives it to you. It usually resolves in minutes and can take
up to an hour.

**6. Open it.** `https://admin.investmentsplaybook.com`, enter your
password.

## If something is wrong

**"Not configured"** — the page names which variable is missing, or
`SESSION_SECRET` is under 24 characters. The Worker refuses to serve
anything rather than run without a secret, which is deliberate.

**"Could not load leads. The server returned 502"** — the MailerLite
token is wrong, expired, or lacks read access. Generate a new one.

**No leads, but no error** — there are genuinely none yet. Checked again
on 27 August: `IP: Daily Brief` and `IP: Playbook Download` both hold
zero subscribers. Submit the form on the live site with your own address
and refresh.

The account is not empty, though. `Newsletter - Market Insights` holds
230 subscribers from the existing business, opening at about 31 percent.
They are not in either IP group and they have no `Investor Intent` value
set, so **switching on the six IP automations will not mail them**: two
of the six trigger on joining an IP group, and the other four on joining
an intent segment, and those 230 match neither. That was worth checking
before assuming activation was riskier than it is.

**The subdomain does not resolve** — the CNAME has not propagated, or it
went into the wrong zone. Nothing about this affects the main site.

## What it does and does not do

It edits content: the frameworks, the glossary, the standing pages. It
cannot change the design, add a new page type, or alter how the site is
built — those are code, and they still come through Claude.

Leads are read-only. It cannot edit or delete a subscriber, and it holds
no database of its own — every load comes from MailerLite live.

Nothing you save can break the site quietly. The fields are validated on
the server before anything is committed, and what gets written is parsed
back before the commit is accepted. Sessions
last twelve hours, the cookie is HttpOnly, Secure and SameSite=Strict,
and the page refuses to be framed or indexed.

A wrong password costs the guesser a one second delay per attempt. If
this ever faces real attention, add a Cloudflare rate-limiting rule on
`/login` — Security → WAF → Rate limiting rules.

## Rotating the password

Run `node scripts/make-admin-hash.mjs` again and replace both
`ADMIN_PASSWORD_HASH` and `SESSION_SECRET` in the Worker. Replacing the
session secret signs everyone out immediately, which is what you want if
you think a session has been taken.

## Never commit the secrets

The three values belong in the Cloudflare dashboard only. Nothing in
this repository contains them, and nothing should.
