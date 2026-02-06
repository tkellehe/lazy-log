const barLists = Array.from(document.querySelectorAll(".bar-list"));

barLists.forEach((list) => {
  const bars = Array.from(list.querySelectorAll(".bar[data-width]"));
  if (!bars.length) {
    return;
  }

  const max = Math.max(...bars.map((bar) => Number(bar.dataset.width || 0)), 1);
  bars.forEach((bar) => {
    const raw = Number(bar.dataset.width || 0);
    const width = (raw / max) * 100;
    bar.style.setProperty("--fill", `${Math.max(width, 1.5)}%`);
  });
});

const readTimeNode = document.getElementById("read-time");
const postRoot = document.querySelector(".post-shell");

if (readTimeNode && postRoot) {
  // Rough reading estimate: ~220 words/minute
  const text = (postRoot.innerText || "").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  const minutes = Math.max(1, Math.round(words / 220));
  readTimeNode.textContent = `Estimated read: ${minutes} min`;
}
