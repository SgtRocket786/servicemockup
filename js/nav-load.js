document.addEventListener("DOMContentLoaded", function () {
  // Compute a base prefix for project pages hosted under a repo (e.g. /repo)
  function getBasePrefix() {
    var parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "";
    // If first segment looks like a file (index.html) don't treat as repo
    if (parts[0].indexOf(".") !== -1) return "";
    // If the site is already under /html/, don't prefix with 'html' (would cause /html/html/...)
    if (parts[0] === "html") return "";
    return "/" + parts[0];
  }
  var base = getBasePrefix();

  var headerEl = document.getElementById("navbar");
  var srcAttr = headerEl ? headerEl.getAttribute("data-src") : null;
  var navbarSrc = srcAttr || (base || "") + "/html/_navbar.html";
  console.debug("[nav-load] navbar src:", navbarSrc);
  // Load the navbar partial and inject at the top of the body or into #navbar
  fetch(navbarSrc)
    .then(function (r) {
      return r.text();
    })
    .then(function (html) {
      if (headerEl) {
        headerEl.innerHTML = html;
      } else {
        document.body.insertAdjacentHTML("afterbegin", html);
      }

      // Fix any root-relative paths inside the injected partial (e.g. /css/, /images/)
      try {
        var header = document.querySelector(".header");
        if (header) {
          header.querySelectorAll('[href^="/"]').forEach(function (el) {
            var h = el.getAttribute("href");
            el.setAttribute("href", (base || "") + h);
          });
          header.querySelectorAll('[src^="/"]').forEach(function (el) {
            var s = el.getAttribute("src");
            el.setAttribute("src", (base || "") + s);
          });
        }
      } catch (e) {
        // ignore
      }

      // Wire up mobile menu toggle
      var scope = headerEl || document;
      var menuToggle = scope.querySelector(".menu-toggle");
      var nav = scope.querySelector(".nav");
      if (menuToggle && nav) {
        menuToggle.addEventListener("click", function () {
          menuToggle.classList.toggle("active");
          nav.classList.toggle("active");
        });
      }

      // Close mobile nav when a link is clicked
      (headerEl || document).querySelectorAll(".nav a").forEach(function (a) {
        a.addEventListener("click", function () {
          if (nav.classList.contains("active")) {
            nav.classList.remove("active");
            menuToggle.classList.remove("active");
          }
        });
      });

      // Mark active link based on current location (improved matching)
      var pagePath = location.pathname.replace(/\/index\.html$/i, "/");
      document.querySelectorAll(".nav a").forEach(function (a) {
        try {
          var url = new URL(a.href, location.href);
          var hrefPath = url.pathname.replace(/\/index\.html$/i, "/");

          // Skip hash-only or external links for active matching
          if (url.origin !== location.origin) return;
          if (url.hash && !url.pathname) return;

          // Exact match (normalized)
          if (hrefPath === pagePath) {
            // If the link contains a hash (same-page anchor), only mark active when the hash matches the current location.hash
            if (url.hash) {
              if (url.hash === location.hash) {
                a.classList.add("active");
              }
              return;
            }

            a.classList.add("active");
            return;
          }

          // Match by filename when pages may be served without the same base path
          var hrefFile = hrefPath.split("/").pop();
          var pageFile = pagePath.split("/").pop();
          if (hrefFile && pageFile && hrefFile === pageFile) {
            a.classList.add("active");
            return;
          }

          // Partial startsWith match for section links (e.g. /html/portfolio/ matches /html/portfolio/index.html)
          if (pagePath.indexOf(hrefPath) === 0 && hrefPath.length > 1) {
            a.classList.add("active");
            return;
          }
        } catch (e) {
          // ignore malformed URLs
        }
      });
    })
    .catch(function (err) {
      console.error("[nav-load] failed:", err);
      if (headerEl) {
        headerEl.innerHTML =
          '<div class="container"><p class="muted">Navbar failed to load.</p></div>';
      }
    });
});
