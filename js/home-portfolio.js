(async () => {
  const w = document.getElementById("home-portfolio");
  if (!w) return;
  try {
    async function getJson(url) {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) {
        var parts = location.pathname.split("/").filter(Boolean);
        var repo = parts[0] || "";
        if (repo && repo !== "html") {
          var alt = "/" + repo + "/" + url.replace(/^\//, "");
          const r2 = await fetch(alt, { cache: "no-store" });
          if (r2.ok) return r2.json();
        }
      }
      return r.json();
    }
    const p = await getJson("html/portfolio/posts.json");
    w.innerHTML = p
      .slice(0, 3)
      .map((x) => {
        var href = "html/portfolio/posts/" + x.slug + "/index.html";
        var hasThumb = !!x.thumb;
        var thumb = x.thumb || "images/pexels-pixabay-259588.jpg";
        var initial = (x.title || "P").trim().charAt(0).toUpperCase();
        var noThumbClass = hasThumb ? "" : " no-thumb";
        return `
        <a class="post-card card-link${noThumbClass}" href="${href}">
          ${
            hasThumb
              ? `<div class="thumb"><img src="${thumb}" alt="${x.title}" /></div>`
              : `<div class="thumb no-thumb" aria-hidden="true"><span class="initial" aria-hidden="true">${initial}</span></div>`
          }
          <div class="post-body">
            <h3>${x.title}</h3>
            <p>${x.excerpt || ""}</p>
          </div>
        </a>
      `;
      })
      .join("");
  } catch (e) {
    w.innerHTML = "<p>Failed to load projects.</p>";
    console.error("home-portfolio: fetch failed", e);
  }
})();
