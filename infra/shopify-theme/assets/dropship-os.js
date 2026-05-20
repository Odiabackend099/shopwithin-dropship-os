(() => {
  const sticky = document.querySelector("[data-sticky-cta]");
  const form = document.querySelector(".product-form");
  const stickyButton = document.querySelector("[data-add-current]");
  if (!sticky || !form || !stickyButton) return;

  const onScroll = () => {
    sticky.classList.toggle("visible", window.scrollY > 420);
  };

  stickyButton.addEventListener("click", () => {
    const submit = form.querySelector("button[type='submit']");
    if (submit instanceof HTMLButtonElement) submit.click();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
