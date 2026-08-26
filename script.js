/* ============================================
   PRAMILA STORE — Interactive Behaviors
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Header scroll effect ----
  const header = document.getElementById('header');
  const scrollTop = document.getElementById('scroll-top');

  const handleScroll = () => {
    const y = window.scrollY;

    // Header glassmorphism intensifies on scroll
    if (y > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Show/hide scroll-to-top button
    if (y > 600) {
      scrollTop.classList.add('visible');
    } else {
      scrollTop.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // initial check

  // ---- Scroll to top ----
  scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Mobile navigation toggle ----
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');

    // Animate hamburger → X
    const spans = mobileToggle.querySelectorAll('span');
    if (navLinks.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileToggle.classList.remove('active');
      const spans = mobileToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ---- Intersection Observer for fade-in animations ----
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.15
  };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger siblings for a cascading reveal
        const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
        const siblingIndex = Array.from(siblings).indexOf(entry.target);
        const delay = siblingIndex * 100; // 100ms stagger

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => fadeObserver.observe(el));

  // ---- Active nav link highlighting on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navLinkElements = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinkElements.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--color-primary)';
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ---- Animate stat numbers on hero visibility ----
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const animateCountUp = (el, target) => {
    const duration = 1500;
    const increment = target / (duration / 16);
    let current = 0;

    const tick = () => {
      current += increment;
      if (current >= target) {
        el.textContent = target + (el.dataset.suffix || '+');
        return;
      }
      el.textContent = Math.floor(current) + (el.dataset.suffix || '+');
      requestAnimationFrame(tick);
    };

    tick();
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statNumbers.forEach(el => {
          const text = el.textContent;
          const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
          const suffix = text.includes('+') ? '+' : '';
          el.dataset.suffix = suffix;
          el.textContent = '0' + suffix;
          animateCountUp(el, num);
        });
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  // ---- Subtle parallax on hero background ----
  const heroBg = document.querySelector('.hero-bg img');

  if (heroBg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroBg.style.transform = `scale(1.05) translateY(${y * 0.15}px)`;
      }
    }, { passive: true });
  }

});
