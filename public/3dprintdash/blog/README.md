# How to add a blog post

No build step, no framework. Two things to touch.

1. **Copy the template folder** and rename it to your post's URL slug:

   ```
   cp -R blog/_template blog/how-we-price-prints
   ```

2. **Write the post** in `blog/how-we-price-prints/index.html`. Only edit:
   - the `<title>` and `<meta name="description">` in the head,
   - the date, the `<h1>`, the lede, and the body inside `<article class="post">`.

   It is plain HTML. Paragraphs are `<p>`, headings are `<h2>`, links are `<a href="">`.

3. **Add one line to `blog/posts.json`** so it shows up in the list:

   ```json
   [
     {
       "slug": "how-we-price-prints",
       "title": "How we price prints",
       "date": "2026-08-14",
       "summary": "One sentence, shown under the title in the list."
     }
   ]
   ```

   `date` must be `YYYY-MM-DD`. Newest sorts to the top automatically.

4. **Regenerate the RSS feed** so subscribers get it:

   ```
   node tools/build-feeds.mjs
   ```

That's it. Commit and push.

## Rules of thumb

- A post that says what shipped belongs in `changelog/` instead. This is for longer pieces.
- Do not delete `_template/`. It is not listed in `posts.json`, so it never appears publicly.
- If you rename a slug, the old URL breaks. Add a redirect in `vercel.json` if the post was
  ever shared.
