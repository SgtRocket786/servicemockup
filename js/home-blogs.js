(async () => {
  const grid = document.getElementById("home-blogs");
  if (!grid) return;
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
    const items = await getJson("html/blogs/posts.json");
    const three = (items || []).slice(0, 3);
    grid.innerHTML = three
      .map((p) => {
        const hasThumb = !!p.thumb;
        const img = p.thumb || "images/projects/patio-arvada/cover.jpg";
        const date = p.date
          ? new Date(p.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "";
        const href = "html/blogs/post.html?slug=" + encodeURIComponent(p.slug);
        const noThumbClass = hasThumb ? "" : " no-thumb";
        return `
          <a class="post-card blog-card card-link${noThumbClass}" href="${href}">
            ${
              hasThumb
                ? `<div class="thumb"><img src="${img}" alt="${p.title}" /></div>`
                : `<div class="thumb no-thumb" aria-hidden="true"><span class="date-text">${
                    date || "—"
                  }</span></div>`
            }
            <div class="post-body">
              <h3>${p.title}</h3>
              ${date ? `<p class="meta">${date}</p>` : ""}
              <p>${(p.excerpt || "").slice(0, 140)}...</p>
            </div>
          </a>
        `;
      })
      .join("");
  } catch (e) {
    grid.innerHTML = "<p>Failed to load blog posts.</p>";
    console.error("home-blogs: fetch failed", e);
  }
})();
