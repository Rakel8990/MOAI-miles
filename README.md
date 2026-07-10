# Moai Miles

A browser endless runner — dodge moai statues, collect yield bags, survive the chain.
Single-file vanilla HTML/CSS/JS, no build step, no dependencies, works fully offline.
Built for the Concrete community.

## Local dev
Just open `index.html` in a browser. That's it — no server, no npm install.

## Deploy on Vercel (via GitHub)
1. Create a new GitHub repo and add this `index.html` (drag-and-drop upload on
   GitHub's "Add file" screen works fine — no git CLI required).
2. Go to vercel.com → **Add New → Project** → import that repo.
3. Framework preset: leave as **Other**. No build command, no output directory —
   Vercel serves the static `index.html` at the root with zero config.
4. Click **Deploy**. You'll get a `*.vercel.app` URL in under a minute.
5. Optional: Project Settings → Domains, to attach a custom domain later.

Built by [@22kian_](https://x.com/22kian_).
