(async () => {
  function getBasePrefix() {
    var parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts[0].indexOf(".") !== -1) return "";
    if (parts[0] === "html") return "";
    return "/" + parts[0];
  }
  var base = getBasePrefix();

  const grid = document.querySelector("#services .services-grid");
  if (!grid) return;
  // Local static fallback for mockup
  const items = [
    {
      slug: "custom-patios",
      title: "Custom Patios",
      excerpt:
        "Beautiful outdoor living spaces designed for entertaining and relaxation.",
    },
    {
      slug: "xeriscaping",
      title: "Xeriscaping",
      excerpt:
        "Water-wise landscaping solutions perfect for Colorado's climate.",
    },
    {
      slug: "hardscaping",
      title: "Hardscaping",
      excerpt:
        "Durable and elegant stone features, walkways, and retaining walls.",
    },
  ];
  grid.innerHTML = items
    .map((s) => {
      const href = (base || "") + "/html/portfolio/index.html";
      return `
      <a class="service-card card-link" href="${href}" style="text-decoration:none">
        <h3>${s.title}</h3>
        ${s.excerpt ? `<p>${s.excerpt}</p>` : ""}
      </a>
    `;
    })
    .join("");
})();
