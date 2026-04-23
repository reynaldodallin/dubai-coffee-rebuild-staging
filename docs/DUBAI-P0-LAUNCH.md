# Dubai P0 Launch — `get-site.html` Commercial Pricing

Scope: minimal P0 correction to `get-site.html` so Dubai (fond.coffee) stops
selling a directory one-time build and starts selling three commercial plans
for Dubai businesses on `yourname.dxb.fond.coffee` / `slug.dxb.fond.coffee`.

This doc captures the audit, the change, the validation commands, deploy and
rollback steps, and the known residual risks that P0 does **not** fix.

---

## 1. Audit — what was wrong

Previous `get-site.html` was selling the **directory build** itself as a
one-time package (Starter $299, Professional $549, Growth $799, all labelled
"one-time"). That pitch is aimed at city-directory owners, not at local Dubai
businesses who actually visit `dubai.fond.coffee`.

Concrete issues fixed in this P0:

| Area | Before | After |
|---|---|---|
| Audience | City-directory operators | Dubai businesses |
| Domain pattern | `yourname.fond.coffee` | `yourname.dxb.fond.coffee` / `slug.dxb.fond.coffee` |
| Pricing model | One-time build fee only | Setup fee + monthly plan |
| Starter | $299 one-time | **$99 setup + $19/mo** (assisted edits, upgrade path to WYSIWYG) |
| Pro | $549 one-time | **$249 setup + $39/mo** (exclusive WYSIWYG editor — owner edits) |
| Growth | $799 one-time | **$499 setup + $79/mo** (WYSIWYG + advanced blocks + strategy) |
| WYSIWYG claim | Not surfaced | Explicit on Pro & Growth; Starter only mentions upgrade path |
| JSON-LD offers | One-time directory product | Business-site offers with setup+monthly description |
| Meta / OG | Directory copy | Dubai business copy referencing `dxb.fond.coffee` |
| CTA bottom | "Launch Your Coffee Directory" | "Launch on dxb.fond.coffee" |

Design / layout / nav / footer / showcase / benefits / "what you get" /
domain grid / ad slots were **intentionally left in place** — only the copy
and the pricing block changed, so no CSS or JS had to be rewritten.

---

## 2. Commands used

```bash
# local sanity
git status
git log --oneline -5

# edit get-site.html (targeted Edit calls — no full rewrite)
#   - meta + JSON-LD
#   - hero badge / title / subtitle
#   - "What You Get" branded-subdomain item + section subtitle
#   - pricing section (3 cards, setup + monthly, WYSIWYG rules per plan)
#   - bottom CTA

# validation
python3 -c "import html.parser, pathlib; \
  html.parser.HTMLParser().feed(pathlib.Path('get-site.html').read_text())" \
  && echo "HTML parsed OK"

grep -E "Starter|\\\$99.*\\\$19|Pro\\b|\\\$249.*\\\$39|Growth|\\\$499.*\\\$79" get-site.html
grep -E "WYSIWYG" get-site.html
grep -E "dxb\\.fond\\.coffee" get-site.html
grep -E "one-time" get-site.html   # should now only appear in setup context

git add get-site.html docs/DUBAI-P0-LAUNCH.md
git commit -m "P0: dxb.fond.coffee commercial plans on get-site (Starter/Pro/Growth)"
git push origin main
```

---

## 3. Deploy

Cloudflare Pages is wired to this GitHub repo's `main` branch. Pushing to
`origin main` triggers an automatic build + deploy of `dubai.fond.coffee` —
no manual action needed. Expected TTP (time-to-prod): ~1–3 minutes.

Verify after deploy:

1. Open https://dubai.fond.coffee/get-site.html
2. Confirm hero shows "Your Dubai Business, Online in Days" and mentions
   `yourname.dxb.fond.coffee`.
3. Confirm pricing cards read `$19/mo`, `$39/mo`, `$79/mo` with the
   matching one-time setup lines.
4. Confirm Pro and Growth cards explicitly mention the **exclusive WYSIWYG
   editor** and that Starter only mentions an upgrade path.
5. View page source → JSON-LD `offers` should list Starter / Pro / Growth
   with the new descriptions.

---

## 4. Rollback

The change is confined to two paths (`get-site.html`, `docs/DUBAI-P0-LAUNCH.md`).
To roll back:

```bash
# soft rollback — single-commit revert, auto-redeploys via Pages
git revert <commit-sha>
git push origin main

# or, if the revert commit itself is undesirable, hard reset (only if you
# control the branch and no other work has landed on top):
git reset --hard <previous-sha>
git push --force-with-lease origin main
```

Cloudflare Pages will rebuild and redeploy the previous version on push.
No DNS, no secrets, no database state to restore.

---

## 5. Known residual risks (NOT fixed in P0)

These are tracked here so nobody ships assuming P0 closes them.

1. **Wildcard `*.dxb.fond.coffee` DNS / Pages routing** — this P0 only
   changes copy. The actual wildcard for `dxb.fond.coffee` sub-subdomains
   (e.g. `acme.dxb.fond.coffee`) still needs to be provisioned in Cloudflare
   (DNS record + Pages custom-domain wildcard + TLS). Until that is live,
   the page promises a URL pattern that cannot yet be served for new
   customers. **Do not run paid ads to `get-site.html` until the wildcard
   is live.**

2. **Batch pipeline still targets the directory template** — the TechSites
   A.I. batch pipeline currently generates city-directory sites (listings,
   categories, blog). It does **not** yet generate single-business sites
   with the WYSIWYG editor wired up. Onboarding a Starter/Pro/Growth
   customer today still requires a manual hand-off to the editor. The
   pipeline change is a separate work item.

3. **CTAs are still `mailto`-style via `contact.html`** — there is no
   checkout, no Stripe link, no plan-selector on the CTA. Billing is
   manual: sales reads the inbound lead, sends a payment link out of band.
   Acceptable for P0 while volume is low; should be replaced with a
   real checkout (Stripe Payment Links at minimum) before any paid
   acquisition ramps.

4. **Trial / demo flow for the WYSIWYG editor** is not on this page. If
   prospects want to *see* the editor before paying, they have to ask via
   the contact form. Consider a "Try the editor" CTA once a demo tenant is
   ready — but do not touch that template in this P0.

5. **Showcase section still pitches the directory flagship** — we kept it
   because ripping it out was out of scope and because it does establish
   credibility ("here's a live site we built"). Reframe it in a follow-up
   if conversion data shows prospects get confused.

---

## 6. What P0 explicitly does NOT touch

- DNS / Cloudflare records
- Secrets, API keys, environment variables
- The WYSIWYG editor itself or the trial tenant template
- `index.html`, `listings.html`, `premium-listing.html`, blog, category pages
- `assets/**` (CSS, JS, images)
- The batch generation pipeline

Anything beyond `get-site.html` + this doc is a follow-up.
