// Edite estes três valores para atualizar todos os botões do site.
function getProjectLinks() {
  return {
    twitterUrl: "https://example.com/?demo=x",
    pumpFunUrl: "https://example.com/?demo=pump-fun",
    contractAddress: "DEMO-ROCKSTAR-CONTRACT",
  };
}

const { twitterUrl, pumpFunUrl, contractAddress } = getProjectLinks();
const address = contractAddress.trim();
const links = { x: getHttpUrl(twitterUrl), pump: getHttpUrl(pumpFunUrl) };
const feedback = document.querySelector("#feedback");
let feedbackTimer;

function getHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

for (const button of document.querySelectorAll("[data-link]")) {
  const url = links[button.dataset.link];
  if (!url) {
    button.title = "Official link pending";
    continue;
  }

  const link = document.createElement("a");
  link.className = button.className;
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(...button.childNodes);
  button.replaceWith(link);
}

const configNote = document.querySelector("[data-config-note]");
const hasDemoValues = [links.x, links.pump].some(url => url.startsWith("https://example.com/?demo="))
  || address === "DEMO-ROCKSTAR-CONTRACT";

if (hasDemoValues) {
  configNote.textContent = "Demo links and contract shown for testing.";
}
configNote.hidden = !hasDemoValues && Boolean(links.x && links.pump && address);
document.querySelector("[data-contract]").textContent = address || "Pending announcement";

for (const button of document.querySelectorAll("[data-copy]")) {
  button.disabled = !address;
  if (!address) button.title = "Contract address pending";
  button.addEventListener("click", copyContract);
}

async function copyContract() {
  try {
    await navigator.clipboard.writeText(address);
    showFeedback("Contract address copied.");
  } catch {
    const contract = document.querySelector("[data-contract]");
    const range = document.createRange();
    range.selectNodeContents(contract);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    contract.scrollIntoView({ block: "center" });
    showFeedback("Contract selected. Copy it using your browser.");
  }
}

function showFeedback(message) {
  clearTimeout(feedbackTimer);
  feedback.textContent = message;
  feedback.hidden = false;
  feedbackTimer = setTimeout(() => {
    feedback.hidden = true;
    feedback.textContent = "";
  }, 4500);
}

const soundtrack = document.querySelector("#soundtrack");
const soundToggle = document.querySelector(".sound-toggle");
const soundVolume = document.querySelector(".sound-volume input");
const startEvents = ["pointerdown", "pointerup", "click", "keydown"];
let startingSoundtrack = false;

function setSoundtrackVolume() {
  soundtrack.volume = Number(soundVolume.value) / 100;
}

function syncSoundToggle() {
  const playing = !soundtrack.paused;
  soundToggle.textContent = playing ? "Ⅱ" : "▶";
  soundToggle.setAttribute("aria-label", playing ? "Pause RHYNO" : "Play RHYNO");
}

function removeSoundtrackStartListeners() {
  for (const event of startEvents) {
    document.removeEventListener(event, startSoundtrackOnInteraction, true);
  }
}

async function playSoundtrack(manual = false) {
  if (startingSoundtrack) return;
  startingSoundtrack = true;
  try {
    await soundtrack.play();
    removeSoundtrackStartListeners();
  } catch {
    if (manual) showFeedback("Could not play RHYNO. Try again.");
  } finally {
    startingSoundtrack = false;
    syncSoundToggle();
  }
}

function startSoundtrackOnInteraction(event) {
  if (event.target instanceof Element && event.target.closest(".sound-toggle")) return;
  if (event.type === "pointerdown" && event.pointerType !== "mouse") return;
  playSoundtrack();
}

setSoundtrackVolume();
soundVolume.addEventListener("input", setSoundtrackVolume);
soundtrack.addEventListener("playing", syncSoundToggle);
soundtrack.addEventListener("pause", syncSoundToggle);
soundToggle.addEventListener("click", () => {
  removeSoundtrackStartListeners();
  if (soundtrack.paused) playSoundtrack(true);
  else soundtrack.pause();
});

for (const event of startEvents) {
  document.addEventListener(event, startSoundtrackOnInteraction, true);
}
