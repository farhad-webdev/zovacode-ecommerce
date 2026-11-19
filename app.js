(() => {
  const icon = (name, className = "icon") => `<svg class="${className}" aria-hidden="true" focusable="false"><use href="#icon-${name}"></use></svg>`;

  const imageUrls = {
    hero: "assets/hero-city.jpg",
    knit: "assets/lookbook-knit.jpg",
    runner: "assets/storm-runner.jpg",
    street: "assets/city-look.jpg",
    everyday: "assets/lookbook-everyday.jpg",
    club: "assets/lookbook-club.jpg",
    hoodie: "assets/hoodie-detail.jpg",
    tee: "assets/manifesto-streetwear.jpg",
    tote: "assets/manifesto-knit.jpg",
  };

  const products = [
    { id: "after-hours-hoodie", name: "After Hours Hoodie", category: "T-shirts & Outerwear", price: 88, image: imageUrls.hoodie, tag: "New drop", audience: ["Men", "Women"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: "studio-tee", name: "Studio Heavyweight Tee", category: "T-shirts & Outerwear", price: 48, image: imageUrls.tee, tag: "Best seller", audience: ["Men", "Women"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: "off-grid-crew", name: "Off Grid Crewneck", category: "T-shirts & Outerwear", price: 76, image: imageUrls.knit, tag: "Limited", audience: ["Men", "Women"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: "city-denim", name: "City Straight Denim", category: "Denim", price: 112, image: imageUrls.everyday, tag: "New drop", audience: ["Men", "Women"], sizes: ["28", "30", "32", "34", "36"] },
    { id: "utility-cargo", name: "Utility Cargo Pant", category: "Denim", price: 98, image: imageUrls.street, tag: "Everyday", audience: ["Men", "Women"], sizes: ["28", "30", "32", "34", "36"] },
    { id: "storm-runner", name: "Storm Runner 01", category: "Footwear", price: 138, image: imageUrls.runner, tag: "New drop", audience: ["Men", "Women"], sizes: ["7", "8", "9", "10", "11"] },
    { id: "night-shift", name: "Night Shift Sneaker", category: "Footwear", price: 124, image: imageUrls.club, tag: "Limited", audience: ["Men", "Women"], sizes: ["7", "8", "9", "10", "11"] },
    { id: "signal-cap", name: "Signal 6-Panel Cap", category: "Accessories", price: 38, image: imageUrls.hero, tag: "Essential", audience: ["Men", "Women"], sizes: ["One size"] },
    { id: "everyday-tote", name: "Everyday Carry Tote", category: "Accessories", price: 34, image: imageUrls.tote, tag: "Essential", audience: ["Men", "Women"], sizes: ["One size"] },
  ];

  const quotes = [
    { text: "“ZOVACODE understands youth culture — because we're part of it.”", credit: "MAYA R. / BROOKLYN" },
    { text: "“Getting dressed should feel like showing up as yourself.”", credit: "JAMIE K. / LONDON" },
    { text: "“Good clothes. Better stories. No permission needed.”", credit: "AIDEN K. / NEW YORK" },
  ];

  const dialog = document.querySelector("#site-dialog");
  const dialogContent = document.querySelector("#dialog-content");
  const overlay = document.querySelector("[data-overlay]");
  const cartDrawer = document.querySelector("#cart-drawer");
  const cartItems = document.querySelector("#cart-items");
  const emptyCart = document.querySelector("#empty-cart");
  const cartFooter = document.querySelector("#cart-footer");
  const toast = document.querySelector("#toast");
  let cart = readCart();
  let toastTimer;
  let quoteIndex = 0;
  let lastFocusedElement;

  function readCart() {
    try {
      const saved = JSON.parse(localStorage.getItem("zovacode-cart") || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter((line) => products.some((product) => product.id === line.id) && Number.isInteger(line.quantity) && line.quantity > 0 && typeof line.size === "string");
    } catch (error) {
      console.warn("The saved bag could not be loaded.", error);
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem("zovacode-cart", JSON.stringify(cart));
    } catch (error) {
      console.warn("The bag is available for this visit but could not be saved.", error);
      showToast("Your bag is available for this visit.");
    }
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  }

  function productCardMarkup(product) {
    return `
      <article class="product-card">
        <div class="product-image"><img src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-tag">${product.tag}</span></div>
        <div class="product-info">
          <div class="product-copy"><span class="product-category">${product.category}</span><strong>${product.name}</strong></div>
          <span class="product-price">${formatPrice(product.price)}</span>
        </div>
        <div class="product-buy-row">
          <div class="product-size-control">
            <select aria-label="Select a size for ${product.name}" data-size-for="${product.id}">
              ${product.sizes.map((size) => `<option value="${size}">${size}</option>`).join("")}
            </select>
          </div>
          <button type="button" data-add-to-cart="${product.id}">Add to bag ${icon("arrow-up-right", "icon icon-arrow")}</button>
        </div>
      </article>
    `;
  }

  const shopPage = document.querySelector("[data-shop-page]");
  const shopPageProducts = document.querySelector("[data-shop-page-products]");
  if (shopPage && shopPageProducts) {
    const audience = shopPage.dataset.shopPage;
    const pageProducts = products.filter((product) => product.audience.includes(audience));
    if (pageProducts.length) {
      shopPageProducts.innerHTML = pageProducts.map(productCardMarkup).join("");
      const count = document.querySelector("[data-shop-page-count]");
      if (count) count.textContent = `${pageProducts.length} PIECES`;
    } else {
      console.error(`No products found for collection page: ${audience}`);
      shopPageProducts.textContent = "This collection is currently unavailable.";
    }
  }

  function syncScrollLock() {
    document.body.classList.toggle("is-locked", dialog.open || cartDrawer.classList.contains("is-open"));
  }

  function closeMobileMenu() {
    document.querySelector(".primary-nav").classList.remove("is-open");
    const menuToggle = document.querySelector(".menu-toggle");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2500);
  }

  function showDialog(markup) {
    if (!dialog.open) lastFocusedElement = document.activeElement;
    dialogContent.innerHTML = markup;
    if (!dialog.open) dialog.showModal();
    syncScrollLock();
    const firstInput = dialog.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  function openShop(filter = "") {
    const filtered = products.filter((product) => {
      if (!filter || filter === "Sale") return true;
      if (filter === "Men" || filter === "Women") return product.audience.includes(filter);
      return product.category === filter;
    });
    const title = filter && filter !== "Sale" ? filter : "The latest drop";
    showDialog(`
      <p class="eyebrow">MADE TO MOVE DIFFERENTLY</p>
      <h2 id="dialog-title">${title}</h2>
      <p class="dialog-lead">Considered essentials. Built for the everyday and everything after.</p>
      <div class="product-grid">
        ${filtered.map(productCardMarkup).join("")}
      </div>
    `);
  }

  function openSearch() {
    showDialog(`
      <p class="eyebrow">FIND YOUR NEXT FAVOURITE</p>
      <h2 id="dialog-title">Search ZOVACODE</h2>
      <label class="sr-only" for="site-search">Search products</label>
      <input class="search-box" id="site-search" type="search" placeholder="Try “hoodie” or “runner”" autocomplete="off">
      <div class="search-results" id="search-results" aria-live="polite">
        ${products.slice(0, 4).map(searchResult).join("")}
      </div>
    `);
    dialog.querySelector("#site-search").addEventListener("input", updateSearchResults);
  }

  function searchResult(product) {
    return `<a class="search-result" href="#collections" data-search-category="${product.category}"><span>${product.name}</span><span>${formatPrice(product.price)} ${icon("arrow-up-right", "icon icon-arrow")}</span></a>`;
  }

  function updateSearchResults(event) {
    const query = event.currentTarget.value.trim().toLowerCase();
    const results = products.filter((product) => `${product.name} ${product.category} ${product.tag}`.toLowerCase().includes(query));
    const container = dialog.querySelector("#search-results");
    container.innerHTML = results.length
      ? results.map(searchResult).join("")
      : '<p class="dialog-lead">No pieces found. Try a different search.</p>';
  }

  function openAccount() {
    showDialog(`
      <p class="eyebrow">THE PEOPLE MAKE THE CULTURE</p>
      <h2 id="dialog-title">Stay in the loop.</h2>
      <p class="dialog-lead">Member sign-in isn't live yet. Join the mailing list for first access to new drops and community stories.</p>
      <form class="dialog-form" id="account-form">
        <label for="account-email">Email address</label>
        <input id="account-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>
        <button type="submit">Keep me posted ${icon("arrow-up-right", "icon icon-arrow")}</button>
      </form>
      <p class="dialog-feedback" id="account-feedback" aria-live="polite"></p>
    `);
  }

  function openCart() {
    lastFocusedElement = document.activeElement;
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-visible"));
    syncScrollLock();
    cartDrawer.querySelector("[data-close]").focus();
    renderCart();
  }

  function closeCart() {
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    overlay.classList.remove("is-visible");
    window.setTimeout(() => {
      if (!cartDrawer.classList.contains("is-open")) overlay.hidden = true;
    }, 300);
    syncScrollLock();
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  }

  function addToCart(productId, size) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      showToast("That item is no longer available.");
      return;
    }
    const existing = cart.find((line) => line.id === productId && line.size === size);
    if (existing) existing.quantity += 1;
    else cart.push({ id: productId, size, quantity: 1 });
    saveCart();
    renderCart();
    showToast(`${product.name} added to your bag.`);
  }

  function renderCart() {
    const quantity = cart.reduce((total, line) => total + line.quantity, 0);
    const subtotal = cart.reduce((total, line) => {
      const product = products.find((item) => item.id === line.id);
      return total + (product ? product.price * line.quantity : 0);
    }, 0);
    document.querySelectorAll(".cart-count").forEach((item) => { item.textContent = quantity; });
    document.querySelector(".drawer-count").textContent = `(${quantity})`;
    document.querySelector("#cart-subtotal").textContent = formatPrice(subtotal);
    cartItems.innerHTML = cart.map((line) => {
      const product = products.find((item) => item.id === line.id);
      if (!product) return "";
      return `
        <article class="cart-line">
          <img src="${product.image}" alt="${product.name}">
          <div class="cart-line-info">
            <strong>${product.name}</strong>
            <span>Size: ${line.size}</span>
            <div class="quantity-stepper" aria-label="Quantity for ${product.name}">
              <button type="button" data-cart-action="decrease" data-id="${product.id}" data-size="${line.size}" aria-label="Decrease quantity">${icon("minus")}</button>
              <span>${line.quantity}</span>
              <button type="button" data-cart-action="increase" data-id="${product.id}" data-size="${line.size}" aria-label="Increase quantity">${icon("plus")}</button>
            </div>
          </div>
          <span class="cart-line-price">${formatPrice(product.price * line.quantity)}</span>
        </article>
      `;
    }).join("");
    emptyCart.hidden = quantity > 0;
    cartFooter.hidden = quantity === 0;
  }

  function updateCart(productId, size, action) {
    const line = cart.find((item) => item.id === productId && item.size === size);
    if (!line) return;
    if (action === "increase") line.quantity += 1;
    else if (action === "decrease") line.quantity -= 1;
    if (line.quantity < 1) cart = cart.filter((item) => item !== line);
    saveCart();
    renderCart();
  }

  function openCheckout() {
    const total = cart.reduce((sum, line) => {
      const product = products.find((item) => item.id === line.id);
      return sum + (product ? product.price * line.quantity : 0);
    }, 0);
    const summary = cart.map((line) => {
      const product = products.find((item) => item.id === line.id);
      return product ? `<div><span>${product.name} · ${line.size} × ${line.quantity}</span><strong>${formatPrice(product.price * line.quantity)}</strong></div>` : "";
    }).join("");
    closeCart();
    showDialog(`
      <p class="eyebrow">ALMOST YOURS</p>
      <h2 id="dialog-title">Order preview</h2>
      <p class="dialog-lead">This demo checkout won't take payment or place a real order.</p>
      <div class="checkout-summary">${summary}<div><strong>Preview total</strong><strong>${formatPrice(total)}</strong></div></div>
      <form class="dialog-form" id="checkout-form">
        <label for="checkout-email">Email for your order preview</label>
        <input id="checkout-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>
        <button type="submit">Complete demo checkout</button>
      </form>
      <p class="dialog-feedback" id="checkout-feedback" aria-live="polite"></p>
    `);
  }

  document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
  document.querySelectorAll("[data-open-search]").forEach((button) => button.addEventListener("click", openSearch));
  document.querySelectorAll("[data-open-account]").forEach((button) => button.addEventListener("click", () => {
    closeMobileMenu();
    openAccount();
  }));
  const categoryPreviewImages = {
    "T-shirts & Outerwear": [
      { src: imageUrls.hoodie, alt: "Close detail of a heavyweight graphic hoodie", label: "AFTER HOURS / 01" },
      { src: imageUrls.tee, alt: "A woman wearing a graphic blue jersey with relaxed streetwear", label: "STUDIO HEAVYWEIGHT / 02" },
    ],
    Denim: [
      { src: imageUrls.everyday, alt: "A woman wearing light denim and neutral layers in the city", label: "CITY STRAIGHT / 01" },
      { src: imageUrls.street, alt: "A man wearing a black jacket and dark cargo pants on a city street", label: "UTILITY CARGO / 02" },
    ],
    Footwear: [
      { src: imageUrls.runner, alt: "Close detail of a technical trail sneaker outsole", label: "STORM RUNNER / 01" },
      { src: imageUrls.club, alt: "A model in a neutral hoodie and white sneakers walking through the city", label: "NIGHT SHIFT / 02" },
    ],
    Accessories: [
      { src: imageUrls.tote, alt: "A woman carrying a tan shoulder bag with relaxed streetwear", label: "EVERYDAY CARRY / 01" },
      { src: imageUrls.hero, alt: "A woman wearing a dark beanie with streetwear on city steps", label: "HEADWEAR / 02" },
    ],
  };
  if (document.querySelector(".collection-visuals")) {
    const collectionPhotos = Array.from(document.querySelectorAll("[data-collection-photo]"));

    function updateCategoryPreview(category) {
      const previews = categoryPreviewImages[category];
      if (!previews) {
        console.error(`No collection previews configured for category: ${category}`);
        return;
      }

      document.querySelector(".collection-visuals").dataset.activeCategory = category;
      collectionPhotos.forEach((photo, index) => {
        const preview = previews[index];
        const image = photo.querySelector("img");
        if (image.getAttribute("src") !== preview.src) {
          image.classList.add("is-changing");
          image.addEventListener("load", () => {
            if (image.getAttribute("src") === preview.src) image.classList.remove("is-changing");
          }, { once: true });
          image.addEventListener("error", () => {
            if (image.getAttribute("src") === preview.src) {
              image.classList.remove("is-changing");
              console.error(`Could not load collection preview image: ${preview.src}`);
            }
          }, { once: true });
          image.src = preview.src;
        }
        image.alt = preview.alt;
        photo.setAttribute("aria-label", `Explore ${category}: ${preview.label}`);
        const photoLabel = photo.querySelector("[data-collection-photo-label]");
        if (photoLabel) photoLabel.textContent = preview.label;
      });
    }

    updateCategoryPreview("Footwear");
    document.querySelectorAll(".category-list [data-category]").forEach((button) => {
      const preview = () => updateCategoryPreview(button.dataset.category);
      button.addEventListener("pointerenter", preview);
      button.addEventListener("focus", preview);
      button.addEventListener("click", () => openShop(button.dataset.category));
    });
  }
  document.querySelectorAll("[data-category-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeMobileMenu();
      openShop(link.dataset.categoryLink);
    });
  });
  document.querySelectorAll(".primary-nav a:not([data-category-link])").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.querySelector(".menu-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
    document.querySelector(".primary-nav").classList.toggle("is-open", !expanded);
  });

  document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeCart));
  overlay.addEventListener("click", closeCart);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("close", () => {
    syncScrollLock();
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
  });

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      const productId = addButton.dataset.addToCart;
      const sizeSelect = addButton.closest(".product-card").querySelector(`[data-size-for="${productId}"]`);
      if (!sizeSelect) {
        console.error(`No size selector found for product: ${productId}`);
        return;
      }
      addToCart(productId, sizeSelect.value);
      return;
    }
    const cartButton = event.target.closest("[data-cart-action]");
    if (cartButton) {
      updateCart(cartButton.dataset.id, cartButton.dataset.size, cartButton.dataset.cartAction);
      return;
    }
    const searchLink = event.target.closest("[data-search-category]");
    if (searchLink) {
      event.preventDefault();
      openShop(searchLink.dataset.searchCategory);
      return;
    }
    if (event.target.closest("[data-checkout]")) openCheckout();
  });

  document.querySelectorAll("[data-quote-step]").forEach((button) => {
    button.addEventListener("click", () => {
      quoteIndex = (quoteIndex + Number(button.dataset.quoteStep) + quotes.length) % quotes.length;
      document.querySelector("#community-quote").textContent = quotes[quoteIndex].text;
      document.querySelector("#quote-credit").textContent = quotes[quoteIndex].credit;
    });
  });

  const lookbookTrack = document.querySelector("#lookbook-track");
  if (lookbookTrack) {
    const lookbookSlides = Array.from(lookbookTrack.querySelectorAll(".look-card"));
    const lookbookProgressTrack = document.querySelector(".lookbook-progress-track");
    const lookbookProgressFill = document.querySelector("[data-lookbook-progress]");
    const lookbookCaption = document.querySelector("[data-lookbook-caption]");
    const lookbookStatus = document.querySelector("[data-lookbook-status]");
    const lookbookButtons = Array.from(document.querySelectorAll("[data-lookbook-step]"));
    let lookbookStartIndex = 0;
    let lookbookMaxIndex = 0;
    let lookbookScrollFrame = 0;

    function getLookbookStep() {
      if (lookbookSlides.length < 2) return 0;
      return lookbookSlides[1].getBoundingClientRect().left - lookbookSlides[0].getBoundingClientRect().left;
    }

    function updateLookbookSlider() {
      const step = getLookbookStep();
      const maxScroll = Math.max(0, lookbookTrack.scrollWidth - lookbookTrack.clientWidth);
      lookbookMaxIndex = step ? Math.round(maxScroll / step) : 0;
      lookbookStartIndex = step ? Math.max(0, Math.min(lookbookMaxIndex, Math.round(lookbookTrack.scrollLeft / step))) : 0;

      const visibleCount = step ? Math.min(lookbookSlides.length, Math.max(1, Math.round(lookbookTrack.clientWidth / step))) : lookbookSlides.length;
      const endIndex = Math.min(lookbookSlides.length, lookbookStartIndex + visibleCount);
      const progress = ((lookbookStartIndex + 1) / (lookbookMaxIndex + 1)) * 100;
      const caption = lookbookSlides[lookbookStartIndex].querySelector("figcaption span").textContent;

      lookbookProgressFill.style.width = `${progress}%`;
      lookbookProgressTrack.setAttribute("aria-valuenow", String(Math.round(progress)));
      lookbookProgressTrack.setAttribute("aria-valuetext", `Showing items ${lookbookStartIndex + 1} through ${endIndex} of ${lookbookSlides.length}`);
      lookbookCaption.textContent = caption.replace(/^\d+\s*[—-]\s*/, "");
      lookbookStatus.textContent = `Showing items ${lookbookStartIndex + 1} through ${endIndex} of ${lookbookSlides.length}`;
      lookbookButtons.forEach((button) => {
        const direction = Number(button.dataset.lookbookStep);
        button.disabled = direction < 0 ? lookbookStartIndex === 0 : lookbookStartIndex === lookbookMaxIndex;
      });
    }

    function moveLookbook(direction) {
      const nextIndex = Math.max(0, Math.min(lookbookMaxIndex, lookbookStartIndex + direction));
      const step = getLookbookStep();
      lookbookTrack.scrollTo({
        left: nextIndex * step,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      updateLookbookSlider();
    }

    lookbookButtons.forEach((button) => {
      button.addEventListener("click", () => moveLookbook(Number(button.dataset.lookbookStep)));
    });
    lookbookTrack.addEventListener("scroll", () => {
      if (lookbookScrollFrame) return;
      lookbookScrollFrame = requestAnimationFrame(() => {
        lookbookScrollFrame = 0;
        updateLookbookSlider();
      });
    }, { passive: true });
    lookbookTrack.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        moveLookbook(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
    window.addEventListener("resize", updateLookbookSlider, { passive: true });
    updateLookbookSlider();
  }

  const newsletterForm = document.querySelector("#newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      document.querySelector("#newsletter-feedback").textContent = "Thanks for your interest — newsletter sign-up will be available at launch.";
      event.target.reset();
    });
  }
  dialogContent.addEventListener("submit", (event) => {
    if (event.target.matches("#account-form")) {
      event.preventDefault();
      dialog.querySelector("#account-feedback").textContent = "Thanks for your interest — account sign-in is coming soon.";
      event.target.reset();
    }
    if (event.target.matches("#checkout-form")) {
      event.preventDefault();
      cart = [];
      saveCart();
      renderCart();
      dialog.querySelector("#checkout-feedback").textContent = "Demo complete — no order was placed and no payment was taken.";
      event.target.reset();
    }
  });

  const revealSelectors = [
    ".hero-top",
    ".hero-meta",
    "#hero-title",
    ".section-rule",
    ".manifesto-copy > .eyebrow",
    ".manifesto-copy > h2",
    ".manifesto-note",
    ".manifesto-banner",
    ".section-kicker",
    ".collections-heading h2",
    ".category-row",
    ".category-footnote",
    ".collection-stamp",
    ".collection-caption",
    ".lookbook-heading",
    ".lookbook-progress",
    ".community-copy > .eyebrow",
    ".quote-block",
    ".community-note > div:last-child",
    ".shop-page-hero-copy",
    ".shop-page-products-heading",
    ".newsletter-copy",
    ".newsletter-form",
    ".footer-links",
    ".footer-mark",
    ".footer-bottom",
  ].join(", ");
  const mediaRevealSelectors = [
    ".manifesto-portrait",
    ".manifesto-secondary",
    ".collections-feature",
    ".category-promo",
    ".collection-photo",
    ".look-card",
    ".community-thumb",
    ".community-feature",
    ".shop-page-image",
    ".product-grid-page .product-card",
  ].join(", ");
  document.querySelectorAll(revealSelectors).forEach((item) => item.classList.add("reveal"));
  document.querySelectorAll(mediaRevealSelectors).forEach((item) => item.classList.add("reveal", "reveal-media"));

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroImage = document.querySelector(".hero-image");
  let scrollQueued = false;
  if (!reducedMotion && heroImage) window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const hero = document.querySelector(".hero-card");
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const shift = Math.min(20, Math.max(-20, (window.innerHeight - rect.top) * .025));
        heroImage.style.transform = `scale(1.04) translateY(${shift}px)`;
      }
      scrollQueued = false;
    });
  }, { passive: true });

  renderCart();
})();
