const chips = Array.from(document.querySelectorAll(".chip"));
const cards = Array.from(document.querySelectorAll(".post-card"));
const navFilterLinks = Array.from(document.querySelectorAll("[data-filter]"));
const yearNode = document.getElementById("year");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const applyFilter = (topic) => {
  cards.forEach((card) => {
    const match = topic === "all" || card.dataset.topic === topic;
    card.classList.toggle("is-hidden", !match);
  });

  chips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.topic === topic);
  });
};

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    applyFilter(chip.dataset.topic || "all");
  });
});

navFilterLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const topic = link.getAttribute("data-filter") || "all";
    applyFilter(topic);
  });
});

const revealItems = Array.from(document.querySelectorAll(".reveal"));
if ("IntersectionObserver" in window && revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

