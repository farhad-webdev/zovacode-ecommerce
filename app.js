(() => {
  const imageUrls = {
    hero: "assets/hero-city.jpg",
    knit: "assets/manifesto-knit.jpg",
    runner: "assets/storm-runner.jpg",
    street: "assets/city-look.jpg",
    look1: "assets/lookbook-everyday.jpg",
    look2: "assets/lookbook-club.jpg",
    look3: "assets/lookbook-knit.jpg",
    hoodie: "assets/owners-club.jpg",
    closeup: "assets/hoodie-detail.jpg",
  };

  const products = [
    { id: "after-hours-hoodie", name: "After Hours Hoodie", category: "T-shirts & Outerwear", price: 88, image: imageUrls.hoodie, tag: "New drop", audience: ["Men", "Women"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: "studio-tee", name: "Studio Heavyweight Tee", category: "T-shirts & Outerwear", price: 48, image: imageUrls.street, tag: "Best seller", audience: ["Men", "Women"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: "off-grid-crew", name: "Off Grid Crewneck", category: "T-shirts & Outerwear", price: 76, image: imageUrls.look3, tag: "Limited", audience: ["Men", "Women"], sizes: ["XS", "S", "M", "L", "XL"] },
    { id: "city-denim", name: "City Straight Denim", category: "Denim", price: 112, image: imageUrls.look1, tag: "New drop", audience: ["Men", "Women"], sizes: ["28", "30", "32", "34", "36"] },
    { id: "utility-cargo", name: "Utility Cargo Pant", category: "Denim", price: 98, image: imageUrls.street, tag: "Everyday", audience: ["Men", "Women"], sizes: ["28", "30", "32", "34", "36"] },
    { id: "storm-runner", name: "Storm Runner 01", category: "Footwear", price: 138, image: imageUrls.runner, tag: "New drop", audience: ["Men", "Women"], sizes: ["7", "8", "9", "10", "11"] },
    { id: "night-shift", name: "Night Shift Sneaker", category: "Footwear", price: 124, image: imageUrls.look2, tag: "Limited", audience: ["Men", "Women"], sizes: ["7", "8", "9", "10", "11"] },
    { id: "signal-cap", name: "Signal 6-Panel Cap", category: "Accessories", price: 38, image: imageUrls.knit, tag: "Essential", audience: ["Men", "Women"], sizes: ["One size"] },
    { id: "everyday-tote", name: "Everyday Carry Tote", category: "Accessories", price: 34, image: imageUrls.closeup, tag: "Essential", audience: ["Men", "Women"], sizes: ["One size"] },
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

  function syncScrollLock() {
    document.body.classList.toggle("is-locked", dialog.open || cartDrawer.classList.contains("is-open"));
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
    document.querySelectorAll(".primary-nav a:not([data-category-link])").forEach((link) => {
      link.addEventListener("click", () => {
        document.querySelector(".primary-nav").classList.remove("is-open");
        document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
      });
    });
    const title = filter && filter !== "Sale" ? filter : "The latest drop";
    showDialog(`
      <p class="eyebrow">MADE TO MOVE DIFFERENTLY</p>
      <h2 id="dialog-title">${title}</h2>
      <p class="dialog-lead">Considered essentials. Built for the everyday and everything after.</p>
      <div class="product-grid">
        ${filtered.map((product) => `
          <article class="product-card">
            <div class="product-image"><img src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-tag">${product.tag}</span></div>
            <div class="product-info"><strong>${product.name}</strong><span>${formatPrice(product.price)}</span></div>
            <div class="product-buy-row">
              <select aria-label="Select a size for ${product.name}" data-size-for="${product.id}">
                ${product.sizes.map((size) => `<option value="${size}">${size}</option>`).join("")}
              </select>
              <button type="button" data-add-to-cart="${product.id}">Add to bag</button>
            </div>
          </article>
        `).join("")}
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
    return `<a class="search-result" href="#collections" data-search-category="${product.category}"><span>${product.name}</span><span>${formatPrice(product.price)} ↗</span></a>`;
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
        <button type="submit">Keep me posted <span>↗</span></button>
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
              <button type="button" data-cart-action="decrease" data-id="${product.id}" data-size="${line.size}" aria-label="Decrease quantity">−</button>
              <span>${line.quantity}</span>
              <button type="button" data-cart-action="increase" data-id="${product.id}" data-size="${line.size}" aria-label="Increase quantity">+</button>
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
    document.querySelector(".primary-nav").classList.remove("is-open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
    openAccount();
  }));
  document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => openShop(button.dataset.category)));
  document.querySelectorAll("[data-category-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector(".primary-nav").classList.remove("is-open");
      document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
      openShop(link.dataset.categoryLink);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
    });
  });

  document.querySelector(".menu-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
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

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      const productId = addButton.dataset.addToCart;
      const size = dialog.querySelector(`[data-size-for="${productId}"]`).value;
      addToCart(productId, size);
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

  document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
    event.preventDefault();
    document.querySelector("#newsletter-feedback").textContent = "Thanks for your interest — newsletter sign-up will be available at launch.";
    event.target.reset();
  });
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
  if (!reducedMotion) window.addEventListener("scroll", () => {
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
