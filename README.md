<div align="center">

# 🪞 Mirror Interview

**Practice interview answers. Catch yourself drifting before a recruiter does.**

No AI grading. No canned feedback. Just your own words, held up against your past self.

</div>

---

## The problem

Most interview prep tools generate a question, you answer it, and an AI tells you what it thinks of your answer. That's not what actually trips people up in real interviews.

What trips people up is **inconsistency**. You tell the "tell me about a failure" story one way in March, and a slightly different way in June — different details, a different lesson learned, a different ending. A sharp interviewer notices. Mirror Interview catches that before they do, by comparing your new answer against the most recent one *you* gave on the same theme.

## How it works

```
┌─────────────────────┐        ┌─────────────────────┐
│   Practice answer    │  ───▶  │   Compare with past  │
│   (theme + Q + A)    │        │   answer on theme    │
└─────────────────────┘        └─────────────────────┘
           │                              │
           ▼                              ▼
   ┌───────────────┐           Shared words/phrases
   │  Story bank    │           highlighted on both
   │  (saved, by    │           sides — see what stuck,
   │   theme)       │           what changed, what's gone
   └───────────────┘
```

1. **Write an answer** under a theme (`leadership`, `failure`, `conflict`, anything you want)
2. **Compare** — pulls your most recent saved answer on that theme and highlights the overlapping content
3. **Save** — adds it to your story bank with a live **consistency score** per theme

Everything runs client-side. No backend, no account, no data leaving your browser.

## Features

| | |
|---|---|
| 🎯 **Drift detection** | Word-overlap highlighting between your current and most recent answer on a theme |
| 📊 **Consistency score** | Auto-calculated Jaccard similarity between your last two answers per theme |
| 📚 **Story bank** | All saved answers, grouped by theme, newest first |
| 🔍 **Search** | Filter saved answers by theme, question, or content |
| ✏️ **Edit in place** | Fix a saved answer without deleting and re-adding it |
| 📦 **Export / Import** | Back up your story bank as JSON, move it between browsers/devices |
| 🔒 **Private by default** | `localStorage` only — nothing is sent anywhere |

## Quick start

No build step. No dependencies. No `npm install`.

```bash
git clone https://github.com/<your-username>/mirror-interview.git
cd mirror-interview
python3 -m http.server 8000
```

Open `http://localhost:8000` — or just open `index.html` directly in a browser.

### Deploy it

Push to GitHub, then connect the repo on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — zero config needed since it's static HTML/CSS/JS.

## Project structure

```
mirror-interview/
├── index.html      entry point + edit modal markup
├── style.css        all styling (studio/transcript aesthetic)
├── app.js            state, storage, comparison & scoring logic
└── README.md
```

## Roadmap

- [ ] Real diff algorithm (`diff-match-patch`) instead of word-overlap highlighting
- [ ] Speech-to-text input via the Web Speech API
- [ ] Semantic theme matching with embeddings (so "tell me about a challenge" auto-links to "describe a difficult situation")
- [ ] Filler-word and pacing analysis
- [ ] Random practice-question picker per theme

## Contributing

Issues and PRs welcome. Keep it dependency-free where reasonably possible — that's the point.

## License

MIT — do whatever you want with it.

<div align="center">

*Built for anyone tired of catching themselves mid-sentence saying "wait, that's not what I said last time."*

</div>
