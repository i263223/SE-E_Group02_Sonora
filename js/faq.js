document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');
  const searchToggle = document.querySelector('.search-toggle');
  const searchPanel = document.getElementById('search-panel');
  const searchInput = searchPanel?.querySelector('.search-input');
  const searchForm = document.getElementById('faq-search-form');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  // Accordion expand/collapse
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      item.classList.toggle('is-open', !isExpanded);
    });
  });

  // Search toggle
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

  // Filter & open matching FAQ on search
  if (searchForm && searchInput) {
    const filterFaq = (query) => {
      const term = query.trim().toLowerCase();
      faqItems.forEach((item) => {
        const trigger = item.querySelector('.faq-trigger');
        const text = item.textContent.toLowerCase();
        const matches = !term || text.includes(term);
        item.hidden = !matches;

        if (term && matches && trigger) {
          trigger.setAttribute('aria-expanded', 'true');
          item.classList.add('is-open');
        } else if (!term && trigger) {
          trigger.setAttribute('aria-expanded', 'false');
          item.classList.remove('is-open');
        }
      });
    };

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      filterFaq(searchInput.value);
    });

    searchInput.addEventListener('input', () => {
      filterFaq(searchInput.value);
    });
  }

  // Mobile navigation toggle
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileNav.hidden = isExpanded;
    });
  }
});
