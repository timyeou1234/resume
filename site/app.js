(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");
  var coarsePointer = window.matchMedia("(pointer: coarse)");
  var compactViewport = window.matchMedia("(max-width: 720px)");
  var languageButtons = Array.prototype.slice.call(doc.querySelectorAll(".lang-toggle"));
  var currentLanguage = "en";
  var updateShowcaseLanguage = function () {};

  function setLanguage(language) {
    currentLanguage = language === "zh" ? "zh" : "en";
    root.lang = currentLanguage === "zh" ? "zh-Hant" : "en";

    doc.querySelectorAll("[data-en][data-zh]").forEach(function (node) {
      node.textContent = node.getAttribute("data-" + currentLanguage);
    });

    doc.querySelectorAll("[data-aria-en][data-aria-zh]").forEach(function (node) {
      node.setAttribute("aria-label", node.getAttribute("data-aria-" + currentLanguage));
    });

    doc.querySelectorAll("[data-href-en][data-href-zh]").forEach(function (node) {
      node.setAttribute("href", node.getAttribute("data-href-" + currentLanguage));
    });

    doc.querySelectorAll("img[data-image-en][data-image-zh]").forEach(function (node) {
      node.setAttribute("src", node.getAttribute("data-image-" + currentLanguage));
    });

    doc.querySelectorAll("img[data-alt-en][data-alt-zh]").forEach(function (node) {
      node.setAttribute("alt", node.getAttribute("data-alt-" + currentLanguage));
    });

    doc.querySelectorAll(".lang-current").forEach(function (current) {
      current.textContent = currentLanguage === "en" ? "EN" : "中";
    });
    doc.querySelectorAll(".lang-next").forEach(function (next) {
      next.textContent = currentLanguage === "en" ? "中" : "EN";
    });

    languageButtons.forEach(function (button) {
      button.setAttribute(
        "aria-label",
        currentLanguage === "en" ? "切換為繁體中文" : "Switch to English"
      );
    });

    doc.querySelectorAll("[data-content-en][data-content-zh]").forEach(function (node) {
      node.setAttribute("content", node.getAttribute("data-content-" + currentLanguage));
    });
    doc.querySelectorAll("[data-title-en][data-title-zh]").forEach(function (node) {
      node.setAttribute("title", node.getAttribute("data-title-" + currentLanguage));
    });
    updateShowcaseLanguage();
  }

  // The URL and its prerendered HTML determine the language, including without JS.
  setLanguage(root.lang === "zh-Hant" ? "zh" : "en");
  function updateLanguageLinks() {
    languageButtons.forEach(function (link) {
      link.href = (currentLanguage === "en" ? "/" : "/en/") + window.location.hash;
    });
  }
  updateLanguageLinks();
  window.addEventListener("hashchange", updateLanguageLinks);

  // Animate original captures. Each scene remains inspectable at its source size.
  (function setupProductShowcases() {
    var duration = 5500;
    var frame = 0;
    var previousTime = 0;
    var showcases = Array.from(doc.querySelectorAll("[data-product-showcase]"));
    var players = showcases.map(function (element) {
      var player = {
        element: element,
        scenes: Array.from(element.querySelectorAll("[data-scene]")),
        steps: Array.from(element.querySelectorAll("[data-showcase-step]")),
        toggle: element.querySelector("[data-showcase-toggle]"),
        index: 0, elapsed: 0, visible: false,
        paused: reducedMotion.matches || !!(navigator.connection && navigator.connection.saveData)
      };
      element.querySelector(".showcase-controls").hidden = false;
      player.toggle.addEventListener("click", function () {
        player.paused = !player.paused;
        syncPlayback();
      });
      player.steps.forEach(function (step, index) {
        step.addEventListener("click", function () {
          player.paused = true;
          showScene(player, index);
          syncPlayback();
        });
      });
      // Keep a focused image link stable while reading or opening the original.
      element.querySelector(".showcase-stage").addEventListener("focusin", function () {
        player.paused = true;
        syncPlayback();
      });
      return player;
    });

    function isPlaying(player) {
      return player.visible && !player.paused && !doc.hidden;
    }

    function showScene(player, index) {
      player.index = index;
      player.elapsed = 0;
      player.element.dataset.activeScene = String(index);
      player.element.style.setProperty("--scene-progress", "0");
      player.scenes.forEach(function (scene, position) { scene.hidden = position !== index; });
      player.steps.forEach(function (step, position) {
        if (position === index) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    }

    function updateLabels() {
      players.forEach(function (player) {
        var label = player.toggle.querySelector("[data-playback-label]");
        label.textContent = currentLanguage === "zh" ? (player.paused ? "播放" : "暫停") : (player.paused ? "Play" : "Pause");
        player.toggle.setAttribute("aria-pressed", String(player.paused));
      });
    }

    function tick(time) {
      var elapsed = previousTime ? Math.max(time - previousTime, 0) : 0;
      previousTime = time;
      players.forEach(function (player) {
        if (!isPlaying(player)) return;
        player.elapsed += elapsed;
        if (player.elapsed >= duration) {
          var remainder = player.elapsed % duration;
          var next = (player.index + Math.floor(player.elapsed / duration)) % player.scenes.length;
          showScene(player, next);
          player.elapsed = remainder;
        }
        player.element.style.setProperty("--scene-progress", String(player.elapsed / duration));
      });
      frame = window.requestAnimationFrame(tick);
    }

    function syncPlayback() {
      updateLabels();
      players.forEach(function (player) {
        player.element.classList.toggle("is-playing", isPlaying(player));
        player.element.dataset.playback = isPlaying(player) ? "playing" : "paused";
      });
      if (players.some(isPlaying)) {
        if (!frame) { previousTime = 0; frame = window.requestAnimationFrame(tick); }
      } else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      }
    }

    players.forEach(function (player) { showScene(player, 0); });
    updateShowcaseLanguage = updateLabels;
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var player = players[showcases.indexOf(entry.target)];
          player.visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
          if (player.visible) player.element.querySelectorAll("img").forEach(function (img) { img.loading = "eager"; });
        });
        syncPlayback();
      }, { threshold: [0, 0.15] });
      showcases.forEach(function (element) { observer.observe(element); });
    } else {
      players.forEach(function (player) { player.visible = true; player.paused = true; });
    }
    doc.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", function () {
      if (reducedMotion.matches) players.forEach(function (player) { player.paused = true; });
      syncPlayback();
    });
    syncPlayback();
  })();

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
    var nodes = Array.prototype.slice.call(doc.querySelectorAll("[data-reveal]"));

    if (
      reducedMotion.matches ||
      compactViewport.matches ||
      coarsePointer.matches ||
      !("IntersectionObserver" in window)
    ) return;

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var node = entry.target;
          var index = Number(node.getAttribute("data-reveal-index") || "0");
          var keyframes = [
            { opacity: 0, transform: "translateY(24px)", filter: "blur(6px)" },
            { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }
          ];

          node.animate(keyframes, {
            duration: 720,
            delay: Math.min(index * 55, 275),
            easing: "cubic-bezier(.2,.72,.18,1)",
            fill: "backwards"
          });
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
  var particlesPaused = false;
  var particleResizeTimer = 0;
  var lastParticleTime = 0;

  function createParticles() {
    if (!canvasContext || reducedMotion.matches) return;

    var count = coarsePointer.matches
      ? 18
      : Math.max(28, Math.min(64, Math.floor(canvasWidth / 24)));
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

    pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      coarsePointer.matches || compactViewport.matches ? 1 : 1.5
    );
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

  function animateParticles(timestamp) {
    if (!canvasContext || reducedMotion.matches || particlesPaused) return;

    if (coarsePointer.matches && timestamp - lastParticleTime < 32) {
      particleFrame = window.requestAnimationFrame(animateParticles);
      return;
    }

    lastParticleTime = timestamp;
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

  if (
    canvas &&
    canvasContext &&
    !reducedMotion.matches &&
    !compactViewport.matches &&
    !coarsePointer.matches
  ) {
    resizeCanvas();

    window.addEventListener(
      "resize",
      function () {
        var widthChanged = Math.abs(window.innerWidth - canvasWidth) > 2;
        var heightDelta = Math.abs(window.innerHeight - canvasHeight);
        var browserChromeShift =
          coarsePointer.matches &&
          !widthChanged &&
          heightDelta < Math.max(180, canvasHeight * 0.28);

        if (browserChromeShift) return;

        window.clearTimeout(particleResizeTimer);
        particleResizeTimer = window.setTimeout(function () {
          window.cancelAnimationFrame(particleFrame);
          resizeCanvas();
          if (!doc.hidden && !particlesPaused && !reducedMotion.matches) {
            particleFrame = window.requestAnimationFrame(animateParticles);
          }
        }, 120);
      },
      { passive: true }
    );

    if (finePointer.matches) {
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
    }

    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) {
        window.cancelAnimationFrame(particleFrame);
      } else if (!reducedMotion.matches && !particlesPaused) {
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
    } else if (!compactViewport.matches && !coarsePointer.matches) {
      particlesPaused = false;
      lastParticleTime = 0;
      resizeCanvas();
      particleFrame = window.requestAnimationFrame(animateParticles);
      if (glow && finePointer.matches) glowFrame = window.requestAnimationFrame(animateGlow);
    }
  });
})();
