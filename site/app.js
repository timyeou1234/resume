(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");
  var languageButton = doc.querySelector(".lang-toggle");
  var currentLanguage = "en";

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function setLanguage(language) {
    currentLanguage = language === "zh" ? "zh" : "en";
    root.lang = currentLanguage === "zh" ? "zh-Hant" : "en";

    doc.querySelectorAll("[data-en][data-zh]").forEach(function (node) {
      node.textContent = node.getAttribute("data-" + currentLanguage);
    });

    var current = doc.querySelector(".lang-current");
    var next = doc.querySelector(".lang-next");

    if (current) current.textContent = currentLanguage === "en" ? "EN" : "中";
    if (next) next.textContent = currentLanguage === "en" ? "中" : "EN";

    if (languageButton) {
      languageButton.setAttribute(
        "aria-label",
        currentLanguage === "en" ? "切換為繁體中文" : "Switch to English"
      );
    }

    safeStorageSet("portfolio-language", currentLanguage);
  }

  if (languageButton) {
    languageButton.addEventListener("click", function () {
      setLanguage(currentLanguage === "en" ? "zh" : "en");
    });
  }

  setLanguage(safeStorageGet("portfolio-language") || "en");

  var year = doc.querySelector("#year, [data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  var progress = doc.querySelector(".scroll-progress span");
  var siteHeader = doc.querySelector(".site-header");
  var scrollTicking = false;

  function updateScrollState() {
    var maxScroll = doc.documentElement.scrollHeight - window.innerHeight;
    var ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    if (progress) progress.style.transform = "scaleX(" + Math.min(Math.max(ratio, 0), 1) + ")";
    if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollState);
        scrollTicking = true;
      }
    },
    { passive: true }
  );
  updateScrollState();

  var sectionLinks = Array.prototype.slice.call(doc.querySelectorAll(".site-nav a[href^='#']"));
  var observedSections = sectionLinks
    .map(function (link) {
      return doc.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          sectionLinks.forEach(function (link) {
            var isActive = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", isActive);
            if (isActive) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-32% 0px -58% 0px", threshold: 0 }
    );

    observedSections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  function revealElements() {
    var nodes = Array.prototype.slice.call(
      doc.querySelectorAll(
        ".eyebrow, .section-title, .section-lede, .principle-card, .case-copy > *, .case-visual, .scale-card, .method-step, .contact-inner > *"
      )
    );

    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var node = entry.target;
          var index = Number(node.getAttribute("data-reveal-index") || "0");
          node.animate(
            [
              { opacity: 0, transform: "translateY(24px)", filter: "blur(6px)" },
              { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
            ],
            {
              duration: 720,
              delay: Math.min(index * 55, 275),
              easing: "cubic-bezier(.2,.72,.18,1)",
              fill: "both"
            }
          );
          observer.unobserve(node);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach(function (node, index) {
      node.setAttribute("data-reveal-index", String(index % 5));
      revealObserver.observe(node);
    });
  }

  revealElements();

  var glow = doc.querySelector(".cursor-glow");
  var pointerX = window.innerWidth * 0.5;
  var pointerY = window.innerHeight * 0.5;
  var glowX = pointerX;
  var glowY = pointerY;
  var glowFrame = 0;

  function animateGlow() {
    glowX += (pointerX - glowX) * 0.14;
    glowY += (pointerY - glowY) * 0.14;

    if (glow) {
      glow.style.transform =
        "translate3d(" + (glowX - 240) + "px," + (glowY - 240) + "px,0)";
    }

    glowFrame = window.requestAnimationFrame(animateGlow);
  }

  if (glow && finePointer.matches && !reducedMotion.matches) {
    window.addEventListener(
      "pointermove",
      function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
      },
      { passive: true }
    );
    glowFrame = window.requestAnimationFrame(animateGlow);
  }

  function setupTilt() {
    if (!finePointer.matches || reducedMotion.matches) return;

    doc.querySelectorAll(".tilt").forEach(function (card) {
      var frame = 0;

      card.addEventListener(
        "pointermove",
        function (event) {
          var rect = card.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;

          window.cancelAnimationFrame(frame);
          frame = window.requestAnimationFrame(function () {
            card.style.transform =
              "perspective(900px) rotateX(" +
              (-y * 5).toFixed(2) +
              "deg) rotateY(" +
              (x * 7).toFixed(2) +
              "deg) translateY(-3px)";
          });
        },
        { passive: true }
      );

      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  function setupMagneticLinks() {
    if (!finePointer.matches || reducedMotion.matches) return;

    doc.querySelectorAll(".magnetic").forEach(function (link) {
      link.addEventListener(
        "pointermove",
        function (event) {
          var rect = link.getBoundingClientRect();
          var dx = event.clientX - (rect.left + rect.width / 2);
          var dy = event.clientY - (rect.top + rect.height / 2);
          link.style.transform =
            "translate3d(" + (dx * 0.12).toFixed(2) + "px," + (dy * 0.16).toFixed(2) + "px,0)";
        },
        { passive: true }
      );

      link.addEventListener("pointerleave", function () {
        link.style.transform = "";
      });
    });
  }

  setupTilt();
  setupMagneticLinks();

  var canvas = doc.getElementById("field");
  var canvasContext = canvas ? canvas.getContext("2d") : null;
  var particles = [];
  var particleFrame = 0;
  var canvasWidth = 0;
  var canvasHeight = 0;
  var pixelRatio = 1;
  var pointerActive = false;

  function createParticles() {
    if (!canvasContext || reducedMotion.matches) return;

    var count = Math.max(28, Math.min(64, Math.floor(canvasWidth / 24)));
    particles = [];

    for (var index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.35 + 0.55,
        color: index % 3
      });
    }
  }

  function resizeCanvas() {
    if (!canvas || !canvasContext) return;

    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = Math.round(canvasWidth * pixelRatio);
    canvas.height = Math.round(canvasHeight * pixelRatio);
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
    canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createParticles();
  }

  function particleColor(index, alpha) {
    if (index === 1) return "rgba(83, 230, 255," + alpha + ")";
    if (index === 2) return "rgba(137, 255, 177," + alpha + ")";
    return "rgba(162, 116, 255," + alpha + ")";
  }

  function animateParticles() {
    if (!canvasContext || reducedMotion.matches) return;

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    for (var i = 0; i < particles.length; i += 1) {
      var particle = particles[i];

      if (pointerActive) {
        var pointerDx = pointerX - particle.x;
        var pointerDy = pointerY - particle.y;
        var pointerDistance = Math.sqrt(pointerDx * pointerDx + pointerDy * pointerDy);

        if (pointerDistance > 1 && pointerDistance < 190) {
          var pull = (1 - pointerDistance / 190) * 0.0028;
          particle.vx += pointerDx * pull;
          particle.vy += pointerDy * pull;
        }
      }

      particle.vx *= 0.992;
      particle.vy *= 0.992;
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) particle.x = canvasWidth + 10;
      if (particle.x > canvasWidth + 10) particle.x = -10;
      if (particle.y < -10) particle.y = canvasHeight + 10;
      if (particle.y > canvasHeight + 10) particle.y = -10;

      for (var j = i + 1; j < particles.length; j += 1) {
        var other = particles[j];
        var dx = particle.x - other.x;
        var dy = particle.y - other.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var maxDistance = canvasWidth < 720 ? 82 : 118;

        if (distance < maxDistance) {
          var lineAlpha = (1 - distance / maxDistance) * 0.13;
          canvasContext.beginPath();
          canvasContext.moveTo(particle.x, particle.y);
          canvasContext.lineTo(other.x, other.y);
          canvasContext.strokeStyle = particleColor(particle.color, lineAlpha);
          canvasContext.lineWidth = 0.7;
          canvasContext.stroke();
        }
      }

      canvasContext.beginPath();
      canvasContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      canvasContext.fillStyle = particleColor(particle.color, 0.52);
      canvasContext.fill();
    }

    particleFrame = window.requestAnimationFrame(animateParticles);
  }

  if (canvas && canvasContext && !reducedMotion.matches) {
    resizeCanvas();

    window.addEventListener(
      "resize",
      function () {
        window.cancelAnimationFrame(particleFrame);
        resizeCanvas();
        particleFrame = window.requestAnimationFrame(animateParticles);
      },
      { passive: true }
    );

    window.addEventListener(
      "pointermove",
      function () {
        pointerActive = true;
      },
      { passive: true }
    );

    window.addEventListener("pointerout", function (event) {
      if (!event.relatedTarget) pointerActive = false;
    });

    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) {
        window.cancelAnimationFrame(particleFrame);
      } else if (!reducedMotion.matches) {
        particleFrame = window.requestAnimationFrame(animateParticles);
      }
    });

    particleFrame = window.requestAnimationFrame(animateParticles);
  }

  reducedMotion.addEventListener("change", function (event) {
    if (event.matches) {
      window.cancelAnimationFrame(particleFrame);
      window.cancelAnimationFrame(glowFrame);
      if (canvasContext) canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
      if (glow) glow.style.transform = "";
    } else {
      resizeCanvas();
      particleFrame = window.requestAnimationFrame(animateParticles);
      if (glow && finePointer.matches) glowFrame = window.requestAnimationFrame(animateGlow);
    }
  });
})();
