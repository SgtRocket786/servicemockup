(async () => {
  const grid = document.getElementById("home-blogs");
  if (!grid) return;
  try {
    const r = await fetch("html/blogs/posts.json");
    const items = await r.json();
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
