// custom megamenu js start
  document.addEventListener('DOMContentLoaded', function() {
    // Open/Close mega menu on hover
    const headerMenus = document.querySelectorAll('header-menu');
    
    // Update aria-expanded on details toggle with hover functionality
    headerMenus.forEach(function(headerMenu) {
      const details = headerMenu.querySelector('details');
      const summary = headerMenu.querySelector('summary');
      
      if (details && summary) {
        // Prevent default click behavior
        summary.addEventListener('click', function(e) {
          e.preventDefault();
        });
        
        // Open on hover and update aria-expanded
        headerMenu.addEventListener('mouseenter', function() {
          details.setAttribute('open', '');
          summary.setAttribute('aria-expanded', 'true');
        });
        
        // Close on mouse leave and update aria-expanded
        headerMenu.addEventListener('mouseleave', function() {
          details.removeAttribute('open');
          summary.setAttribute('aria-expanded', 'false');
        });
        
        // Initialize aria-expanded state
        summary.setAttribute('aria-expanded', details.hasAttribute('open') ? 'true' : 'false');
      }
    });
    
    // Category switching within mega menu
    const megaMenus = document.querySelectorAll('[data-mega-menu-interactive]');
    
    megaMenus.forEach(function(megaMenu) {
      const categoryLinks = megaMenu.querySelectorAll('.custom-mega-menu__category-link');
      const contentSections = megaMenu.querySelectorAll('.custom-mega-menu__content-section');
      
      categoryLinks.forEach(function(link) {
        link.addEventListener('mouseenter', function(e) {
          const categoryIndex = this.getAttribute('data-category-index');
          const categoryHandle = this.getAttribute('data-category-handle');
          const showAll = this.getAttribute('data-show-all');
          const noGrandchildren = this.getAttribute('data-no-grandchildren');
          
          // If link has no grandchildren, don't show any content, just allow click through
          if (noGrandchildren === 'true') {
            // Remove active class from all links and sections
            categoryLinks.forEach(l => {
              l.classList.remove('active');
              l.removeAttribute('aria-current');
            });
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to current link
            this.classList.add('active');
            if (!this.hasAttribute('aria-current')) {
              this.setAttribute('aria-current', 'true');
            }
            return; // Don't show any content section
          }
          
          // Remove active class from all links and sections
          categoryLinks.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('aria-current') !== 'page') {
              l.removeAttribute('aria-current');
            }
          });
          contentSections.forEach(s => s.classList.remove('active'));
          
          // Add active class to current link
          this.classList.add('active');
          if (!this.hasAttribute('aria-current') || this.getAttribute('aria-current') !== 'page') {
            this.setAttribute('aria-current', 'true');
          }
          
          // Show corresponding content section
          if (showAll === 'true') {
            // Show the "all categories" section
            const allSection = megaMenu.querySelector('[data-show-all="true"][data-category-content]');
            if (allSection) {
              allSection.classList.add('active');
            }
          } else {
            // Show specific category section (only if it has grandchildren)
            const targetSection = megaMenu.querySelector('[data-category-content="' + categoryIndex + '"]');
            if (targetSection) {
              targetSection.classList.add('active');
            }
          }
        });
      });
      
      // Optional: Reset to first category when leaving the categories sidebar
      const categoriesSidebar = megaMenu.querySelector('.custom-mega-menu__sidebar--left');
      if (categoriesSidebar) {
        categoriesSidebar.addEventListener('mouseleave', function() {
          // Keep the last hovered category active (no reset)
          // If you want to reset to first, uncomment below:
          // const firstLink = categoryLinks[0];
          // const firstSection = contentSections[0];
          // if (firstLink && firstSection) {
          //   categoryLinks.forEach(l => l.classList.remove('active'));
          //   contentSections.forEach(s => s.classList.remove('active'));
          //   firstLink.classList.add('active');
          //   firstSection.classList.add('active');
          // }
        });
      }
    });
  });

  // custom mega menu js end

const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content-new");

tabLinks.forEach(tab => {
  tab.addEventListener("click", function (event) {
    event.preventDefault();

    let targetTab = this.getAttribute("data-tab");

    tabLinks.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    this.classList.add("active");
    document.getElementById(targetTab).classList.add("active");
  });
});


  
const popupOverlay = document.getElementById('product-conditions-popup');
const popupContainer = document.getElementById('popup-container');
const closeBtn = document.getElementById('popup-close-button');
const triggers = document.querySelectorAll('[data-condition-popup]');

// Open popup
triggers.forEach(trigger => {
  trigger.addEventListener('click', function () {
    popupOverlay.classList.add('active');
  });
});

// Close popup on close button
closeBtn.addEventListener('click', function () {
  popupOverlay.classList.remove('active');
});

// Prevent overlay close when clicking inside popup
popupContainer.addEventListener('click', function (e) {
  e.stopPropagation();
});

// Close popup on overlay background click
popupOverlay.addEventListener('click', function () {
  popupOverlay.classList.remove('active');
});

document.querySelectorAll('.template-product [data-add-btn]').forEach(btn => {
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    const targetButton = document.querySelector('.product-main-content .product-form__submit');
    if (targetButton) {
      targetButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetButton.click();
    }
  });
});
 

document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.section-header');
  if (!header) return;

  // Check if sticky header should always apply
  const stickyWrapper = document.querySelector('sticky-header');
  const stickyType = stickyWrapper ? stickyWrapper.getAttribute('data-sticky-type') : null;

  if (stickyType === 'always' || stickyType === 'reduce-logo-size') {
    header.classList.add('shopify-section-header-sticky');
    console.log('Sticky header forced');
  }


});


// infinite scroll js start

  function loadMoreProducts() {
    const nextPageElement = document.getElementById('next-page');
    const nextPage = nextPageElement ? nextPageElement.dataset.nextPage : null;
    const productGridContainer = document.querySelector('.product-grid-container');

    // If no container or no next page, stop loading
    if (!productGridContainer || !nextPage) {
      const loader = document.querySelector('.block__scroll--gif-image');
      if (loader) loader.style.display = 'none';
      return;
    }

    // Check if user has scrolled near the bottom
    const containerBottom = productGridContainer.getBoundingClientRect().bottom;
    const viewportHeight = window.innerHeight;

    // Trigger load when bottom is within 0.5 viewport height (half screen) of viewport
    if (containerBottom > viewportHeight + (viewportHeight * 0.1)) return;

    // Remove scroll listener to prevent multiple requests
    window.removeEventListener('scroll', loadMoreProducts);

    // Show loader
    const loader = document.querySelector('.block__scroll--gif-image');
    if (loader) loader.style.display = 'block';

    // Fetch next page
    fetch(nextPage)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        // Get new products from the fetched page
        const newProducts = doc.querySelectorAll('#product-grid .grid__item');
        const productGrid = document.getElementById('product-grid');

        // Append new products to the grid
        newProducts.forEach(product => {
          productGrid.appendChild(product);
        });

        // Check if there's another page
        const newNextPageElement = doc.getElementById('next-page');
        if (newNextPageElement) {
          // Update next page URL and re-enable scroll listener
          nextPageElement.dataset.nextPage = newNextPageElement.dataset.nextPage;
          window.addEventListener('scroll', loadMoreProducts, { passive: true });
        } else {
          // No more pages, hide loader permanently
          nextPageElement.remove();
        }

        // Hide loader after successful load
        if (loader) loader.style.display = 'none';
      })
      .catch(error => {
        console.error('Failed to load more products:', error);
        // Hide loader and re-enable scroll on error
        if (loader) loader.style.display = 'none';
        window.addEventListener('scroll', loadMoreProducts, { passive: true });
      });
  }

  // Initialize infinite scroll when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.addEventListener('scroll', loadMoreProducts, { passive: true });
    });
  } else {
    window.addEventListener('scroll', loadMoreProducts, { passive: true });
  }

 // infinite scroll js end

 (() => {
  const blockedClass = "modal-open-cart";

  // Intercept classList.add on body
  const originalAdd = DOMTokenList.prototype.add;
  DOMTokenList.prototype.add = function(...classes) {
    if (this === document.body.classList && classes.includes(blockedClass)) {
      console.warn("⛔ BLOCKED adding body class:", blockedClass);
      return; // do nothing — swallow attempt
    }
    return originalAdd.apply(this, classes);
  };

  // Intercept setAttribute on body
  const originalSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (this === document.body && name === "class" && value.includes(blockedClass)) {
      console.warn("⛔ BLOCKED setting body.class to include modal-open-cart");
      value = value.replace(blockedClass, "").trim();
    }
    return originalSetAttr.call(this, name, value);
  };

})();



document.addEventListener("DOMContentLoaded", () => {
    const swiperElement = document.querySelector('.block__top-slider-main');
    const swiperElement2 = document.querySelector('.block__top-slider-main-thumbs');
    
  if (swiperElement2) {
      window.productThumbsSwiperInstance = new Swiper(swiperElement2, {
          loop: true,
          spaceBetween: 10,
          slidesPerView: 4.5,
          freeMode: true,
          watchSlidesProgress: true,
          observer: true,
          observeParents: true,

      });
  }
  if (swiperElement) {
    window.productSwiperInstance = new Swiper(swiperElement, {  
      loop: true,
      spaceBetween: 10,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: ".block__product-gallery-navigation-next",
        prevEl: ".block__product-gallery-navigation-prev",
      },
      pagination: {
        el: '.block__product-gallery-pagination',
        clickable: true,
      },
      thumbs: {
        swiper: window.productThumbsSwiperInstance,
      },
    });
}
});



// discount code change text js start

// (function() {
//   // Use class selector instead of ID since we're in a .js file
//   const discountTextContainer = document.querySelector('.product__discount-text-container');
//   if (!discountTextContainer) return;

//   const textUnder100 = discountTextContainer.getAttribute('data-discount-text');
//   const text100Up = discountTextContainer.getAttribute('data-discount-text-100');
//   const threshold = parseInt(discountTextContainer.getAttribute('data-threshold'));

//   function updateDiscountText(cartTotal) {
//     let newText = '';
    
//     if (cartTotal < threshold && textUnder100) {
//       newText = `<p class="product__discount-text">${textUnder100}</p>`;
//     } else if (cartTotal >= threshold && text100Up) {
//       newText = `<p class="product__discount-text">${text100Up}</p>`;
//     }
    
//     if (discountTextContainer.innerHTML !== newText) {
//       discountTextContainer.innerHTML = newText;
//     }
//   }

//   function fetchAndUpdateCart() {
//     fetch('/cart.js')
//       .then(response => response.json())
//       .then(cart => {
//         updateDiscountText(cart.total_price);
//       })
//       .catch(error => console.error('Error fetching cart:', error));
//   }

//   // Method 1: Listen for custom cart drawer rendered event (IMMEDIATE)
//   document.addEventListener('cart-drawer:rendered', function(event) {
//     if (event.detail && event.detail.parsedState) {
//       const cartData = event.detail.parsedState;
//       if (cartData.total_price !== undefined) {
//         updateDiscountText(cartData.total_price);
//       }
//     }
//   });

//   // Method 2: Listen for custom cart updated event (IMMEDIATE)
//   document.addEventListener('cart:updated', function(event) {
//     if (event.detail && event.detail.cart) {
//       updateDiscountText(event.detail.cart.total_price);
//     }
//   });

//   // Method 3: Subscribe to the theme's cart update pub/sub system
//   if (typeof subscribe !== 'undefined' && typeof PUB_SUB_EVENTS !== 'undefined') {
//     subscribe(PUB_SUB_EVENTS.cartUpdate, function(event) {
//       if (event && event.cartData && event.cartData.total_price !== undefined) {
//         updateDiscountText(event.cartData.total_price);
//       }
//     });
//   }

//   // Method 4: Listen for cart drawer opened event
//   document.addEventListener('cart-drawer:opened', function() {
//     fetchAndUpdateCart();
//   });

//   // Method 5: Listen for cart icon clicks (backup)
//   document.addEventListener('click', function(e) {
//     const cartButton = e.target.closest('#cart-icon-bubble, [href*="/cart"]');
//     if (cartButton && !cartButton.href?.includes('/cart')) {
//       setTimeout(fetchAndUpdateCart, 50);
//     }
//   });

//   // Initial check on page load
//   fetchAndUpdateCart();
// })(); 

// discount code change text js end

// ========== Sticky Add to Cart for Mobile ==========
(function() {
  // Only run on product pages
  const mainProductForm = document.querySelector('.product-form');
  if (!mainProductForm) return;
  
  const stickyBar = document.getElementById('sticky-atc-bar');
  const stickyButton = document.getElementById('sticky-atc-button');
  const stickyVariantInput = document.getElementById('sticky-product-variant-id');
  const defaultAddToCartButton = document.querySelector('.PDP-buy_buttons .product-form__submit');
  const mainVariantInput = document.querySelector('.PDP-buy_buttons .product-variant-id');
  
  if (!stickyBar || !stickyButton || !defaultAddToCartButton || !mainVariantInput || !stickyVariantInput) return;
  
  // Function to check if element is in viewport
  function isInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Check if any part of the button is visible
    return (
      rect.top < windowHeight &&
      rect.bottom > 0
    );
  }
  
  // Function to check if we should show sticky bar (only on mobile)
  function toggleStickyBar() {
    // Check if window width is mobile (max 749px)
    if (window.innerWidth > 749) {
      stickyBar.classList.remove('visible');
      stickyBar.style.display = 'none';
      return;
    }
    
    // Check if default button is visible
    const buttonVisible = isInViewport(defaultAddToCartButton);
    
    if (buttonVisible) {
      // Button is visible, hide sticky bar
      stickyBar.classList.remove('visible');
      setTimeout(() => {
        if (!stickyBar.classList.contains('visible')) {
          stickyBar.style.display = 'none';
        }
      }, 300);
    } else {
      // Button is not visible, show sticky bar
      stickyBar.style.display = 'block';
      // Use requestAnimationFrame for smooth appearance
      requestAnimationFrame(() => {
        stickyBar.classList.add('visible');
      });
    }
  }
  
  // Use IntersectionObserver for better detection (modern browsers)
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (window.innerWidth <= 749) {
          if (entry.isIntersecting) {
            // Button is visible
            stickyBar.classList.remove('visible');
            setTimeout(() => {
              if (!stickyBar.classList.contains('visible')) {
                stickyBar.style.display = 'none';
              }
            }, 300);
          } else {
            // Button is not visible
            stickyBar.style.display = 'block';
            requestAnimationFrame(() => {
              stickyBar.classList.add('visible');
            });
          }
        }
      });
    }, observerOptions);
    
    observer.observe(defaultAddToCartButton);
  }
  
  // Function to sync variant and button state
  function syncVariantState() {
    // Sync variant ID
    stickyVariantInput.value = mainVariantInput.value;
    
    // Sync disabled state
    if (mainVariantInput.hasAttribute('disabled') || defaultAddToCartButton.hasAttribute('disabled')) {
      stickyVariantInput.setAttribute('disabled', 'disabled');
      stickyButton.setAttribute('disabled', 'disabled');
    } else {
      stickyVariantInput.removeAttribute('disabled');
      stickyButton.removeAttribute('disabled');
    }
    
    // Sync button text
    const mainButtonText = defaultAddToCartButton.querySelector('span');
    const stickyButtonText = stickyButton.querySelector('span');
    if (mainButtonText && stickyButtonText) {
      stickyButtonText.textContent = mainButtonText.textContent;
    }
  }
  
  // Initial sync
  syncVariantState();
  
  // Watch for changes in main variant input
  const variantObserver = new MutationObserver(syncVariantState);
  variantObserver.observe(mainVariantInput, {
    attributes: true,
    attributeFilter: ['value', 'disabled']
  });
  
  // Watch for changes in main button
  const buttonObserver = new MutationObserver(syncVariantState);
  buttonObserver.observe(defaultAddToCartButton, {
    attributes: true,
    attributeFilter: ['disabled'],
    subtree: true,
    characterData: true
  });
  
  // Listen to scroll and resize events
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(toggleStickyBar, 50);
  }, { passive: true });
  
  window.addEventListener('resize', toggleStickyBar);
  
  // Initial check - multiple times to ensure proper detection
  function initialCheck() {
    toggleStickyBar();
    
    // Check again after a short delay to ensure layout is complete
    setTimeout(toggleStickyBar, 100);
    setTimeout(toggleStickyBar, 300);
    setTimeout(toggleStickyBar, 500);
  }
  
  // Run initial check
  initialCheck();
  
  // Check after page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialCheck);
  }
  
  window.addEventListener('load', initialCheck);
  
  // Re-sync on variant change events
  document.addEventListener('variant:change', syncVariantState);
  
  // Listen to Shopify's variant change pub/sub event
  if (typeof subscribe !== 'undefined' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.variantChange, function() {
      setTimeout(syncVariantState, 50); // Small delay to ensure DOM is updated
    });
  }
})();
// ========== End Sticky Add to Cart ==========