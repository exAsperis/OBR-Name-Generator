import { DEFAULT_PARTS, cleanParts, generateName } from "./generator.js";

const STORAGE_KEY = "fantasy-name-forge.parts.v1";
const HISTORY_KEY = "fantasy-name-forge.history.v1";
const LABELS = { prefixes: "Prefixes", stems: "Stems", suffixes: "Suffixes", names: "Complete names", epithets: "Epithets & titles" };

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_PARTS));
const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
let parts = cleanParts(readJSON(STORAGE_KEY, cloneDefaults()));
let history = readJSON(HISTORY_KEY, []).filter((v) => typeof v === "string").slice(0, 8);
let currentName = "";

const result = document.querySelector("#result");
const copyButton = document.querySelector("#copy");
const status = document.querySelector("#status");

for (const [key, label] of Object.entries(LABELS)) {
  const wrapper = document.createElement("div");
  wrapper.className = "editor";
  wrapper.innerHTML = `<div class="editor-head"><label for="${key}">${label}</label><span id="${key}-count"></span></div><textarea id="${key}" rows="4" spellcheck="false"></textarea>`;
  document.querySelector("#editors").append(wrapper);
  const textarea = wrapper.querySelector("textarea");
  textarea.value = parts[key].join("\n");
  const update = () => {
    parts[key] = cleanParts({ ...parts, [key]: textarea.value.split(/\r?\n/) })[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
    wrapper.querySelector("span").textContent = `${parts[key].length} entries`;
    showStatus("Saved locally");
  };
  textarea.addEventListener("input", update);
  update();
}

document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((item) => { item.classList.toggle("active", item === tab); item.setAttribute("aria-selected", String(item === tab)); });
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === tab.dataset.panel));
}));

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => { status.textContent = ""; }, 2200);
}

function renderHistory() {
  const wrap = document.querySelector("#history-wrap");
  wrap.hidden = history.length === 0;
  document.querySelector("#history").replaceChildren(...history.map((name) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = name;
    button.title = "Use this name";
    button.addEventListener("click", () => { currentName = name; result.textContent = name; copyButton.disabled = false; });
    li.append(button);
    return li;
  }));
}

document.querySelector("#generate").addEventListener("click", () => {
  try {
    currentName = generateName(parts, { style: document.querySelector("#style").value, withTitle: document.querySelector("#with-title").checked });
    result.textContent = currentName;
    result.animate([{ opacity: 0.35, transform: "translateY(3px)" }, { opacity: 1, transform: "none" }], { duration: 220 });
    copyButton.disabled = false;
    history = [currentName, ...history.filter((name) => name !== currentName)].slice(0, 8);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
  } catch (error) { result.textContent = error.message; copyButton.disabled = true; }
});

copyButton.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(currentName); copyButton.textContent = "Copied!"; setTimeout(() => { copyButton.textContent = "Copy"; }, 1200); }
  catch { showStatus("Clipboard access was unavailable", true); }
});

document.querySelector("#clear-history").addEventListener("click", () => { history = []; localStorage.removeItem(HISTORY_KEY); renderHistory(); });

document.querySelector("#reset").addEventListener("click", () => {
  parts = cloneDefaults();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
  for (const key of Object.keys(LABELS)) { const area = document.querySelector(`#${key}`); area.value = parts[key].join("\n"); area.dispatchEvent(new Event("input")); }
  showStatus("Default lists restored");
});

document.querySelector("#export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(parts, null, 2)], { type: "application/json" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "fantasy-name-lists.json"; link.click(); URL.revokeObjectURL(link.href);
});

document.querySelector("#import-file").addEventListener("change", async (event) => {
  try {
    const imported = JSON.parse(await event.target.files[0].text());
    parts = cleanParts(imported);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
    for (const key of Object.keys(LABELS)) { const area = document.querySelector(`#${key}`); area.value = parts[key].join("\n"); area.dispatchEvent(new Event("input")); }
    showStatus("Lists imported");
  } catch { showStatus("That file is not a valid list export", true); }
  event.target.value = "";
});

renderHistory();
