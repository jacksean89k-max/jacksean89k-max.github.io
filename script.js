/* ============================================
   PRAMILA STORE — Interactive Behaviors
   Kathmandu Organics Product Catalog & WhatsApp Cart
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Header scroll effect ----
  const topBar = document.getElementById('top-bar');
  const scrollTopBtn = document.getElementById('scroll-top');

  let ticking = false;
  const handleScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;

      if (y > 30) {
        topBar.classList.add('scrolled');
      } else {
        topBar.classList.remove('scrolled');
      }

      if (y > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }

      ticking = false;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---- Scroll to top ----
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Mobile navigation toggle ----
  const mobileToggle = document.getElementById('mobile-toggle');
  const navBar = document.getElementById('nav-bar');
  const navLinks = document.getElementById('nav-links');
  let scrollPos = 0;

  const openNav = () => {
    navBar.classList.add('active');
    mobileToggle.classList.add('active');
    scrollPos = window.scrollY;
    document.body.classList.add('nav-open');
    document.body.style.top = `-${scrollPos}px`;
    const spans = mobileToggle.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  };

  const closeNav = () => {
    navBar.classList.remove('active');
    mobileToggle.classList.remove('active');
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPos);
    const spans = mobileToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  };

  mobileToggle.addEventListener('click', () => {
    if (navBar.classList.contains('active')) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navBar.classList.contains('active')) {
        closeNav();
      }
    });
  });

  // Close on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navBar.classList.contains('active')) {
      closeNav();
    }
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const isMobile = window.innerWidth <= 768;
      const headerH = isMobile ? 64 : 120;
      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  // ---- Intersection Observer for fade-in animations ----
  const fadeElements = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
        const siblingIndex = Array.from(siblings).indexOf(entry.target);
        const delay = siblingIndex * 60;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // ---- Active nav link highlighting on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navLinkElements = document.querySelectorAll('.nav-links a');

  const highlightNav = () => {
    const scrollY = window.scrollY + 150;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinkElements.forEach(link => {
          link.classList.remove('nav-active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('nav-active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ---- Animate stat numbers ----
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const animateCountUp = (el, target) => {
    const duration = 1200;
    const increment = target / (duration / 16);
    let current = 0;

    const tick = () => {
      current += increment;
      if (current >= target) {
        el.textContent = target + (el.dataset.suffix || '');
        return;
      }
      el.textContent = Math.floor(current) + (el.dataset.suffix || '');
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
          if (isNaN(num)) return;
          const suffix = text.includes('+') ? '+' : '';
          el.dataset.suffix = suffix;
          el.textContent = '0' + suffix;
          animateCountUp(el, num);
        });
      }
    });
  }, { threshold: 0.5 });

  const statsBar = document.getElementById('stats-bar');
  if (statsBar) statsObserver.observe(statsBar);

  // ============================================
  // PROMO BANNERS CAROUSEL CONTROLS
  // ============================================
  const promoCarousel = document.getElementById('promo-carousel');
  const promoPrevBtn = document.getElementById('promo-prev-btn');
  const promoNextBtn = document.getElementById('promo-next-btn');

  if (promoCarousel && promoPrevBtn && promoNextBtn) {
    const scrollAmount = 360;

    promoPrevBtn.addEventListener('click', () => {
      promoCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    promoNextBtn.addEventListener('click', () => {
      promoCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Mouse drag scrolling support for desktop
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    promoCarousel.addEventListener('mousedown', (e) => {
      isDown = true;
      promoCarousel.classList.add('active-drag');
      startX = e.pageX - promoCarousel.offsetLeft;
      scrollLeft = promoCarousel.scrollLeft;
    });

    promoCarousel.addEventListener('mouseleave', () => {
      isDown = false;
      promoCarousel.classList.remove('active-drag');
    });

    promoCarousel.addEventListener('mouseup', () => {
      isDown = false;
      promoCarousel.classList.remove('active-drag');
    });

    promoCarousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - promoCarousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      promoCarousel.scrollLeft = scrollLeft - walk;
    });
  }

  // ============================================
  // PRODUCT CATEGORY FILTERING & VHANDAR CATEGORIES
  // ============================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const vhandarCatButtons = document.querySelectorAll('.vhandar-cat-item');
  const bannerLinks = document.querySelectorAll('.banner-card-link');
  const productCards = document.querySelectorAll('.ko-product-card');

  const filterProducts = (category) => {
    // Update active state on filter tabs
    filterTabs.forEach(tab => {
      if (tab.dataset.filter === category) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update active state on Vhandar category items
    vhandarCatButtons.forEach(btn => {
      if (btn.dataset.category === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Filter product cards
    productCards.forEach(card => {
      const cardCat = card.dataset.category;
      if (category === 'all' || cardCat === category) {
        card.style.display = 'flex';
        setTimeout(() => {
          card.classList.add('visible');
        }, 30);
      } else {
        card.style.display = 'none';
      }
    });
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      const headerH = window.innerWidth <= 768 ? 64 : 120;
      const pos = productsSection.getBoundingClientRect().top + window.scrollY - headerH - 10;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
  };

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.filter;
      filterProducts(cat);
    });
  });

  vhandarCatButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = btn.dataset.category;
      filterProducts(cat);
      scrollToProducts();
    });
  });

  bannerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.dataset.filter;
      if (cat) {
        filterProducts(cat);
      }
      scrollToProducts();
    });
  });

  // ============================================
  // QUANTITY STEPPERS (- 1 +)
  // ============================================
  document.querySelectorAll('.ko-product-card').forEach(card => {
    const minusBtn = card.querySelector('.qty-minus');
    const plusBtn = card.querySelector('.qty-plus');
    const qtyInput = card.querySelector('.qty-input');

    if (minusBtn && plusBtn && qtyInput) {
      minusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) {
          qtyInput.value = val - 1;
        }
      });

      plusBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val < 50) {
          qtyInput.value = val + 1;
        }
      });

      qtyInput.addEventListener('change', () => {
        let val = parseInt(qtyInput.value, 10);
        if (isNaN(val) || val < 1) qtyInput.value = 1;
        if (val > 50) qtyInput.value = 50;
      });
    }
  });

  // ============================================
  // SHOPPING CART & WHATSAPP CHECKOUT
  // ============================================
  const cart = {};
  const floatingCartBar = document.getElementById('floating-cart-bar');
  const cartItemCount = document.getElementById('cart-item-count');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  const whatsappCheckoutBtn = document.getElementById('btn-whatsapp-checkout');

  const updateCartUI = () => {
    let totalItems = 0;
    let itemsListText = '';

    for (const [name, item] of Object.entries(cart)) {
      totalItems += item.qty;
      itemsListText += `• ${item.qty}x ${name}\n`;
    }

    if (cartItemCount) cartItemCount.textContent = totalItems;

    if (totalItems > 0) {
      floatingCartBar.classList.add('active');
    } else {
      floatingCartBar.classList.remove('active');
    }

    // Build WhatsApp Order Link
    if (whatsappCheckoutBtn) {
      const message = `Namaste Pramila Store! 🌿\n\nI would like to order the following items:\n${itemsListText}\n📍 Delivery / Pickup: Maharjan Chowk, Imadol-03\nThank you!`;
      const encodedMsg = encodeURIComponent(message);
      whatsappCheckoutBtn.href = `https://wa.me/9779813160679?text=${encodedMsg}`;
    }
  };

  document.querySelectorAll('.ko-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.ko-product-card');
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const qtyInput = card.querySelector('.qty-input');
      const qty = parseInt(qtyInput ? qtyInput.value : '1', 10) || 1;

      if (!cart[name]) {
        cart[name] = { price, qty: 0 };
      }
      cart[name].qty += qty;

      // Feedback animation on button
      btn.classList.add('added');
      btn.textContent = '✓ Added!';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.textContent = 'Add to Cart';
      }, 1200);

      updateCartUI();
    });
  });

  // ============================================
  // SEARCH BAR INTERACTION & NO PRODUCT FOUND
  // ============================================
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const noProductsFound = document.getElementById('no-products-found');
  const searchedQueryText = document.getElementById('searched-query-text');
  const btnResetSearch = document.getElementById('btn-reset-search');

  const hideNoProductsFound = () => {
    if (noProductsFound) {
      noProductsFound.style.display = 'none';
    }
  };

  const handleSearch = (shouldScroll = true) => {
    const rawQuery = searchInput.value.trim();
    const query = rawQuery.toLowerCase();

    if (!query) {
      hideNoProductsFound();
      filterProducts('all');
      return;
    }

    // De-select category tabs
    filterTabs.forEach(tab => tab.classList.remove('active'));
    vhandarCatButtons.forEach(btn => btn.classList.remove('active'));

    // Scroll to products section if initiated by button/enter
    if (shouldScroll) {
      scrollToProducts();
    }

    let matchCount = 0;
    productCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(query)) {
        card.style.display = 'flex';
        card.classList.add('visible');
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (matchCount === 0) {
      if (searchedQueryText) {
        searchedQueryText.textContent = rawQuery;
      }
      if (noProductsFound) {
        noProductsFound.style.display = 'block';
      }
    } else {
      hideNoProductsFound();
    }
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', () => handleSearch(true));
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch(true);
      }
    });

    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim() === '') {
        hideNoProductsFound();
        filterProducts('all');
      } else {
        handleSearch(false);
      }
    });
  }

  if (btnResetSearch) {
    btnResetSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      hideNoProductsFound();
      filterProducts('all');
      scrollToProducts();
    });
  }

  // Hide empty state when switching categories
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      hideNoProductsFound();
    });
  });

  vhandarCatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      hideNoProductsFound();
    });
  });

  // ============================================
  // DIRECT WHATSAPP CHAT WIDGET
  // ============================================
  const waLauncherBtn = document.getElementById('wa-launcher-btn');
  const waChatCard = document.getElementById('wa-chat-card');
  const waCardClose = document.getElementById('wa-card-close');
  const waCustomInput = document.getElementById('wa-custom-input');
  const waSendBtn = document.getElementById('wa-send-btn');
  const waChips = document.querySelectorAll('.wa-chip');
  const waPhone = '9779813160679';

  const sendWhatsAppMessage = (text) => {
    const cleanMsg = (text || '').trim();
    if (!cleanMsg) return;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(cleanMsg)}`;
    window.open(url, '_blank');
  };

  if (waLauncherBtn && waChatCard) {
    waLauncherBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      waChatCard.classList.toggle('active');
      if (waChatCard.classList.contains('active') && waCustomInput) {
        setTimeout(() => waCustomInput.focus(), 250);
      }
    });
  }

  if (waCardClose && waChatCard) {
    waCardClose.addEventListener('click', (e) => {
      e.stopPropagation();
      waChatCard.classList.remove('active');
    });
  }

  // Click outside to close WhatsApp popup
  document.addEventListener('click', (e) => {
    if (waChatCard && waChatCard.classList.contains('active')) {
      if (!waChatCard.contains(e.target) && !waLauncherBtn.contains(e.target)) {
        waChatCard.classList.remove('active');
      }
    }
  });

  // Prompt chips
  waChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.dataset.msg || chip.textContent;
      sendWhatsAppMessage(msg);
      if (waChatCard) waChatCard.classList.remove('active');
    });
  });

  // Send custom typed message
  if (waSendBtn && waCustomInput) {
    waSendBtn.addEventListener('click', () => {
      const msg = waCustomInput.value;
      if (msg && msg.trim()) {
        sendWhatsAppMessage(msg);
        waCustomInput.value = '';
        if (waChatCard) waChatCard.classList.remove('active');
      }
    });

    waCustomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const msg = waCustomInput.value;
        if (msg && msg.trim()) {
          sendWhatsAppMessage(msg);
          waCustomInput.value = '';
          if (waChatCard) waChatCard.classList.remove('active');
        }
      }
    });
  }

});

