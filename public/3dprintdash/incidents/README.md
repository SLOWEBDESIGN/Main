# How to write up an incident

Add an object to `incidents/incidents.json`, then run `node tools/build-feeds.mjs`.

```json
[
  {
    "date": "2026-08-14",
    "duration": "41 minutes",
    "severity": "major",
    "title": "Checkout failed for saved cards",
    "impact": "What a customer experienced. Say it plainly and do not minimise it.",
    "cause": "What actually broke. Name the real cause, not 'an issue'.",
    "fix": "What changed so it cannot happen the same way again."
  }
]
```

`severity` is `minor`, `major` or `outage`.

Write these even when they are embarrassing. A history of honest write-ups is worth more
than a page that has been green since the day it was built, which nobody believes.
