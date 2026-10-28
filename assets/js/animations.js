/* ============================================================
   SAN BARTOLOMÉ · Animaciones y comportamiento
   ============================================================ */

// --- NAVBAR: se oscurece al hacer scroll ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// --- MENÚ MOBILE ---
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');
  navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});
// Cierra el menú al hacer click en un link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// --- SCROLL REVEAL ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- SMOOTH SCROLL para navegación interna ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72; // altura del navbar
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// --- CARRUSEL ---
document.addEventListener('DOMContentLoaded', function () {
  const track        = document.getElementById('carouselTrack');
  const btnPrev      = document.getElementById('carouselPrev');
  const btnNext      = document.getElementById('carouselNext');
  const dotsWrap     = document.getElementById('carouselDots');
  const carouselEl   = document.getElementById('carousel');

  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  if (!slides.length) return;

  let current  = 0;
  let timer    = null;

  // Crear dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className   = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Ir a imagen ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });

  function updateDots() {
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    updateDots();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  btnNext && btnNext.addEventListener('click', function (e) {
    e.stopPropagation();
    next();
    resetTimer();
  });

  btnPrev && btnPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    prev();
    resetTimer();
  });

  function startTimer() { timer = setInterval(next, 4500); }
  function resetTimer()  { clearInterval(timer); startTimer(); }

  // Swipe en mobile
  let touchX = 0;
  carouselEl.addEventListener('touchstart', function (e) {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  carouselEl.addEventListener('touchend', function (e) {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetTimer(); }
  });

  startTimer();
});

// --- GALERÍA / COLLAGE CLASIFICADO Y LIGHTBOX ---
document.addEventListener('DOMContentLoaded', function () {
  const filterBtns    = Array.from(document.querySelectorAll('.gallery-filter-btn'));
  const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
  const moreWrap      = document.getElementById('galleryMoreWrap');
  const btnMore       = document.getElementById('btnGalleryMore');
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxCat   = document.getElementById('lightboxCat');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const btnClose      = document.getElementById('lightboxClose');
  const btnPrev       = document.getElementById('lightboxPrev');
  const btnNext       = document.getElementById('lightboxNext');

  if (!galleryItems.length) return;

  let currentFilter = 'all';
  let expandedAll   = false;

  function applyGalleryState() {
    galleryItems.forEach(item => {
      const category = item.getAttribute('data-category');
      const isExtra  = item.classList.contains('gallery-item--extra');
      const matches  = currentFilter === 'all' || category === currentFilter;

      item.classList.toggle('is-hidden', !matches);
      if (currentFilter === 'all') {
        item.classList.toggle('is-collapsed', isExtra && !expandedAll);
      } else {
        item.classList.remove('is-collapsed');
      }
    });

    if (moreWrap && btnMore) {
      if (currentFilter === 'all') {
        moreWrap.classList.remove('is-hidden');
        btnMore.querySelector('span').textContent = expandedAll
          ? 'Mostrar menos fotos'
          : 'Ver las ' + galleryItems.length + ' fotos de la galería';
      } else {
        moreWrap.classList.add('is-hidden');
      }
    }
  }

  // Inicializar estado
  applyGalleryState();

  // Botón Ver más / Mostrar menos en pestaña "Todas"
  if (btnMore) {
    btnMore.addEventListener('click', () => {
      expandedAll = !expandedAll;
      applyGalleryState();
      if (!expandedAll) {
        const galSection = document.getElementById('galeria');
        if (galSection) {
          const top = galSection.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  }

  // Filtrado por categoría (Todas / Fachada / Interior / Conciertos)
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.getAttribute('data-filter');
      filterBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      applyGalleryState();
    });
  });

  // Lightbox para ampliar fotos
  let visibleItems = [];
  let activeIndex  = 0;

  function updateVisibleItems() {
    visibleItems = galleryItems.filter(item => !item.classList.contains('is-hidden'));
  }

  function showLightbox(index) {
    updateVisibleItems();
    if (!visibleItems.length) return;
    activeIndex = ((index % visibleItems.length) + visibleItems.length) % visibleItems.length;
    const item  = visibleItems[activeIndex];
    const img   = item.querySelector('img');
    const cat   = item.querySelector('.gallery-cat');
    const title = item.querySelector('.gallery-title');

    lightboxImg.src = img ? img.src : '';
    lightboxImg.alt = img ? img.alt : '';
    lightboxCat.textContent   = cat ? cat.textContent : '';
    lightboxTitle.textContent = title ? title.textContent : '';

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      updateVisibleItems();
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) showLightbox(idx);
    });
  });

  if (btnClose) btnClose.addEventListener('click', closeLightbox);
  if (btnPrev)  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(activeIndex - 1); });
  if (btnNext)  btnNext.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(activeIndex + 1); });

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') showLightbox(activeIndex + 1);
    if (e.key === 'ArrowLeft')  showLightbox(activeIndex - 1);
  });
});
