document.documentElement.classList.add('js-ready');

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileAppointment = document.querySelector('.mobile-appointment');
const hero = document.querySelector('.hero');
const heroStage = document.querySelector('.hero-stage');
const portraitScene = document.querySelector('.portrait-scene');
const focusTabs = [...document.querySelectorAll('.focus-tab')];
const focusDescription = document.querySelector('.focus-description');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

function setMenu(open) {
  mobileMenu?.classList.toggle('open', open);
  menuButton?.classList.toggle('active', open);
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
}
menuButton?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu?.classList.contains('open')) {
    setMenu(false);
    menuButton.focus();
  }
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  if (hero) {
    new IntersectionObserver(([entry]) => {
      mobileAppointment?.classList.toggle('visible', !entry.isIntersecting && window.scrollY > 100);
      hero.classList.toggle('is-paused', !entry.isIntersecting);
    }, { threshold: 0 }).observe(hero);
  }
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

const focusCopy = {
  skin: 'Cildinizin dokusu ve ihtiyacına göre kişisel bir bakım planı.',
  balance: 'Yüzünüzün oranlarını birlikte değerlendiren, ölçülü bir yaklaşım.',
  expression: 'Mimiklerinizi ve size ait ifadeyi korumayı amaçlayan dokunuşlar.'
};

function selectFocus(index, moveFocus = false) {
  const selected = focusTabs[index];
  if (!selected || !hero || !focusDescription) return;
  hero.dataset.focus = selected.dataset.focus;
  focusDescription.textContent = focusCopy[selected.dataset.focus];
  focusDescription.setAttribute('aria-labelledby', selected.id);
  focusTabs.forEach((tab) => {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  if (moveFocus) selected.focus();
}

focusTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectFocus(index));
  tab.addEventListener('keydown', (event) => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % focusTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index + focusTabs.length - 1) % focusTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = focusTabs.length - 1;
    if (nextIndex !== undefined) {
      event.preventDefault();
      selectFocus(nextIndex, true);
    }
  });
});

let pointerFrame;
heroStage?.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches || event.pointerType === 'touch' || !portraitScene) return;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => {
    const bounds = portraitScene.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    portraitScene.style.setProperty('--light-x', x + '%');
    portraitScene.style.setProperty('--light-y', y + '%');
    heroStage.classList.add('is-pointing');
  });
});
heroStage?.addEventListener('pointerleave', () => {
  cancelAnimationFrame(pointerFrame);
  heroStage.classList.remove('is-pointing');
});
reducedMotion.addEventListener('change', () => {
  cancelAnimationFrame(pointerFrame);
  heroStage?.classList.remove('is-pointing');
});

const lightbox = document.querySelector('#result-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxDetail = document.querySelector('#lightbox-detail');
const lightboxKicker = document.querySelector('#lightbox-kicker');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const lightboxTriggers = [...document.querySelectorAll('[data-lightbox-src]')];
let lightboxLastFocus = null;

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxDetail) return;
  lightboxLastFocus = trigger;
  lightboxImage.src = trigger.dataset.lightboxSrc || '';
  lightboxImage.alt = trigger.querySelector('img')?.alt || '';
  lightboxTitle.textContent = trigger.dataset.lightboxTitle || '';
  lightboxDetail.textContent = trigger.dataset.lightboxDetail || '';
  if (lightboxKicker) lightboxKicker.textContent = trigger.dataset.lightboxKicker || 'ÖNCESİ / SONRASI';
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  requestAnimationFrame(() => lightbox.classList.add('is-open'));
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.classList.remove('is-open');
  document.body.classList.remove('lightbox-open');
  window.setTimeout(() => {
    if (!lightbox.classList.contains('is-open')) lightbox.hidden = true;
  }, 260);
  lightboxLastFocus?.focus();
}

lightboxTriggers.forEach((trigger) => trigger.addEventListener('click', () => openLightbox(trigger)));
lightbox?.addEventListener('click', (event) => {
  if (event.target.closest('[data-lightbox-close]')) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
});

const scrollBehavior = () => (reducedMotion.matches ? 'auto' : 'smooth');

document.querySelectorAll('[data-carousel]').forEach((root) => {
  const track = root.querySelector('.carousel-track');
  if (!track) return;
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');

  const stepSize = () => {
    const card = track.firstElementChild;
    if (!card) return track.clientWidth * 0.8;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const syncButtons = () => {
    const max = track.scrollWidth - track.clientWidth - 8;
    if (prev) prev.disabled = track.scrollLeft <= 8;
    if (next) next.disabled = track.scrollLeft >= max;
  };

  // Zorunlu scroll-snap, programatik smooth kaydırmayı iptal ettiği için adım boyunca kapatılır.
  let snapTimer;
  const stepBy = (direction) => {
    track.classList.add('is-stepping');
    track.scrollBy({ left: direction * stepSize(), behavior: scrollBehavior() });
    window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(() => track.classList.remove('is-stepping'), 620);
  };

  prev?.addEventListener('click', () => stepBy(-1));
  next?.addEventListener('click', () => stepBy(1));
  track.addEventListener('scroll', syncButtons, { passive: true });
  window.addEventListener('resize', syncButtons);
  syncButtons();

  let pointerId = null;
  let startX = 0;
  let startScroll = 0;
  let distance = 0;
  let suppressClick = false;

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    distance = 0;
  });

  track.addEventListener('pointermove', (event) => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    const delta = event.clientX - startX;
    if (!track.classList.contains('is-dragging')) {
      if (Math.abs(delta) < 5) return;
      track.classList.add('is-dragging');
      try { track.setPointerCapture(pointerId); } catch (error) { /* yok say */ }
    }
    distance = Math.abs(delta);
    track.scrollLeft = startScroll - delta;
  });

  const endDrag = (event) => {
    if (pointerId === null || (event && event.pointerId !== pointerId)) return;
    try { track.releasePointerCapture(pointerId); } catch (error) { /* yok say */ }
    pointerId = null;
    if (track.classList.contains('is-dragging')) {
      track.classList.remove('is-dragging');
      if (distance > 5) {
        suppressClick = true;
        window.setTimeout(() => { suppressClick = false; }, 0);
      }
    }
    syncButtons();
  };

  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('lostpointercapture', endDrag);
  track.addEventListener('dragstart', (event) => event.preventDefault());
  track.addEventListener('click', (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);
});

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && navSections.length) {
  const setActiveSection = (id) => {
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveSection(entry.target.id);
    });
  }, { rootMargin: '-50% 0px -49% 0px', threshold: 0 });
  navSections.forEach((section) => sectionObserver.observe(section));
}
