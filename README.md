# Mirror Interview

Practice interview answers, save them to a personal story bank organized by theme, and — the core trick — compare each new attempt against your **own most recent past answer** on the same theme. Overlapping words/phrases are highlighted, so you can immediately see what's consistent and what you've started dropping or changing.

No AI grading, no canned feedback. Just your own words held up against your past self.

## Why

Recruiters notice when your "tell me about a failure" story changes shape every time you tell it. This catches that drift *before* the interview, by making your own history visible to you.

## Run it

No build step — it's plain HTML/CSS/JS.

```bash
git clone <this-repo>
cd mirror-interview
# open index.html directly, or serve it:
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## How it works

1. **Practice an answer** — enter a theme (e.g. `leadership`, `failure`, `conflict`), a question, and your answer.
2. **Compare with past answer** — pulls your most recent saved answer for that theme and highlights shared meaningful words on both sides (stopwords like "the/and/a" are ignored so the highlighting reflects real content overlap, not grammar).
3. **Save this answer** — adds it to your story bank, grouped by theme, newest first.

Data is stored in `localStorage`, entirely client-side — nothing leaves your browser.

## Roadmap ideas

- Swap word-overlap highlighting for a real diff algorithm (e.g. `diff-match-patch`) for finer-grained comparison
- Speech-to-text input (Web Speech API or Whisper) instead of typing
- Semantic theme matching via embeddings, so "tell me about a challenge" auto-links to "describe a difficult situation"
- A consistency score per theme across all saved attempts
- Export/import story bank as JSON

## License

MIT
