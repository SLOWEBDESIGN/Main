# How to add a changelog entry

Edit `changelog/entries.json` and add one object. Nothing else.

```json
[
  {
    "date": "2026-08-14",
    "kind": "added",
    "title": "Reorder from your order history",
    "body": "One or two sentences. Optional."
  }
]
```

- `kind` is one of `added`, `changed`, `fixed`. Anything else renders as `changed`.
- `date` is `YYYY-MM-DD`. Newest sorts to the top.
- Keep `title` short enough to read at a glance. The detail goes in `body`, or in a blog post.

Write it for a customer, not for yourself: "Reorder from your order history", not
"add reorderActions.ts".
