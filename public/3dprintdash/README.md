# 3D Print Dash service site

**This is not part of slowebdesign.com.** It is a separate, self-contained static site for a
different product (3D Print Dash), hosted out of this repo's `public/` folder and served at
**status.3dprintdash.com** via the rewrites in `netlify.toml`. Nothing here is linked from,
or renders on, any slowebdesign.com page.

## Why it lives in someone else's repo

A status page must not share infrastructure with the app it reports on, or it goes down at
the exact moment anyone needs it. The 3D Print Dash app is on Vercel; this site is on
Netlify. That separation is the entire point, and it is why this should NOT be "tidied up"
by moving it into the app later.

## What's here

| Path | Purpose |
|---|---|
| `status/` | Is it working right now. Edit `SERVICES` + `LAST_UPDATED` in its `index.html` |
| `incidents/` | Past incidents. See `incidents/README.md` |
| `blog/` | Posts. See `blog/README.md` |
| `changelog/` | What shipped. See `changelog/README.md` |
| `security/` | Vulnerability reporting + data handling |
| `subprocessors/` | Third parties that touch customer data |
| `.well-known/security.txt` | RFC 9116 contact. **Has an `Expires` date — bump it before it lapses** |

Plain static HTML with no build step, deliberately: it must stay portable enough to move to
any host on short notice. Do not add a framework, and do not let Next.js start rendering it.

After editing `blog/posts.json` or `incidents/incidents.json`, regenerate the RSS feeds:

```
node tools/build-3dprintdash-feeds.mjs
```

Section links live in each page's footer rather than a top nav.
