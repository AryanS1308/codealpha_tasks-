/* ==========================================================================
   Aryan Shukla Developer Portfolio Application Script
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupNavbarScroll();
  setupMobileMenu();
  setupScrollReveal();
  setupActiveNavObserver();
  setupContactForm();
});

// --- Shrink Navbar Header on Scroll ---
function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// --- Mobile Hamburger Menu Drawer Toggler ---
function setupMobileMenu() {
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  // Collapse drawer when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });
}

// --- Scroll-Reveal Observer ---
function setupScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // Option: stop observing once triggered to prevent repetitive cycles
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px" // Triggers slightly before crossing screen fold
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// --- Track Active Viewport Section to Highlight Links ---
function setupActiveNavObserver() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        
        navLinks.forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, {
    threshold: 0.35, // Requires 35% of the section to be in screen
    rootMargin: "-80px 0px 0px 0px" // Accounts for sticky navbar header height
  });

  sections.forEach(sec => sectionObserver.observe(sec));
}

// --- Contact Form Mock Submit & Toast Alerts ---
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const toastContainer = document.getElementById("toast-container");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Fetch values (for mock process validation)
    const nameVal = document.getElementById("form-name").value;
    const emailVal = document.getElementById("form-email").value;

    if (!nameVal || !emailVal) return;

    // Trigger Toast Notification Alert
    showToast(`Thanks for reaching out, ${nameVal}! I will reply shortly.`);

    // Reset fields
    form.reset();
  });

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Trigger paint and reveal transition
    setTimeout(() => {
      toast.classList.add("show");
    }, 50);

    // Fade out and remove toast node
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4000);
  }
}
