document.addEventListener("DOMContentLoaded", function () {
  function getBasePrefix() {
    var parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts[0].indexOf(".") !== -1) return "";
    if (parts[0] === "html") return "";
    return "/" + parts[0];
  }
  var base = getBasePrefix();

  var footerEl = document.getElementById("footer");
  var srcAttr = footerEl ? footerEl.getAttribute("data-src") : null;
  var footerSrc = srcAttr || (base || "") + "/html/_footer.html";
  console.debug("[footer-load] footer src:", footerSrc);
  fetch(footerSrc)
    .then(function (r) {
      return r.text();
    })
    .then(function (html) {
      if (footerEl) {
        footerEl.innerHTML = html;
      } else {
        document.body.insertAdjacentHTML("beforeend", html);
      }

      // Fix root-relative paths inside the footer (so /images/... becomes /repo/images/... when hosted under a repo)
      try {
        var footer = document.querySelector(".site-footer");
        if (footer) {
          footer.querySelectorAll('[href^="/"]').forEach(function (el) {
            var h = el.getAttribute("href");
            el.setAttribute("href", (base || "") + h);
          });
          footer.querySelectorAll('[src^="/"]').forEach(function (el) {
            var s = el.getAttribute("src");
            el.setAttribute("src", (base || "") + s);
          });
        }
      } catch (e) {}

      // Fill dynamic values if SITE is present
      try {
        if (window.SITE && SITE.company) {
          var phoneEls = document.querySelectorAll(".js-footer-phone");
          phoneEls.forEach(function (el) {
            el.textContent = SITE.company.phone || el.textContent;
          });
        }
      } catch (e) {
        // ignore
      }

      // Set current year
      var yearEls = document.querySelectorAll(".js-footer-year");
      yearEls.forEach(function (el) {
        el.textContent = new Date().getFullYear();
      });

      // Simple behavior: smooth scroll for internal links
      document
        .querySelectorAll('.site-footer a[href^="#"]')
        .forEach(function (a) {
          a.addEventListener("click", function (e) {
            e.preventDefault();
            var target = document.querySelector(a.getAttribute("href"));
            if (target) target.scrollIntoView({ behavior: "smooth" });
          });
        });
    })
    .catch(function (err) {
      console.error("[footer-load] failed:", err);
      if (footerEl) {
        footerEl.innerHTML =
          '<div class="container"><p class="muted">Footer failed to load.</p></div>';
      }
    });
});
