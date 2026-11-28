document.addEventListener('DOMContentLoaded', () => {
  const supportTrigger = document.querySelector('.nav-dropdown-trigger');
  const supportMenu = document.getElementById('support-menu');
  const searchToggle = document.querySelector('.search-toggle');
  const searchPanel = document.getElementById('search-panel');
  const searchInput = searchPanel?.querySelector('.search-input');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  // Support dropdown toggle
  if (supportTrigger && supportMenu) {
    supportTrigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isExpanded = supportTrigger.getAttribute('aria-expanded') === 'true';
      supportTrigger.setAttribute('aria-expanded', String(!isExpanded));
      supportMenu.hidden = isExpanded;
    });

    document.addEventListener('click', (event) => {
      if (!supportTrigger.contains(event.target) && !supportMenu.contains(event.target)) {
        supportTrigger.setAttribute('aria-expanded', 'false');
        supportMenu.hidden = true;
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        supportTrigger.setAttribute('aria-expanded', 'false');
        supportMenu.hidden = true;
      }
    });
  }

  // Search bar toggle
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

  // Mobile menu toggle
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileNav.hidden = isExpanded;
    });
  }
});
