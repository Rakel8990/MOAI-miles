# Moai Miles

A browser endless runner — dodge moai statues, collect yield bags, survive the chain.
Single-file vanilla HTML/CSS/JS for the game itself, no build step, works fully offline.
One small serverless function powers the shared leaderboard. Built for the Concrete community.

## Files
- `index.html` — the game itself
- `og-image.png` — the branded preview image shown when the link is pasted on X/Discord/iMessage/etc.
- `api/leaderboard.js` + `package.json` — the shared leaderboard backend

## Local dev
Open `index.html` directly in a browser — the game runs with zero setup. The
`/api/leaderboard` endpoint only works once deployed on Vercel (or via `vercel dev`
locally), so offline you'll just see your own device's local scores, which is expected.

## Deploy on Vercel (via GitHub)
1. Push this whole folder (`index.html`, `og-image.png`, `api/leaderboard.js`,
   `package.json`) to a GitHub repo — drag-and-drop all four onto GitHub's "Add
   file" screen, or `git add . && git commit -m "moai miles" && git push`.
2. vercel.com → **Add New → Project** → import that repo.
3. Leave the framework preset on **Other**. Vercel auto-detects the `api/` folder
   as a serverless function and installs `@upstash/redis` from `package.json` —
   no manual build command needed.
4. **Deploy.**

## One manual step: fix the social preview URL
`index.html` has `og:image` / `twitter:image` tags pointing at a placeholder —
open the file, search for `YOUR-DOMAIN-HERE`, and replace both occurrences with
your actual deployed URL, e.g.:

```
https://moai-miles.vercel.app/og-image.png
https://moai-miles.vercel.app/
```

This has to be a real, static URL baked into the HTML — X's crawler doesn't run
JavaScript, so this can't be filled in automatically at runtime the way the rest
of the game adapts to its URL. Skip this step and the game still works fine;
you'll just get a blank link preview instead of the branded card when it's shared.

## Connecting the shared leaderboard (one-time, ~2 minutes)
Vercel's old built-in KV product was retired — storage now comes from the
**Vercel Marketplace**, using Upstash Redis under the hood:

1. In your Vercel project, open the **Storage** tab → **Marketplace Database
   Providers** → choose **Upstash** (Redis).
2. Create a new Redis database (or connect an existing one) and link it to this
   project. Vercel automatically adds the connection as environment variables.
3. **Settings → Environment Variables** — confirm you now see either
   `KV_REST_API_URL` + `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` +
   `UPSTASH_REDIS_REST_TOKEN`. The API function checks for both names, so
   whichever pair Vercel created will work.
4. Redeploy (Vercel prompts for this automatically after adding env vars).
5. Play a run — the leaderboard screen should now say "Live global leaderboard."

If it still shows "Offline" after redeploying, check the function logs under
your project's **Deployments → (latest) → Functions** tab for the exact error.

## Quoting an announcement post (optional)
If you post an official announcement tweet with an image, the share button can
auto-quote it instead of just linking to the game — every shared score would
then show your image via the quoted tweet. Send over that tweet's URL and it's
a one-line change in `shareScore()`.

Built by [@22kian_](https://x.com/22kian_).
