/* ==========================================================================
   Aetheria Immersive Gallery Application Script
   ========================================================================== */

// --- Showcase Dataset ---
const galleryItems = [
  {
    id: 1,
    title: "Whispering Pines",
    category: "nature",
    description: "Mystical golden sunbeams filtering through ancient giant trees in a dew-covered woodland.",
    filename: "forest.png"
  },
  {
    id: 2,
    title: "Mirror Lake Sunrise",
    category: "nature",
    description: "The glowing morning light hitting snow-covered peaks reflected perfectly on a glassy alpine lake.",
    filename: "mountain.png"
  },
  {
    id: 3,
    title: "Cyber Nexus Tower",
    category: "architecture",
    description: "A soaring futuristic skyscraper reaching into the twilight haze with glowing neon-lit glass facades.",
    filename: "skyscraper.png"
  },
  {
    id: 4,
    title: "Golden Span Bridge",
    category: "architecture",
    description: "An illuminated suspension bridge reaching across a wide river wrapped in golden evening mist.",
    filename: "bridge.png"
  },
  {
    id: 5,
    title: "Monarch Portrait",
    category: "animals",
    description: "A high-contrast studio portrait capturing the intense focus and majestic presence of a golden-maned lion.",
    filename: "lion.png"
  },
  {
    id: 6,
    title: "Winter Red Fox",
    category: "animals",
    description: "A beautiful orange fox standing alert amidst falling snowflakes in a quiet winter forest clearing.",
    filename: "fox.png"
  }
];

// --- State Management ---
let currentFilter = "all";
let activeImageIndex = 0;
let filteredItems = [...galleryItems];

// --- DOM Elements ---
const galleryGrid = document.getElementById("gallery-grid");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");

// Lightbox Elements
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCounter = document.getElementById("lightbox-counter");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDesc = document.getElementById("lightbox-desc");
const lightboxTag = document.getElementById("lightbox-tag");
const lightboxBackdrop = document.getElementById("lightbox-backdrop");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  renderGallery();
  setupFilterListeners();
  setupLightboxListeners();
});

// --- Core Gallery Render ---
function renderGallery() {
  galleryGrid.innerHTML = "";
  
  // Apply filter
  filteredItems = galleryItems.filter(item => 
    currentFilter === "all" || item.category === currentFilter
  );

  // Toggle Empty State
  if (filteredItems.length === 0) {
    emptyState.style.display = "flex";
    galleryGrid.style.display = "none";
    return;
  } else {
    emptyState.style.display = "none";
    galleryGrid.style.display = "grid";
  }

  // Create card DOM elements
  filteredItems.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "gallery-item";
    card.setAttribute("data-id", item.id);
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${item.title}`);
    
    // Stagger entry animations
    card.style.transitionDelay = `${index * 0.05}s`;

    card.innerHTML = `
      <div class="gallery-item-wrapper">
        <img src="/images/${item.filename}" alt="${item.title}" loading="lazy">
        <div class="zoom-indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
        <div class="gallery-item-overlay">
          <div class="gallery-item-meta">
            <span class="item-tag">${item.category}</span>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </div>
      </div>
    `;

    // Click to open lightbox
    card.addEventListener("click", () => {
      openLightbox(index);
    });

    // Handle Keyboard "Enter" or "Space" key
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(index);
      }
    });

    galleryGrid.appendChild(card);
    
    // Trigger paint to run transition
    setTimeout(() => {
      card.classList.add("show");
    }, 10);
  });
}

// --- Category Filtering Support ---
function setupFilterListeners() {
  filterButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Find closest button target
      const button = e.currentTarget;
      const targetFilter = button.getAttribute("data-filter");

      if (currentFilter === targetFilter) return;

      // Update active button state
      filterButtons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");

      // Set new state and re-render
      currentFilter = targetFilter;
      renderGallery();
    });
  });
}

// --- Lightbox Support Functions ---
function setupLightboxListeners() {
  // Navigation trigger
  lightboxPrev.addEventListener("click", navigatePrevious);
  lightboxNext.addEventListener("click", navigateNext);
  
  // Close actions
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxBackdrop.addEventListener("click", closeLightbox);

  // Keyboard navigation & Close
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      navigateNext();
    } else if (e.key === "ArrowLeft") {
      navigatePrevious();
    } else if (e.key === "Tab") {
      // Manage accessibility focus loop inside lightbox
      handleFocusLoop(e);
    }
  });

  // Small detail: click the active image triggers the next one
  lightboxImg.addEventListener("click", navigateNext);
}

function openLightbox(index) {
  activeImageIndex = index;
  updateLightboxContent();
  
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  
  // Remember previous focus and focus the lightbox modal for screen readers
  document.body.style.overflow = "hidden"; // Prevent scrolling
  lightbox.focus();
}

function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // Re-enable background scrolling
  
  // Restore focus to original gallery card
  const originalCard = galleryGrid.children[activeImageIndex];
  if (originalCard) {
    originalCard.focus();
  }
}

function navigateNext() {
  // Loop wrap-around
  activeImageIndex = (activeImageIndex + 1) % filteredItems.length;
  triggerImageTransition();
}

function navigatePrevious() {
  // Loop wrap-around
  activeImageIndex = (activeImageIndex - 1 + filteredItems.length) % filteredItems.length;
  triggerImageTransition();
}

// Transition animation on navigation
function triggerImageTransition() {
  // Briefly remove class to reset scale bounce
  lightboxImg.classList.remove("show-img");
  
  setTimeout(() => {
    updateLightboxContent();
  }, 150);
}

function updateLightboxContent() {
  const item = filteredItems[activeImageIndex];
  if (!item) return;

  // Populating text fields
  lightboxImg.src = `/images/${item.filename}`;
  lightboxImg.alt = item.title;
  lightboxTitle.textContent = item.title;
  lightboxDesc.textContent = item.description;
  lightboxTag.textContent = item.category;
  lightboxCounter.textContent = `${activeImageIndex + 1} / ${filteredItems.length}`;

  // Image load smooth entry trigger
  lightboxImg.onload = () => {
    lightboxImg.classList.add("show-img");
  };
}

// Focus trap loop helper
function handleFocusLoop(e) {
  const focusables = lightbox.querySelectorAll('button, [tabindex="0"]');
  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstFocusable) {
      lastFocusable.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      firstFocusable.focus();
      e.preventDefault();
    }
  }
}
