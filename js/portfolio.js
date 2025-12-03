(async () => {
  function getBasePrefix() {
    var parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts[0].indexOf(".") !== -1) return "";
    if (parts[0] === "html") return "";
    return "/" + parts[0];
  }
  var base = getBasePrefix();

  const g = document.getElementById("posts");
  const r = await fetch((base || "") + "/html/portfolio/posts.json");
  const p = await r.json();
  g.innerHTML = p
    .map((x) => {
      var href =
        (base || "") + "/html/portfolio/posts/" + x.slug + "/index.html";
      var hasThumb = !!x.thumb;
      var thumb =
        x.thumb && x.thumb.indexOf("/") === 0
          ? (base || "") + x.thumb
          : x.thumb || (base || "") + "/images/pexels-pixabay-259588.jpg";
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
