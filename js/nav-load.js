document.addEventListener("DOMContentLoaded", function () {
  var headerEl = document.getElementById("navbar");
  var srcAttr = headerEl ? headerEl.getAttribute("data-src") : null;
  var navbarSrc = srcAttr || "html/_navbar.html";
  console.debug("[nav-load] navbar src:", navbarSrc);
  // Load the navbar partial and inject at the top of the body or into #navbar
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

  fetch(navbarSrc)
    .then(function (r) {
      if (!r.ok) {
        // Try with repo prefix once (for GitHub Pages project sites)
        var alt = repoPrefixed(navbarSrc);
        if (alt !== navbarSrc) {
          console.debug("[nav-load] retry with repo prefix:", alt);
          return fetch(alt).then(function (r2) {
            return r2.text();
          });
        }
      }
      return r.text();
    })
    .then(function (html) {
      if (headerEl) {
        headerEl.innerHTML = html;
      } else {
        document.body.insertAdjacentHTML("afterbegin", html);
      }

      // No path rewriting — partial must use correct relative paths.

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
