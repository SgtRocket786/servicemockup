// Enhanced client-side admin CRUD with richer editing (contenteditable, image preview, tags, autosave)
(function () {
  function getBasePrefix() {
    var parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts[0].indexOf(".") !== -1) return "";
    if (parts[0] === "html") return "";
    return "/" + parts[0];
  }
  var base = getBasePrefix();

  var posts = [];
  var editingIndex = -1;
  var AUTOSAVE_KEY = "admin-draft";
  // API base (can be set from window.API_BASE) - default to same origin
  var API_BASE = window.API_BASE || "";

  function q(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  async function load() {
    try {
      // try API first
      if (API_BASE !== undefined && API_BASE !== null) {
        var r = await fetch(API_BASE + "/api/posts");
        if (r.ok) {
          posts = await r.json();
          render();
          return;
        }
      }
    } catch (err) {
      console.warn(
        "API posts fetch failed, falling back to local posts.json",
        err
      );
    }
    var r2 = await fetch((base || "") + "/html/portfolio/posts.json");
    posts = await r2.json();
    render();
  }

  function render() {
    var body = q("#posts-body");
    body.innerHTML = "";
    posts.forEach(function (p, i) {
      var tr = document.createElement("tr");
      var tagsHtml = (p.tags || [])
        .map(function (t) {
          return '<span class="tag">' + escapeHtml(t) + "</span>";
        })
        .join(" ");
      tr.innerHTML = `
        <td>${p.thumb ? '<img src="' + p.thumb + '"/>' : ""}</td>
        <td>
          <div class="title-row">${escapeHtml(p.title || "")}</div>
          <div class="muted small">${tagsHtml}</div>
        </td>
        <td>${escapeHtml(p.caption || "")}</td>
        <td>${escapeHtml(p.date || "")}</td>
        <td>
          <button class="btn btn-sm btn-secondary edit" data-i="${i}">Edit</button>
          <button class="btn btn-sm btn-secondary delete" data-i="${i}">Delete</button>
        </td>
      `;
      body.appendChild(tr);
    });
    // wire actions
    qa(".edit").forEach(function (b) {
      b.addEventListener("click", onEdit);
    });
    qa(".delete").forEach(function (b) {
      b.addEventListener("click", onDelete);
    });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>\"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function onEdit(e) {
    var i = Number(e.currentTarget.dataset.i);
    editingIndex = i;
    openModal("Edit Post", posts[i]);
  }

  function onDelete(e) {
    var i = Number(e.currentTarget.dataset.i);
    if (!confirm("Delete this post?")) return;
    var post = posts[i] || {};
    // call API if available and post has an id
    if (post._id && API_BASE) {
      fetch(API_BASE + "/api/posts/" + post._id, { method: "DELETE" })
        .then(function (r) {
          posts.splice(i, 1);
          render();
        })
        .catch(function () {
          posts.splice(i, 1);
          render();
        });
    } else {
      posts.splice(i, 1);
      render();
    }
  }

  function toDataURL(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        resolve(fr.result);
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  // Upload files to server /api/uploads - returns array of uploaded file URLs
  async function uploadFiles(files) {
    if (!files || files.length === 0) return [];
    try {
      var fd = new FormData();
      files.forEach(function (f) {
        fd.append("files", f, f.name);
      });
      var r = await fetch(API_BASE + "/api/uploads", {
        method: "POST",
        body: fd,
      });
      if (!r.ok) throw new Error("upload failed");
      var json = await r.json();
      return (json.uploaded || []).map(function (u) {
        return u.url;
      });
    } catch (err) {
      console.warn("Upload failed, falling back to base64", err);
      // fallback: convert to data URLs
      return Promise.all(
        Array.from(files).map(function (f) {
          return toDataURL(f);
        })
      );
    }
  }

  function updateLivePreview() {
    var preview = q("#live-preview");
    var form = q("#post-form");
    var title = form.title.value || "Untitled";
    var thumb = form.thumb.value || "";
    var editor = q("#editor");
    var html = "<h3>" + escapeHtml(title) + "</h3>";
    if (thumb) {
      html +=
        '<img src="' +
        thumb +
        '" style="max-width:100%;height:auto;border-radius:6px;margin-bottom:0.5rem;"/>';
    }
    html += editor.innerHTML;
    preview.innerHTML = html;
  }

  function openModal(title, post) {
    q("#modal").classList.add("open");
    q("#modal-title").textContent = title;
    var form = q("#post-form");
    form.slug.value = (post && post.slug) || "";
    form.title.value = (post && post.title) || "";
    form.thumb.value = (post && post.thumb) || "";
    form.date.value = (post && post.date) || "";
    form.caption.value = (post && post.caption) || "";
    form.excerpt.value = (post && post.excerpt) || "";
    form.tags.value = (post && (post.tags || []).join(", ")) || "";
    form.gallery.value = (post && (post.gallery || []).join(", ")) || "";
    var editor = q("#editor");
    editor.innerHTML = (post && post.content) || (post && post.excerpt) || "";
    // thumb preview
    var img = q("#thumb-preview-img");
    img.src = form.thumb.value || "";
    updateLivePreview();
    // restore draft if exists and creating new
    if (!post || Object.keys(post).length === 0) {
      var draft = localStorage.getItem(AUTOSAVE_KEY);
      if (draft) {
        try {
          var d = JSON.parse(draft);
          if (d && d.title) {
            form.title.value = d.title;
            editor.innerHTML = d.content || editor.innerHTML;
            form.slug.value = d.slug || form.slug.value;
            form.excerpt.value = d.excerpt || form.excerpt.value;
            form.tags.value = d.tags || form.tags.value;
            updateLivePreview();
          }
        } catch (er) {
          /* ignore */
        }
      }
    }
  }

  function closeModal() {
    q("#modal").classList.remove("open");
    editingIndex = -1;
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var editor = q("#editor");
    var tags = form.tags.value
      .split(",")
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean);
    // collect gallery urls from gallery-list images
    var gallery = qa("#gallery-list img").map(function (img) {
      return img.src;
    });
    // before/after pairs removed — admin may embed before/after images in content or gallery

    var obj = {
      slug: form.slug.value.trim(),
      title: form.title.value.trim(),
      thumb: form.thumb.value.trim(),
      date: form.date.value,
      caption: form.caption.value.trim(),
      excerpt: form.excerpt.value.trim(),
      content: editor.innerHTML.trim(),
      tags: tags,
      gallery: gallery,
      // beforeAfter intentionally omitted
    };
    if (!obj.slug) {
      alert("Slug required");
      return;
    }
    // if we have API, persist to server
    if (API_BASE) {
      (async function () {
        try {
          var res;
          if (
            editingIndex >= 0 &&
            posts[editingIndex] &&
            posts[editingIndex]._id
          ) {
            // update
            res = await fetch(
              API_BASE + "/api/posts/" + posts[editingIndex]._id,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(obj),
              }
            );
            var updated = await res.json();
            posts[editingIndex] = updated;
          } else {
            // create
            res = await fetch(API_BASE + "/api/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(obj),
            });
            var created = await res.json();
            posts.unshift(created);
          }
          render();
        } catch (err) {
          console.error("Failed to save via API, falling back to local", err);
          if (editingIndex >= 0) posts[editingIndex] = obj;
          else posts.unshift(obj);
          render();
        }
      })();
    } else {
      // keep local posts array in sync
      if (editingIndex >= 0) posts[editingIndex] = obj;
      else posts.unshift(obj);
      render();
    }
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch (e) {}
    closeModal();
    render();
  }

  function downloadJSON() {
    var blob = new Blob([JSON.stringify(posts, null, 2)], {
      type: "application/json",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "posts.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function wireEditorToolbar() {
    qa(".editor-toolbar button").forEach(function (b) {
      b.addEventListener("click", function () {
        var cmd = b.dataset.cmd;
        if (cmd === "createLink") {
          var url = prompt("Enter URL");
          if (!url) return;
          document.execCommand("createLink", false, url);
        } else if (cmd === "insertImage") {
          // create a temporary file input
          var fi = document.createElement("input");
          fi.type = "file";
          fi.accept = "image/*";
          fi.addEventListener("change", function () {
            var f = fi.files[0];
            if (!f) return;
            toDataURL(f).then(function (data) {
              document.execCommand("insertImage", false, data);
              updateLivePreview();
            });
          });
          fi.click();
        } else {
          document.execCommand(cmd, false, null);
        }
        updateLivePreview();
      });
    });
  }

  // autosave draft every 3 seconds while modal is open
  var autosaveTimer = null;
  function startAutosave() {
    stopAutosave();
    autosaveTimer = setInterval(function () {
      var form = q("#post-form");
      if (!form) return;
      var draft = {
        slug: form.slug.value,
        title: form.title.value,
        excerpt: form.excerpt.value,
        content: q("#editor").innerHTML,
        tags: form.tags.value,
      };
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
      } catch (e) {}
    }, 3000);
  }
  function stopAutosave() {
    if (autosaveTimer) {
      clearInterval(autosaveTimer);
      autosaveTimer = null;
    }
  }

  // init
  document.addEventListener("DOMContentLoaded", function () {
    load().catch(function (e) {
      console.error("Failed to load posts.json", e);
      alert("Failed to load posts.json (check console)");
    });
    q("#btn-new").addEventListener("click", function () {
      openModal("Create Post", {});
      startAutosave();
    });
    q("#btn-download").addEventListener("click", downloadJSON);
    q("#btn-cancel").addEventListener("click", function () {
      closeModal();
      stopAutosave();
    });
    q("#btn-close").addEventListener("click", function () {
      closeModal();
      stopAutosave();
    });
    q("#post-form").addEventListener("submit", function (e) {
      onSubmit(e);
      stopAutosave();
    });
    q("#modal").addEventListener("click", function (e) {
      if (e.target.id === "modal") {
        closeModal();
        stopAutosave();
      }
    });

    // thumb file upload handling
    var thumbFile = q("#thumb-file");
    if (thumbFile) {
      thumbFile.addEventListener("change", function () {
        var f = thumbFile.files[0];
        if (!f) return;
        // try server upload first
        uploadFiles([f])
          .then(function (urls) {
            var url = (urls && urls[0]) || "";
            var form = q("#post-form");
            form.thumb.value = url || "";
            q("#thumb-preview-img").src = url || "";
            // if upload returned nothing, fallback to base64 for preview
            if (!url) {
              toDataURL(f).then(function (data) {
                form.thumb.value = data;
                q("#thumb-preview-img").src = data;
                updateLivePreview();
              });
            } else updateLivePreview();
          })
          .catch(function () {
            toDataURL(f).then(function (data) {
              var form = q("#post-form");
              form.thumb.value = data;
              q("#thumb-preview-img").src = data;
              updateLivePreview();
            });
          });
      });
    }

    // gallery multiple files handling (client-side base64 for now)
    var galleryFiles = q("#gallery-files");
    if (galleryFiles) {
      galleryFiles.addEventListener("change", function () {
        var files = Array.from(galleryFiles.files || []);
        var list = q("#gallery-list");
        if (files.length === 0) return;
        // upload files to server and append returned urls
        uploadFiles(files)
          .then(function (urls) {
            urls.forEach(function (u) {
              var img = document.createElement("img");
              img.src = u;
              img.style.maxWidth = "120px";
              img.style.margin = "4px";
              img.style.borderRadius = "6px";
              img.title = "Click to remove";
              img.addEventListener("click", function () {
                img.remove();
                updateLivePreview();
              });
              list.appendChild(img);
            });
            updateLivePreview();
          })
          .catch(function () {
            // fallback to base64 previews
            files.forEach(function (f) {
              toDataURL(f).then(function (data) {
                var img = document.createElement("img");
                img.src = data;
                img.style.maxWidth = "120px";
                img.style.margin = "4px";
                img.style.borderRadius = "6px";
                img.title = "Click to remove";
                img.addEventListener("click", function () {
                  img.remove();
                  updateLivePreview();
                });
                list.appendChild(img);
                updateLivePreview();
              });
            });
          });
        galleryFiles.value = "";
      });
    }

    // Before/After UI was removed — admin may place before/after images inside content or gallery manually

    // wire editor toolbar
    wireEditorToolbar();

    // live preview updates on input
    qa("#post-form input, #post-form textarea").forEach(function (el) {
      el.addEventListener("input", updateLivePreview);
    });
    q("#editor").addEventListener("input", updateLivePreview);

    // preview button (bring focus to preview)
    q("#btn-preview").addEventListener("click", function (e) {
      e.preventDefault();
      updateLivePreview();
      q("#live-preview").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    // if modal opened via edit we start autosave too
    // listen for modal open mutation as a simple fallback
    var observer = new MutationObserver(function (mut) {
      mut.forEach(function (m) {
        if (m.type === "attributes" && m.target.id === "modal") {
          if (m.target.classList.contains("open")) startAutosave();
          else stopAutosave();
        }
      });
    });
    observer.observe(q("#modal"), { attributes: true });
  });
})();
