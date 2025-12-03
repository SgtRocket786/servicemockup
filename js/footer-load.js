document.addEventListener("DOMContentLoaded", function () {
  var footerEl = document.getElementById("footer");
  var srcAttr = footerEl ? footerEl.getAttribute("data-src") : null;
  var footerSrc = srcAttr || "html/_footer.html";
  console.debug("[footer-load] footer src:", footerSrc);
  function repoPrefixed(url) {
    try {
      var parts = location.pathname.split("/").filter(Boolean);
      var repo = parts[0] || "";
      if (!repo || repo === "html") return url;
      return "/" + repo + "/" + url.replace(/^\//, "");
    } catch (e) {
      return url;
    }
  }

  fetch(footerSrc)
    .then(function (r) {
      if (!r.ok) {
        var alt = repoPrefixed(footerSrc);
        if (alt !== footerSrc) {
          console.debug("[footer-load] retry with repo prefix:", alt);
          return fetch(alt).then(function (r2) {
            return r2.text();
          });
        }
      }
      return r.text();
    })
    .then(function (html) {
      if (footerEl) {
        footerEl.innerHTML = html;
      } else {
        document.body.insertAdjacentHTML("beforeend", html);
      }

      // No path rewriting — partial must use correct relative paths.

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
