(async () => {
  const g = document.getElementById("posts");
  const r = await fetch("html/portfolio/posts.json");
  const p = await r.json();
  g.innerHTML = p
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
            <p>${x.caption || ""}</p>
            <h3>${x.title}</h3>
            <p>${x.excerpt || ""}</p>
          </div>
        </a>
      `;
    })
    .join("");
})();
