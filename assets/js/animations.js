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