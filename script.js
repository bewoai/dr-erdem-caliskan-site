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

function syncHeroVisibility() {
  hero?.classList.toggle('is-document-hidden', document.hidden);
}
document.addEventListener('visibilitychange', syncHeroVisibility);
syncHeroVisibility();

let lastScrollY = window.scrollY;
let revealHeaderUntil = 0;

function syncHeader() {
  if (!header) return;
  const y = Math.max(0, window.scrollY);
  const delta = y - lastScrollY;
  header.classList.toggle('scrolled', y > 20);

  // Asagi kaydirirken baslik cekilir, yukari kaydirirken hemen geri gelir.
  // Menu acikken, sayfa basindayken ve bir bag baglantisina tiklandiktan hemen
  // sonra baslik her zaman gorunur kalir.
  const menuOpen = mobileMenu?.classList.contains('open');
  if (menuOpen || y < 220 || Date.now() < revealHeaderUntil) {
    header.classList.remove('hidden');
  } else if (delta > 4) {
    header.classList.add('hidden');
  } else if (delta < -4) {
    header.classList.remove('hidden');
  }

  if (Math.abs(delta) > 1) lastScrollY = y;
}

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

// Sayfa ici baglantilar asagi kaydirdigi icin baslik kisa sure gorunur tutulur.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    revealHeaderUntil = Date.now() + 900;
    header?.classList.remove('hidden');
  });
});

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
const lightboxVideo = document.querySelector('#lightbox-video');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxDetail = document.querySelector('#lightbox-detail');
const lightboxKicker = document.querySelector('#lightbox-kicker');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const lightboxVisual = lightbox?.querySelector('.lightbox-visual');
const lightboxPrev = lightbox?.querySelector('[data-lightbox-prev]');
const lightboxNext = lightbox?.querySelector('[data-lightbox-next]');
const lightboxCount = document.querySelector('#lightbox-count');
const lightboxTriggers = [...document.querySelectorAll('[data-lightbox-src], [data-lightbox-video]')];
let lightboxLastFocus = null;
let lightboxActiveTrigger = null;
let lightboxActiveGroup = [];

function getLightboxGroup(trigger) {
  if (trigger.dataset.lightboxVideo) return [];
  // Galeri sayfası filtresi: eğer bir item gizlenmişse lightbox grubuna dahil etmez
  if (trigger.matches('.gallery-card:not(.is-hidden) .result-trigger')) {
    return [...document.querySelectorAll('.gallery-card:not(.is-hidden) .result-trigger[data-lightbox-src]')];
  }
  if (trigger.matches('.result-trigger')) return lightboxTriggers.filter((item) => item.matches('.result-trigger[data-lightbox-src]'));
  if (trigger.matches('.clinic-trigger')) return lightboxTriggers.filter((item) => item.matches('.clinic-trigger[data-lightbox-src]'));
  if (trigger.matches('.doctor-photo-trigger')) return lightboxTriggers.filter((item) => item.matches('.doctor-photo-trigger[data-lightbox-src]'));
  return [trigger];
}

function syncLightboxNavigation(trigger) {
  lightboxActiveGroup = getLightboxGroup(trigger);
  const index = lightboxActiveGroup.indexOf(trigger);
  const canNavigate = index >= 0 && lightboxActiveGroup.length > 1;
  if (lightboxPrev) lightboxPrev.hidden = !canNavigate;
  if (lightboxNext) lightboxNext.hidden = !canNavigate;
  if (lightboxCount) {
    lightboxCount.hidden = !canNavigate;
    lightboxCount.textContent = canNavigate ? `${index + 1} / ${lightboxActiveGroup.length}` : '';
  }

  if (canNavigate) {
    const previous = lightboxActiveGroup[(index - 1 + lightboxActiveGroup.length) % lightboxActiveGroup.length];
    const next = lightboxActiveGroup[(index + 1) % lightboxActiveGroup.length];
    [previous, next].forEach((item) => {
      const preload = new Image();
      preload.src = item.dataset.lightboxSrc;
    });
  }
}

function setLightboxContent(trigger, direction = 0) {
  const videoSrc = trigger.dataset.lightboxVideo;
  lightboxActiveTrigger = trigger;
  if (lightboxVideo) {
    lightboxVideo.hidden = !videoSrc;
    if (videoSrc) {
      // preload="none" sayesinde dosya ancak oynatilirken inmeye baslar
      lightboxVideo.poster = trigger.dataset.lightboxPoster || '';
      lightboxVideo.src = videoSrc;
    }
  }
  lightboxImage.hidden = Boolean(videoSrc);
  if (trigger.dataset.lightboxSrc) {
    lightboxImage.src = trigger.dataset.lightboxSrc;
    lightboxImage.alt = trigger.querySelector('img')?.alt || '';
    if (direction && !reducedMotion.matches) {
      lightboxImage.animate([
        { opacity: .32, transform: `translate3d(${direction * 18}px, 0, 0)`, filter: 'blur(4px)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' }
      ], { duration: 260, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
  }
  lightboxTitle.textContent = trigger.dataset.lightboxTitle || '';
  lightboxDetail.textContent = trigger.dataset.lightboxDetail || '';
  if (lightboxKicker) lightboxKicker.textContent = trigger.dataset.lightboxKicker || 'ÖNCESİ / SONRASI';
  syncLightboxNavigation(trigger);
}

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxDetail) return;
  lightboxLastFocus = trigger;
  setLightboxContent(trigger);
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  requestAnimationFrame(() => lightbox.classList.add('is-open'));
  lightboxClose?.focus();
}

function navigateLightbox(direction) {
  if (!lightboxActiveTrigger || lightboxActiveGroup.length < 2) return;
  const currentIndex = lightboxActiveGroup.indexOf(lightboxActiveTrigger);
  const nextIndex = (currentIndex + direction + lightboxActiveGroup.length) % lightboxActiveGroup.length;
  setLightboxContent(lightboxActiveGroup[nextIndex], direction);
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.classList.remove('is-open');
  document.body.classList.remove('lightbox-open');
  if (lightboxVideo && !lightboxVideo.hidden) {
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
  }
  window.setTimeout(() => {
    if (!lightbox.classList.contains('is-open')) lightbox.hidden = true;
  }, 260);
  lightboxLastFocus?.focus();
}

lightboxTriggers.forEach((trigger) => trigger.addEventListener('click', () => openLightbox(trigger)));
lightbox?.addEventListener('click', (event) => {
  if (event.target.closest('[data-lightbox-close]')) closeLightbox();
});
lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
lightboxNext?.addEventListener('click', () => navigateLightbox(1));
document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    navigateLightbox(-1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    navigateLightbox(1);
  }
});

let lightboxSwipeStart = null;
lightboxVisual?.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch' || event.target.closest('button') || lightboxActiveGroup.length < 2) return;
  lightboxSwipeStart = { x: event.clientX, y: event.clientY };
});
lightboxVisual?.addEventListener('pointerup', (event) => {
  if (!lightboxSwipeStart || event.pointerType !== 'touch') return;
  const deltaX = event.clientX - lightboxSwipeStart.x;
  const deltaY = event.clientY - lightboxSwipeStart.y;
  lightboxSwipeStart = null;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) navigateLightbox(deltaX < 0 ? 1 : -1);
});
lightboxVisual?.addEventListener('pointercancel', () => { lightboxSwipeStart = null; });

const doctorGallery = document.querySelector('[data-doctor-gallery]');
const doctorPhotos = [...(doctorGallery?.querySelectorAll('[data-doctor-photo]') || [])];
const doctorPhotoSelectors = [...(doctorGallery?.querySelectorAll('[data-doctor-select]') || [])];

function selectDoctorPhoto(index) {
  doctorPhotos.forEach((photo, photoIndex) => {
    const active = photoIndex === index;
    photo.classList.toggle('is-active', active);
    photo.setAttribute('aria-hidden', String(!active));
    photo.tabIndex = active ? 0 : -1;
  });
  doctorPhotoSelectors.forEach((selector, selectorIndex) => {
    const active = selectorIndex === index;
    selector.classList.toggle('is-active', active);
    selector.setAttribute('aria-pressed', String(active));
  });
}

doctorPhotoSelectors.forEach((selector, index) => {
  selector.addEventListener('click', () => selectDoctorPhoto(index));
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
  .map((link) => {
    // URL'de bir id barindirip barindirmadigini kontrol eder href="//#section" veya href="/#section"
    const href = link.getAttribute('href');
    if (!href) return null;
    if (href.includes('#')) {
      const id = href.split('#')[1];
      if (id) {
         try { return document.querySelector('#' + id); } catch(e) { return null; }
      }
    }
    return null;
  })
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

/* ====================================================
   Galeri Filtreleme Sistemi
   ==================================================== */
function initGalleryFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');
  const galleryCount = document.querySelector('.gallery-count');
  
  if (!filterButtons.length || !galleryCards.length) return;

  function setFilter(category) {
    // Butonları güncelle
    filterButtons.forEach(btn => {
      const isSelected = btn.dataset.filter === category;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    // Kartları filtrele
    let totalVisible = 0;
    galleryCards.forEach(card => {
      const cardCategory = card.dataset.category;
      if (category === 'tumu' || cardCategory === category) {
        card.classList.remove('is-hidden');
        totalVisible++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    // Sayacı güncelle
    if (galleryCount) {
      galleryCount.textContent = totalVisible + ' Vaka';
    }

    // URL'ye hash ekle
    if (window.history.replaceState) {
      window.history.replaceState(null, null, '#' + category);
    }
  }

  // İlk yüklemede hash'e göre filtrele, yoksa tümü
  const initialCategory = window.location.hash.substring(1) || 'tumu';
  let hasMatch = false;
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    if (btn.dataset.filter === initialCategory) hasMatch = true;
  });

  setFilter(hasMatch ? initialCategory : 'tumu');
}

initGalleryFilter();
