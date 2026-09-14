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
  var momentLanguageChange = null;

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

    doc.querySelectorAll("[data-aria-en][data-aria-zh]").forEach(function (node) {
      node.setAttribute("aria-label", node.getAttribute("data-aria-" + currentLanguage));
    });

    doc.querySelectorAll("[data-href-en][data-href-zh]").forEach(function (node) {
      node.setAttribute("href", node.getAttribute("data-href-" + currentLanguage));
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

    safeStorageSet("portfolio-language", currentLanguage);
    if (momentLanguageChange) momentLanguageChange(currentLanguage);
  }

  languageButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setLanguage(currentLanguage === "en" ? "zh" : "en");
    });
  });

  setLanguage(safeStorageGet("portfolio-language") || "en");

  var year = doc.querySelector("#year, [data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  function setupMomentVideos() {
    var loopVideo = doc.getElementById("moment-loop");
    var loopButton = doc.querySelector(".moment-loop-toggle");
    var loopIcon = doc.querySelector(".moment-control-icon");
    var loopLabel = doc.querySelector(".moment-control-label");
    var loopStatus = doc.getElementById("moment-loop-status");
    var loopFrame = doc.querySelector(".moment-video-frame");
    var filmLink = doc.getElementById("moment-film-open");
    var filmDialog = doc.getElementById("moment-film-dialog");
    var filmVideo = doc.getElementById("moment-film");
    var filmClose = doc.querySelector(".moment-film-close");
    var filmStatus = doc.getElementById("moment-film-status");

    if (!loopVideo || !loopButton || !filmLink || !filmDialog || !filmVideo) return;

    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = Boolean(connection && connection.saveData);
    var nearViewport = false;
    var inViewport = false;
    var userPaused = false;
    var autoplayBlocked = false;
    var loopLanguage = null;
    var loadGeneration = 0;
    var failedLanguages = { en: false, zh: false };
    var dialogOpen = false;

    var loopMessages = {
      ready: { en: "Preview ready.", zh: "預覽已就緒。" },
      playing: { en: "Preview playing.", zh: "預覽播放中。" },
      paused: { en: "Preview paused.", zh: "預覽已暫停。" },
      reduced: { en: "Motion is reduced. Play the preview when ready.", zh: "已啟用減少動態效果，可手動播放預覽。" },
      saveData: { en: "Data Saver is on. Play the preview to load it.", zh: "已啟用數據節省，可手動載入並播放預覽。" },
      blocked: { en: "Playback did not start. Use the play button to try again.", zh: "瀏覽器未開始播放，請使用播放按鈕重試。" },
      error: { en: "This preview is unavailable. The full film link remains available.", zh: "此預覽目前無法播放，仍可使用完整影片連結。" }
    };
    var filmMessages = {
      controls: { en: "Use the player controls for playback, volume, progress, and fullscreen.", zh: "可使用播放器控制播放、音量、進度與全螢幕。" },
      changed: { en: "Language changed. Press play to start the English film.", zh: "語言已切換，請按下播放以開始繁體中文影片。" },
      blocked: { en: "Playback did not start automatically. Use the player controls to begin.", zh: "影片未自動開始，請使用播放器控制開始播放。" },
      error: { en: "The English film could not be loaded. You can still use the direct link.", zh: "繁體中文影片無法載入，仍可使用直接開啟連結。" }
    };

    function applyMessage(node, messages, key) {
      var message = messages[key];
      if (!node || !message) return;
      node.setAttribute("data-en", message.en);
      node.setAttribute("data-zh", message.zh);
      node.textContent = message[currentLanguage];
    }

    function setLoopStatus(key) {
      applyMessage(loopStatus, loopMessages, key);
    }

    function setFilmStatus(key) {
      applyMessage(filmStatus, filmMessages, key);
    }

    function setLoopControl() {
      var failed = failedLanguages[currentLanguage];
      var playing = !loopVideo.paused && !loopVideo.ended;
      var copy = failed
        ? { en: "Retry preview", zh: "重試預覽" }
        : playing
          ? { en: "Pause preview", zh: "暫停預覽" }
          : { en: "Play preview", zh: "播放預覽" };
      loopLabel.setAttribute("data-en", copy.en);
      loopLabel.setAttribute("data-zh", copy.zh);
      loopLabel.textContent = copy[currentLanguage];
      loopIcon.textContent = failed ? "↻" : playing ? "Ⅱ" : "▶";
    }

    function mediaPath(node, kind, language) {
      return node.getAttribute("data-" + kind + "-" + language);
    }

    function setPoster(node, language) {
      var poster = mediaPath(node, "poster", language);
      if (!poster) return;
      node.setAttribute("poster", poster);
      node.style.backgroundImage = "url('" + poster.replace(/'/g, "%27") + "')";
      if (node === loopVideo && loopFrame) {
        loopFrame.style.backgroundImage = "url('" + poster.replace(/'/g, "%27") + "')";
      }
    }

    function unloadVideo(video) {
      video.pause();
      video.removeAttribute("src");
      video.preload = "none";
      video.load();
    }

    function loadLoop(forceReload) {
      var language = currentLanguage;
      if (!forceReload && loopLanguage === language && loopVideo.getAttribute("src")) return;
      loadGeneration += 1;
      loopVideo.classList.remove("is-unavailable");
      loopVideo.preload = "metadata";
      loopVideo.setAttribute("src", mediaPath(loopVideo, "src", language));
      loopLanguage = language;
      loopVideo.load();
    }

    function canAutoPlay() {
      return !reducedMotion.matches && !saveData && !userPaused && !autoplayBlocked &&
        !doc.hidden && inViewport && !dialogOpen && !failedLanguages[currentLanguage];
    }

    function tryLoopPlay(manual) {
      if (!manual && !canAutoPlay()) return;
      if (manual) {
        userPaused = false;
        autoplayBlocked = false;
        if (failedLanguages[currentLanguage]) {
          failedLanguages[currentLanguage] = false;
          loadLoop(true);
        }
      } else if (!loopVideo.getAttribute("src")) {
        loadLoop(false);
      }
      if (!loopVideo.getAttribute("src")) loadLoop(false);

      var generation = loadGeneration;
      var promise;
      try {
        promise = loopVideo.play();
      } catch (error) {
        promise = Promise.reject(error);
      }
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (generation !== loadGeneration) return;
          autoplayBlocked = true;
          setLoopStatus("blocked");
          setLoopControl();
        });
      }
    }

    function pauseLoop(statusKey) {
      loopVideo.pause();
      if (statusKey) setLoopStatus(statusKey);
      setLoopControl();
    }

    function applyMomentLanguage(language) {
      loadGeneration += 1;
      loopVideo.pause();
      filmVideo.pause();
      setPoster(loopVideo, language);
      setPoster(filmVideo, language);
      loopVideo.classList.toggle("is-unavailable", failedLanguages[language]);
      unloadVideo(loopVideo);
      loopLanguage = null;
      autoplayBlocked = false;

      if (dialogOpen) {
        unloadVideo(filmVideo);
        filmVideo.preload = "metadata";
        filmVideo.setAttribute("src", mediaPath(filmVideo, "src", language));
        filmVideo.load();
        setFilmStatus("changed");
      } else {
        unloadVideo(filmVideo);
        setFilmStatus("controls");
      }

      if (failedLanguages[language]) setLoopStatus("error");
      else if (reducedMotion.matches) setLoopStatus("reduced");
      else if (saveData) setLoopStatus("saveData");
      else setLoopStatus(userPaused ? "paused" : "ready");
      setLoopControl();

      if (nearViewport && !saveData && !failedLanguages[language]) loadLoop(false);
      if (!dialogOpen && canAutoPlay()) tryLoopPlay(false);
    }

    loopButton.addEventListener("click", function () {
      if (!loopVideo.paused && !loopVideo.ended) {
        userPaused = true;
        pauseLoop("paused");
        return;
      }
      tryLoopPlay(true);
    });

    loopVideo.addEventListener("play", function () {
      setLoopStatus("playing");
      setLoopControl();
    });
    loopVideo.addEventListener("pause", function () {
      setLoopControl();
    });
    loopVideo.addEventListener("canplay", function () {
      if (loopLanguage === currentLanguage && canAutoPlay()) tryLoopPlay(false);
    });
    loopVideo.addEventListener("error", function () {
      if (!loopVideo.getAttribute("src")) return;
      failedLanguages[currentLanguage] = true;
      loopVideo.classList.add("is-unavailable");
      pauseLoop("error");
    });

    if ("IntersectionObserver" in window) {
      var loadObserver = new IntersectionObserver(function (entries) {
        nearViewport = entries.some(function (entry) { return entry.isIntersecting; });
        if (nearViewport && !saveData && !failedLanguages[currentLanguage]) loadLoop(false);
      }, { rootMargin: "280px 0px", threshold: 0 });
      loadObserver.observe(loopFrame || loopVideo);

      var playbackObserver = new IntersectionObserver(function (entries) {
        var entry = entries[0];
        inViewport = Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.35);
        if (inViewport) tryLoopPlay(false);
        else pauseLoop();
      }, { threshold: [0, 0.35, 0.65] });
      playbackObserver.observe(loopFrame || loopVideo);
    }

    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) pauseLoop();
      else if (canAutoPlay()) tryLoopPlay(false);
    });

    reducedMotion.addEventListener("change", function (event) {
      if (event.matches) pauseLoop("reduced");
      else if (canAutoPlay()) tryLoopPlay(false);
      else setLoopStatus(userPaused ? "paused" : saveData ? "saveData" : "ready");
    });

    function openFilm(event) {
      if (typeof filmDialog.showModal !== "function") return;
      event.preventDefault();
      dialogOpen = true;
      pauseLoop();
      setFilmStatus("controls");
      setPoster(filmVideo, currentLanguage);
      filmVideo.preload = "metadata";
      filmVideo.setAttribute("src", mediaPath(filmVideo, "src", currentLanguage));
      filmVideo.load();
      filmVideo.muted = false;
      filmDialog.showModal();
      doc.body.classList.add("moment-dialog-open");

      var promise;
      try {
        promise = filmVideo.play();
      } catch (error) {
        promise = Promise.reject(error);
      }
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (!dialogOpen) return;
          setFilmStatus("blocked");
        });
      }
    }

    function finishFilmClose() {
      if (!dialogOpen && !filmVideo.getAttribute("src")) return;
      dialogOpen = false;
      unloadVideo(filmVideo);
      doc.body.classList.remove("moment-dialog-open");
      setFilmStatus("controls");
      if (filmLink && filmLink.isConnected) filmLink.focus();
      if (canAutoPlay()) tryLoopPlay(false);
    }

    filmLink.addEventListener("click", openFilm);
    if (filmClose) {
      filmClose.addEventListener("click", function () {
        filmDialog.close();
      });
    }
    filmDialog.addEventListener("click", function (event) {
      if (event.target === filmDialog) filmDialog.close();
    });
    filmDialog.addEventListener("close", finishFilmClose);
    filmVideo.addEventListener("error", function () {
      if (!filmVideo.getAttribute("src")) return;
      filmVideo.pause();
      setFilmStatus("error");
    });

    momentLanguageChange = applyMomentLanguage;
    applyMomentLanguage(currentLanguage);
  }

  setupMomentVideos();

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
