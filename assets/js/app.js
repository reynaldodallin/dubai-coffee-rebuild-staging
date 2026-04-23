/* ═══════════════════════════════════════════════════
   Dubai Coffee Directory — App JS
   NO localStorage/sessionStorage — in-memory only
   ═══════════════════════════════════════════════════ */

// ── State ──
let currentTheme = 'dark'; // Default: dark mode
let currentPage = 1;
const PER_PAGE = 12;

// ── Theme Persistence via cookie ──
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
}

function getPreferredTheme() {
  const saved = getCookie('dcg-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark'; // Default to dark
}

// ── Theme Toggle ──
function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  setCookie('dcg-theme', theme, 365);
  lucide.createIcons();
}

function toggleTheme() {
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// ── Navigation ──
function initNav() {
  const hamburger = document.getElementById('navHamburger');
  const links = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  const close = document.getElementById('navClose');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      links.classList.add('open');
      if (overlay) overlay.classList.add('visible');
    });
  }
  if (close) {
    close.addEventListener('click', () => {
      links.classList.remove('open');
      if (overlay) overlay.classList.remove('visible');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      links.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
}

// ── Scroll to Top ──
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Fade-in Observer ──
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ── Stars HTML ──
function starsHTML(rating) {
  let html = '<span class="stars">';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '<span class="star full">&#9733;</span>';
    else if (i === full && half) html += '<span class="star half">&#9733;</span>';
    else html += '<span class="star">&#9733;</span>';
  }
  html += '</span>';
  return html;
}

// ── Card HTML ──
function cafeCardHTML(cafe, basePath) {
  basePath = basePath || '';
  const catSlug = CATEGORY_MAP[cafe.category] || 'specialty';
  return `<article class="listing-card">
  <a href="${basePath}listing/${cafe.slug}.html" class="card-link">
    <div class="card-image">
      <img src="${basePath}assets/images/listings/${cafe.slug}.webp" alt="${cafe.name}" loading="lazy" width="400" height="300"
        onerror="this.style.display='none'">
      <span class="card-category-badge">${cafe.category}</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${cafe.name}</h3>
      <div class="card-rating">
        ${starsHTML(cafe.rating)}
        <span class="rating-number">${cafe.rating}</span>
        <span class="review-count">(${cafe.reviews.toLocaleString()} reviews)</span>
      </div>
      <p class="card-address"><i data-lucide="map-pin"></i> ${cafe.address}</p>
      <div class="card-tags">${cafe.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
  </a>
</article>`;
}

// ── Sponsored Card HTML ──
function sponsoredCardHTML() {
  return `<article class="listing-card" style="border-color: var(--color-accent);">
  <div class="card-image" style="background: linear-gradient(135deg, var(--color-bg-alt), var(--color-border)); display: flex; align-items: center; justify-content: center;">
    <span class="card-sponsored-badge">Sponsored</span>
    <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
      <i data-lucide="coffee" style="width: 40px; height: 40px; margin: 0 auto 0.5rem; opacity: 0.4;"></i>
      <p style="font-size: 0.8125rem;">Your cafe here</p>
    </div>
  </div>
  <div class="card-body">
    <h3 class="card-title">Promote Your Cafe</h3>
    <p style="font-size: 0.8125rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">Reach thousands of coffee lovers in Dubai with a featured listing.</p>
    <a href="contact.html" class="btn btn-gold btn-block" style="font-size: 0.8125rem;">Learn More</a>
  </div>
</article>`;
}

// ── Listing Page Logic ──
function initListingsPage() {
  const grid = document.getElementById('listingsGrid');
  const countEl = document.getElementById('listingsCount');
  const paginationEl = document.getElementById('pagination');
  const sortSelect = document.getElementById('sortSelect');
  const searchInput = document.getElementById('listingSearch');

  if (!grid) return;

  const basePath = getBasePath();

  function getFilters() {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    return {
      categories: params.getAll('category'),
      areas: params.getAll('area'),
      minRating: parseFloat(params.get('rating')) || 0,
      sort: params.get('sort') || 'rating',
      page: parseInt(params.get('page')) || 1,
      search: params.get('q') || ''
    };
  }

  function setFilters(filters) {
    const params = new URLSearchParams();
    filters.categories.forEach(c => params.append('category', c));
    filters.areas.forEach(a => params.append('area', a));
    if (filters.minRating) params.set('rating', filters.minRating);
    if (filters.sort !== 'rating') params.set('sort', filters.sort);
    if (filters.page > 1) params.set('page', filters.page);
    if (filters.search) params.set('q', filters.search);
    window.location.hash = params.toString();
  }

  function filterAndSort() {
    const f = getFilters();
    let cafes = [...CAFES_DATA];

    // Search
    if (f.search) {
      const q = f.search.toLowerCase();
      cafes = cafes.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.address.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (f.categories.length) {
      cafes = cafes.filter(c => {
        const slug = CATEGORY_MAP[c.category];
        return f.categories.includes(slug);
      });
    }

    // Area filter
    if (f.areas.length) {
      cafes = cafes.filter(c => f.areas.includes(c.area));
    }

    // Rating filter
    if (f.minRating) {
      cafes = cafes.filter(c => c.rating >= f.minRating);
    }

    // Sort
    if (f.sort === 'reviews') {
      cafes.sort((a, b) => b.reviews - a.reviews);
    } else if (f.sort === 'name') {
      cafes.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      cafes.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }

    return { cafes, page: f.page, filters: f };
  }

  function render() {
    const { cafes, page, filters } = filterAndSort();
    const totalPages = Math.ceil(cafes.length / PER_PAGE);
    const start = (page - 1) * PER_PAGE;
    const pageCafes = cafes.slice(start, start + PER_PAGE);

    // Insert sponsored card at position 3
    let html = '';
    pageCafes.forEach((cafe, i) => {
      if (i === 2 && page === 1) html += sponsoredCardHTML();
      html += cafeCardHTML(cafe, basePath);
    });

    if (!pageCafes.length) {
      html = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-text-muted);">No coffee shops found matching your filters.</div>';
    }

    grid.innerHTML = html;
    if (countEl) countEl.textContent = `${cafes.length} coffee shop${cafes.length !== 1 ? 's' : ''} found`;

    // Pagination
    if (paginationEl && totalPages > 1) {
      let pHtml = `<button class="pagination__btn" onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>Previous</button>`;
      for (let i = 1; i <= totalPages; i++) {
        pHtml += `<button class="pagination__btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
      }
      pHtml += `<button class="pagination__btn" onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Next</button>`;
      paginationEl.innerHTML = pHtml;
      paginationEl.style.display = 'flex';
    } else if (paginationEl) {
      paginationEl.style.display = 'none';
    }

    // Sync UI
    if (sortSelect) sortSelect.value = filters.sort;
    if (searchInput) searchInput.value = filters.search;

    // Sync checkboxes
    document.querySelectorAll('[data-filter-category]').forEach(cb => {
      cb.checked = filters.categories.includes(cb.value);
    });
    document.querySelectorAll('[data-filter-area]').forEach(cb => {
      cb.checked = filters.areas.includes(cb.value);
    });
    document.querySelectorAll('[data-filter-rating]').forEach(rb => {
      rb.checked = parseFloat(rb.value) === filters.minRating;
    });

    lucide.createIcons();
  }

  window.changePage = function(p) {
    const f = getFilters();
    f.page = p;
    setFilters(f);
  };

  // Event listeners
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const f = getFilters();
      f.sort = sortSelect.value;
      f.page = 1;
      setFilters(f);
    });
  }

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const f = getFilters();
        f.search = searchInput.value;
        f.page = 1;
        setFilters(f);
      }, 300);
    });
  }

  // Filter checkboxes
  document.querySelectorAll('[data-filter-category]').forEach(cb => {
    cb.addEventListener('change', () => {
      const f = getFilters();
      const checked = [...document.querySelectorAll('[data-filter-category]:checked')].map(c => c.value);
      f.categories = checked;
      f.page = 1;
      setFilters(f);
    });
  });

  document.querySelectorAll('[data-filter-area]').forEach(cb => {
    cb.addEventListener('change', () => {
      const f = getFilters();
      const checked = [...document.querySelectorAll('[data-filter-area]:checked')].map(c => c.value);
      f.areas = checked;
      f.page = 1;
      setFilters(f);
    });
  });

  document.querySelectorAll('[data-filter-rating]').forEach(rb => {
    rb.addEventListener('change', () => {
      const f = getFilters();
      f.minRating = parseFloat(document.querySelector('[data-filter-rating]:checked').value) || 0;
      f.page = 1;
      setFilters(f);
    });
  });

  // Mobile filter toggle
  const filterToggle = document.getElementById('filterToggle');
  const sidebar = document.getElementById('filterSidebar');
  const filterClose = document.getElementById('filterClose');
  const filterOverlay = document.getElementById('filterOverlay');

  if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      if (filterOverlay) filterOverlay.classList.add('visible');
    });
  }
  if (filterClose && sidebar) {
    filterClose.addEventListener('click', () => {
      sidebar.classList.remove('open');
      if (filterOverlay) filterOverlay.classList.remove('visible');
    });
  }
  if (filterOverlay && sidebar) {
    filterOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      filterOverlay.classList.remove('visible');
    });
  }

  // Apply button in mobile filter
  const applyBtn = document.getElementById('filterApply');
  if (applyBtn && sidebar) {
    applyBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      if (filterOverlay) filterOverlay.classList.remove('visible');
    });
  }

  window.addEventListener('hashchange', render);
  render();
}

// ── Category Page Logic ──
function initCategoryPage() {
  const grid = document.getElementById('categoryGrid');
  const countEl = document.getElementById('categoryCount');
  if (!grid) return;

  const categorySlug = grid.dataset.category;
  const categoryName = CATEGORY_NAMES[categorySlug];
  const basePath = getBasePath();

  let cafes = CAFES_DATA.filter(c => CATEGORY_MAP[c.category] === categorySlug);
  cafes.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  if (countEl) countEl.textContent = `${cafes.length} listings`;

  grid.innerHTML = cafes.map(c => cafeCardHTML(c, basePath)).join('');
  lucide.createIcons();
}

// ── Leaflet Map ──
function initMap() {
  const mapEl = document.getElementById('listingMap');
  if (!mapEl || typeof L === 'undefined') return;

  const lat = parseFloat(mapEl.dataset.lat);
  const lng = parseFloat(mapEl.dataset.lng);
  if (isNaN(lat) || isNaN(lng)) return;

  mapEl.innerHTML = '';
  const map = L.map(mapEl).setView([lat, lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  L.marker([lat, lng]).addTo(map);

  // Fix map display in case container was hidden
  setTimeout(() => map.invalidateSize(), 200);
}

// ── Home Page Search ──
function initHomeSearch() {
  const form = document.getElementById('heroSearchForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const q = input ? input.value.trim() : '';
    if (q) {
      window.location.href = 'listings.html#q=' + encodeURIComponent(q);
    } else {
      window.location.href = 'listings.html';
    }
  });
}

// ── Share Button ──
function initShare() {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;
  shareBtn.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href });
    } else {
      // Fallback: copy to clipboard
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      shareBtn.textContent = 'Link Copied!';
      setTimeout(() => { shareBtn.innerHTML = '<i data-lucide="share-2"></i> Share'; lucide.createIcons(); }, 2000);
    }
  });
}

// ── Get base path ──
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/listing/') || path.includes('/category/')) return '../';
  return '';
}

// ── Contact Form ──
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme (default: dark)
  currentTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  initNav();
  initScrollTop();
  initFadeIn();
  initHomeSearch();
  initListingsPage();
  initCategoryPage();
  initMap();
  initShare();
  initContactForm();

  // Init Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();
});
