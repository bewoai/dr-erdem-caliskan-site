const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileAppointment = document.querySelector('.mobile-appointment');
const hero = document.querySelector('.hero');

const syncHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
  mobileAppointment.classList.toggle('visible', window.scrollY > window.innerHeight * 0.72);
};
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

const heroObserver = new IntersectionObserver(([entry]) => {
  mobileAppointment.classList.toggle('visible', !entry.isIntersecting);
}, { threshold: 0.18 });
heroObserver.observe(hero);

menuButton.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', open);
  menuButton.classList.toggle('active', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuButton.classList.remove('active');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.concern-list button').forEach((button) => {
  button.addEventListener('click', () => {
    const concern = button.textContent.replace(/^\s*\d+\s*/, '').replace('↗', '').trim();
    window.open(`https://wa.me/905345662511?text=${encodeURIComponent(`${concern} konusunda bilgi almak istiyorum.`)}`, '_blank', 'noopener,noreferrer');
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
