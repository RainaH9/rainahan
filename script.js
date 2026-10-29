// Smooth scroll with offset for the fixed nav
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const navToggle = document.getElementById('navToggle');
const navLinksWrap = document.querySelector('.nav-links');
const sections = document.querySelectorAll('main section[id]');
const allHashLinks = document.querySelectorAll('a[href^="#"]');

function getNavOffset(){
  return nav.getBoundingClientRect().height + 12;
}

allHashLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - getNavOffset();
    const behavior = document.documentElement.classList.contains('smooth-scroll-enabled') ? 'auto' : 'smooth';

    window.scrollTo({
      top,
      behavior
    });

    // close mobile menu after choosing a link
    navLinksWrap.classList.remove('open');
  });
});

// Mobile nav toggle
navToggle.addEventListener('click', () => {
  navLinksWrap.classList.toggle('open');
});

// Give the nav a subtle border once the page scrolls
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// Highlight the current section's nav link on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, {
  rootMargin: '-45% 0px -50% 0px',
  threshold: 0
});

sections.forEach(section => observer.observe(section));

// ---------------------------------------
// Reveal on scroll — fade + rise as elements enter view
// ---------------------------------------
const revealTargets = document.querySelectorAll('.section-head, .gallery-item, .award-card, .news-item');

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -60px 0px'
});

revealTargets.forEach(el => revealObserver.observe(el));

// ---------------------------------------
// Eased "drag" scroll — the page glides with a slight lag
// behind the actual scroll input, instead of jumping 1:1.
// Skipped entirely if the visitor prefers reduced motion.
// ---------------------------------------
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion){
  document.documentElement.classList.add('smooth-scroll-enabled');

  const smoothMain = document.querySelector('main');
  const scrollFiller = document.getElementById('scrollFiller');

  let current = window.scrollY;
  let target = window.scrollY;
  const ease = 0.075; // lower = slower / more drag, higher = snappier

  function setNavHeightVar(){
    document.documentElement.style.setProperty('--nav-h', `${nav.getBoundingClientRect().height}px`);
  }

  function syncFillerHeight(){
    scrollFiller.style.height = `${smoothMain.scrollHeight}px`;
  }

  setNavHeightVar();
  syncFillerHeight();

  window.addEventListener('resize', () => {
    setNavHeightVar();
    syncFillerHeight();
  });

  // Keep the scroll length in sync whenever content changes size
  // (images loading in, etc.)
  const resizeObserver = new ResizeObserver(syncFillerHeight);
  resizeObserver.observe(smoothMain);

  function driveScroll(){
    target = window.scrollY;
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.05) current = target;
    smoothMain.style.transform = `translate3d(0, ${-current}px, 0)`;
    requestAnimationFrame(driveScroll);
  }
  requestAnimationFrame(driveScroll);
}

