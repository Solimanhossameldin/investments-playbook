# The admin

`admin.investmentsplaybook.com` — sign in, see every lead, filter them,
export a CSV.

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

- A free Cloudflare account. **Create it yourself** — Claude does not
  create accounts or type passwords, and you would not want an assistant
  that did.
- A MailerLite API token with read access.
- Ten minutes.

## Steps

**1. Generate your password hash.** In the repository folder:

    node scripts/make-admin-hash.mjs

Type a password of at least twelve characters, twice. It is not shown as
you type and is never saved anywhere. The script prints two values:
`ADMIN_PASSWORD_HASH` and `SESSION_SECRET`. Keep the window open.

**2. Get a MailerLite token.** MailerLite → Integrations → API →
generate a token with read access to subscribers. Copy it.

**3. Create the Worker.** Cloudflare dashboard → Workers & Pages →
Create → Worker. Name it `investments-playbook-admin`. Deploy the
starter, then Edit code, delete everything in the editor, and paste the
whole of `admin/worker.js` from this folder. Deploy.

**4. Add the three variables.** Worker → Settings → Variables and
Secrets. Add each one as **Secret**, not plain text:

| Name | Value |
|---|---|
| `MAILERLITE_API_KEY` | the token from step 2 |
| `ADMIN_PASSWORD_HASH` | the `pbkdf2$…` line from step 1 |
| `SESSION_SECRET` | the second line from step 1 |

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

**"Not configured"** — one of the three variables is missing or
`SESSION_SECRET` is under 24 characters. The Worker refuses to serve
anything rather than run without a secret, which is deliberate.

**"Could not load leads. The server returned 502"** — the MailerLite
token is wrong, expired, or lacks read access. Generate a new one.

**No leads, but no error** — there are genuinely none yet. Both groups
were empty when this was built. Submit the form on the live site with
your own address and refresh.

**The subdomain does not resolve** — the CNAME has not propagated, or it
went into the wrong zone. Nothing about this affects the main site.

## What it does and does not do

It reads. It cannot edit or delete a subscriber, and it holds no
database of its own — every load comes from MailerLite live. Sessions
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
