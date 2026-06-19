const STORAGE_KEY = "mirror-interview-entries";

/** @typedef {{id: string, theme: string, question: string, answer: string, date: string}} Entry */

/** @returns {Entry[]} */
function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load entries", e);
    return [];
  }
}

/** @param {Entry[]} entries */
function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function normalizeTheme(theme) {
  return theme.trim().toLowerCase();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Tokenize into words, stripping punctuation, for overlap comparison.
 * Stopwords are ignored so overlap reflects meaningful content, not "the/a/and".
 */
const STOPWORDS = new Set([
  "the","a","an","and","or","but","to","of","in","on","at","for","with",
  "is","was","were","be","been","i","my","me","it","that","this","as",
  "so","we","our","they","them","he","she","you","your","then","than",
  "had","have","has","do","did","will","would","could","should","just","very"
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9']+/i)
    .filter(Boolean);
}

/**
 * Highlight words in `text` that also appear (as meaningful tokens) in `otherText`.
 * Returns HTML-safe string with <mark> wrapping overlapping words.
 */
function highlightOverlap(text, otherText) {
  const otherTokens = new Set(
    tokenize(otherText).filter((w) => !STOPWORDS.has(w))
  );

  const escapeHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Split on whitespace but keep punctuation attached, so layout/spacing survives.
  return text
    .split(/(\s+)/)
    .map((chunk) => {
      if (/^\s+$/.test(chunk)) return chunk;
      const bare = chunk.toLowerCase().replace(/[^a-z0-9']/gi, "");
      const safe = escapeHtml(chunk);
      if (bare && !STOPWORDS.has(bare) && otherTokens.has(bare)) {
        return `<mark>${safe}</mark>`;
      }
      return safe;
    })
    .join("");
}

// ----- App state -----
let entries = loadEntries();

// ----- DOM refs -----
const themeInput = document.getElementById("theme-input");
const themeOptions = document.getElementById("theme-options");
const questionInput = document.getElementById("question-input");
const answerInput = document.getElementById("answer-input");
const compareBtn = document.getElementById("compare-btn");
const saveBtn = document.getElementById("save-btn");
const compareResult = document.getElementById("compare-result");
const pastAnswerEl = document.getElementById("past-answer");
const newAnswerEl = document.getElementById("new-answer");
const pastDateEl = document.getElementById("past-date");
const bankList = document.getElementById("bank-list");
const entryCount = document.getElementById("entry-count");

function render() {
  renderThemeOptions();
  renderBank();
  entryCount.textContent = `${entries.length} answer${entries.length === 1 ? "" : "s"} saved`;
}

function renderThemeOptions() {
  const themes = [...new Set(entries.map((e) => e.theme))].sort();
  themeOptions.innerHTML = themes.map((t) => `<option value="${t}"></option>`).join("");
}

function renderBank() {
  if (entries.length === 0) {
    bankList.innerHTML = `<p class="empty-state">No answers saved yet. Practice one on the left to start building your bank.</p>`;
    return;
  }

  const byTheme = {};
  for (const e of entries) {
    if (!byTheme[e.theme]) byTheme[e.theme] = [];
    byTheme[e.theme].push(e);
  }

  const themeNames = Object.keys(byTheme).sort();

  bankList.innerHTML = themeNames
    .map((theme) => {
      const themeEntries = byTheme[theme]
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const cards = themeEntries
        .map(
          (e) => `
        <div class="entry-card" data-id="${e.id}">
          <p class="q">${escapeHtml(e.question || "(no question noted)")}</p>
          <p class="a">${escapeHtml(truncate(e.answer, 160))}</p>
          <div class="meta">
            <span class="date">${formatDate(e.date)}</span>
            <button class="delete" data-id="${e.id}">Delete</button>
          </div>
        </div>`
        )
        .join("");

      return `
        <div class="theme-group">
          <h3>${escapeHtml(theme)} (${themeEntries.length})</h3>
          ${cards}
        </div>`;
    })
    .join("");

  bankList.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      entries = entries.filter((e) => e.id !== id);
      saveEntries(entries);
      render();
    });
  });
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n).trim() + "…" : s;
}

function mostRecentForTheme(theme) {
  const norm = normalizeTheme(theme);
  const matches = entries
    .filter((e) => normalizeTheme(e.theme) === norm)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return matches[0] || null;
}

compareBtn.addEventListener("click", () => {
  const theme = themeInput.value.trim();
  const newAnswer = answerInput.value.trim();

  if (!theme) {
    alert("Enter a theme first so I know what to compare against.");
    return;
  }
  if (!newAnswer) {
    alert("Write your answer first.");
    return;
  }

  const past = mostRecentForTheme(theme);
  if (!past) {
    alert(`No past answer saved yet for "${theme}". Save this one, then compare next time.`);
    return;
  }

  pastDateEl.textContent = `(${formatDate(past.date)})`;
  pastAnswerEl.innerHTML = highlightOverlap(past.answer, newAnswer);
  newAnswerEl.innerHTML = highlightOverlap(newAnswer, past.answer);
  compareResult.classList.remove("hidden");
  compareResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

saveBtn.addEventListener("click", () => {
  const theme = themeInput.value.trim();
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!theme || !answer) {
    alert("Add at least a theme and an answer before saving.");
    return;
  }

  /** @type {Entry} */
  const entry = {
    id: crypto.randomUUID(),
    theme,
    question,
    answer,
    date: new Date().toISOString(),
  };

  entries.push(entry);
  saveEntries(entries);
  render();

  questionInput.value = "";
  answerInput.value = "";
  compareResult.classList.add("hidden");
});

render();
