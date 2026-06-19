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
const searchInput = document.getElementById("search-input");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");

const editModal = document.getElementById("edit-modal");
const editTheme = document.getElementById("edit-theme");
const editQuestion = document.getElementById("edit-question");
const editAnswer = document.getElementById("edit-answer");
const editCancel = document.getElementById("edit-cancel");
const editSave = document.getElementById("edit-save");
let editingId = null;

function render() {
  renderThemeOptions();
  renderBank(searchInput.value.trim().toLowerCase());
  entryCount.textContent = `${entries.length} answer${entries.length === 1 ? "" : "s"} saved`;
}

function renderThemeOptions() {
  const themes = [...new Set(entries.map((e) => e.theme))].sort();
  themeOptions.innerHTML = themes.map((t) => `<option value="${t}"></option>`).join("");
}

function consistencyScore(theme) {
  const norm = normalizeTheme(theme);
  const themeEntries = entries
    .filter((e) => normalizeTheme(e.theme) === norm)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (themeEntries.length < 2) return null;

  const [latest, prev] = themeEntries;
  const tokensA = new Set(tokenize(latest.answer).filter((w) => !STOPWORDS.has(w)));
  const tokensB = new Set(tokenize(prev.answer).filter((w) => !STOPWORDS.has(w)));

  if (tokensA.size === 0 || tokensB.size === 0) return null;

  let intersection = 0;
  for (const t of tokensA) if (tokensB.has(t)) intersection++;
  const union = new Set([...tokensA, ...tokensB]).size;

  return Math.round((intersection / union) * 100);
}

function consistencyBadgeHtml(score) {
  if (score === null) return "";
  let cls = "consistency-low";
  if (score >= 60) cls = "consistency-high";
  else if (score >= 35) cls = "consistency-mid";
  return `<span class="consistency-badge ${cls}" title="Word overlap between your two most recent answers on this theme">${score}% consistent</span>`;
}

function renderBank(search = "") {
  let visibleEntries = entries;
  if (search) {
    visibleEntries = entries.filter(
      (e) =>
        e.theme.toLowerCase().includes(search) ||
        e.question.toLowerCase().includes(search) ||
        e.answer.toLowerCase().includes(search)
    );
  }

  if (entries.length === 0) {
    bankList.innerHTML = `<p class="empty-state">No answers saved yet. Practice one on the left to start building your bank.</p>`;
    return;
  }

  if (visibleEntries.length === 0) {
    bankList.innerHTML = `<p class="no-results">No saved answers match "${escapeHtml(search)}".</p>`;
    return;
  }

  const byTheme = {};
  for (const e of visibleEntries) {
    if (!byTheme[e.theme]) byTheme[e.theme] = [];
    byTheme[e.theme].push(e);
  }

  const themeNames = Object.keys(byTheme).sort();

  bankList.innerHTML = themeNames
    .map((theme) => {
      const themeEntries = byTheme[theme]
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const score = consistencyScore(theme);

      const cards = themeEntries
        .map(
          (e) => `
        <div class="entry-card" data-id="${e.id}">
          <p class="q">${escapeHtml(e.question || "(no question noted)")}</p>
          <p class="a">${escapeHtml(truncate(e.answer, 160))}</p>
          <div class="meta">
            <span class="date">${formatDate(e.date)}</span>
            <span class="buttons">
              <button class="edit" data-id="${e.id}">Edit</button>
              <button class="delete" data-id="${e.id}">Delete</button>
            </span>
          </div>
        </div>`
        )
        .join("");

      return `
        <div class="theme-group">
          <h3>${escapeHtml(theme)} (${themeEntries.length})${consistencyBadgeHtml(score)}</h3>
          ${cards}
        </div>`;
    })
    .join("");

  bankList.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Delete this saved answer?")) return;
      entries = entries.filter((e) => e.id !== id);
      saveEntries(entries);
      render();
    });
  });

  bankList.querySelectorAll(".edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openEditModal(id);
    });
  });
}

function openEditModal(id) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  editingId = id;
  editTheme.value = entry.theme;
  editQuestion.value = entry.question;
  editAnswer.value = entry.answer;
  editModal.classList.remove("hidden");
}

function closeEditModal() {
  editingId = null;
  editModal.classList.add("hidden");
}

editCancel.addEventListener("click", closeEditModal);

editSave.addEventListener("click", () => {
  if (!editingId) return;
  const entry = entries.find((e) => e.id === editingId);
  if (!entry) return;

  const theme = editTheme.value.trim();
  const answer = editAnswer.value.trim();
  if (!theme || !answer) {
    alert("Theme and answer can't be empty.");
    return;
  }

  entry.theme = theme;
  entry.question = editQuestion.value.trim();
  entry.answer = answer;
  saveEntries(entries);
  closeEditModal();
  render();
});

searchInput.addEventListener("input", () => render());

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mirror-interview-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", () => {
  const file = importFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Not an array");

      const existingIds = new Set(entries.map((e) => e.id));
      const merged = imported.filter((e) => e && e.id && e.theme && e.answer && !existingIds.has(e.id));

      entries = [...entries, ...merged];
      saveEntries(entries);
      render();
      alert(`Imported ${merged.length} new answer${merged.length === 1 ? "" : "s"}.`);
    } catch (e) {
      alert("Couldn't read that file — make sure it's a JSON export from Mirror Interview.");
    }
    importFile.value = "";
  };
  reader.readAsText(file);
});

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
