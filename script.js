const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const contactEndpoint =
  window.location.port === "4173" ? "/api/contact" : "http://127.0.0.1:4173/api/contact";

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 60, 280)}ms`;
  observer.observe(item);
});

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = contactForm.querySelector("button[type='submit']");
    if (!button) {
      return;
    }

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    const originalText = button.textContent;

    button.textContent = "Sending...";
    button.disabled = true;

    if (formStatus) {
      formStatus.textContent = "Sending your message...";
      formStatus.className = "form-status is-pending";
    }

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            "The contact endpoint returned an invalid response. Make sure the site is running with node serve.js instead of a static preview server."
          );
        }
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to send message.");
      }

      if (formStatus) {
        formStatus.textContent = "Message sent successfully. I will get back to you soon.";
        formStatus.className = "form-status is-success";
      }

      contactForm.reset();
    } catch (error) {
      if (formStatus) {
        formStatus.textContent =
          error.message ||
          "Something went wrong while sending your message. Please try again or contact me directly by phone or email.";
        formStatus.className = "form-status is-error";
      }
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  });
}

