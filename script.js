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
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const resultTriggers = [...document.querySelectorAll('.result-trigger')];
let lightboxLastFocus = null;

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxDetail) return;
  lightboxLastFocus = trigger;
  lightboxImage.src = trigger.dataset.lightboxSrc || '';
  lightboxImage.alt = trigger.querySelector('img')?.alt || '';
  lightboxTitle.textContent = trigger.dataset.lightboxTitle || '';
  lightboxDetail.textContent = trigger.dataset.lightboxDetail || '';
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

resultTriggers.forEach((trigger) => trigger.addEventListener('click', () => openLightbox(trigger)));
lightbox?.addEventListener('click', (event) => {
  if (event.target.closest('[data-lightbox-close]')) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
});
