document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const contactToast = document.getElementById('contact-toast');
  const searchToggle = document.querySelector('.search-toggle');
  const searchPanel = document.getElementById('search-panel');
  const searchInput = searchPanel?.querySelector('.search-input');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  let toastTimeout;

  if (contactForm && contactToast) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      contactForm.reset();
      contactToast.hidden = false;
      contactToast.classList.add('is-visible');

      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        contactToast.classList.remove('is-visible');
        contactToast.hidden = true;
      }, 5000);
    });
  }

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', () => {
      const isExpanded = searchToggle.getAttribute('aria-expanded') === 'true';
      searchToggle.setAttribute('aria-expanded', String(!isExpanded));
      searchPanel.hidden = isExpanded;
      if (!isExpanded && searchInput) {
        searchInput.focus();
      }
    });
  }

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileNav.hidden = isExpanded;
    });
  }
});
