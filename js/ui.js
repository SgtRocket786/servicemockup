document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".js-phone")
    .forEach((e) => (e.textContent = SITE.company.phone));
});
