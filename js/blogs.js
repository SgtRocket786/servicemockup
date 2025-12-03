(async () => {
  const grid = document.getElementById("posts");
  try {
    const res = await fetch("html/blogs/posts.json");
    const posts = await res.json();
    const html = (posts || [])
      .map((p) => {
        var href =
          "html/blogs/post.html?slug=" + encodeURIComponent(p.slug || "");
        var hasThumb = !!p.thumb;
        var thumb = p.thumb || "images/pexels-pixabay-259588.jpg";
        var initial = (p.title || "B").trim().charAt(0).toUpperCase();
        var noThumbClass = hasThumb ? "" : " no-thumb";
        var date = p.date
          ? new Date(p.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "";
        return `
          <a class="post-card card-link${noThumbClass}" href="${href}">
            ${
              hasThumb
                ? `<div class="thumb"><img src="${thumb}" alt="${p.title}" /></div>`
                : `<div class="thumb no-thumb" aria-hidden="true"><span class="initial" aria-hidden="true">${initial}</span></div>`
            }
            <div class="post-body">
              ${date ? `<p class="meta">${date}</p>` : ""}
              <h3>${p.title || "Untitled"}</h3>
              <p>${p.excerpt || ""}</p>
            </div>
          </a>
        `;
      })
      .join("");
    grid.innerHTML = html || "<p>No blog posts yet.</p>";
  } catch (e) {
    grid.innerHTML = "<p>Failed to load blogs.</p>";
  }
})();
