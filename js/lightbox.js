(function () {
  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  var state = { images: [], index: 0 };

  function buildOverlay() {
    if (q(".lightbox")) return;
    var ov = document.createElement("div");
    ov.className = "lightbox";
    ov.tabIndex = -1;
    ov.innerHTML = `
      <div class="lightbox-inner">
        <button class="lightbox-close" aria-label="Close">✕</button>
        <button class="lightbox-prev" aria-label="Previous">◀</button>
        <img class="lightbox-img" alt=""/>
        <button class="lightbox-next" aria-label="Next">▶</button>
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(ov);

    ov.addEventListener("click", function (e) {
      if (e.target === ov) close();
    });
    q(".lightbox-close").addEventListener("click", close);
    q(".lightbox-prev").addEventListener("click", prev);
    q(".lightbox-next").addEventListener("click", next);

    document.addEventListener("keydown", function (e) {
      if (!q(".lightbox")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });
  }

  function open(images, index) {
    state.images = images;
    state.index = index || 0;
    buildOverlay();
    render();
    setTimeout(function () {
      var ov = q(".lightbox");
      if (ov) ov.classList.add("open");
    }, 20);
  }
  function close() {
    var ov = q(".lightbox");
    if (ov) ov.classList.remove("open");
    setTimeout(function () {
      if (ov) ov.remove();
    }, 300);
  }
  function prev() {
    state.index = (state.index - 1 + state.images.length) % state.images.length;
    render();
  }
  function next() {
    state.index = (state.index + 1) % state.images.length;
    render();
  }
  function render() {
    var img = q(".lightbox-img");
    var cap = q(".lightbox-caption");
    if (!img) return;
    var cur = state.images[state.index];
    img.src =
      cur.src ||
      cur.dataset?.large ||
      cur.getAttribute("data-src") ||
      cur.getAttribute("src");
    img.alt = cur.alt || "";
    cap.textContent = cur.alt || "";
  }

  // delegate clicks on gallery images
  document.addEventListener("click", function (e) {
    var img =
      e.target.closest &&
      e.target.closest(".project-gallery img, .post-card img");
    if (!img) return;
    // collect images within same gallery container if possible
    var container = img.closest(".project-gallery");
    var images = [];
    if (container) images = qa("img", container);
    else images = qa(".project-gallery img");
    var idx = images.indexOf(img);
    if (idx === -1) idx = 0;
    open(images, idx);
  });
})();
