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
  var projectLanguageChange = null;

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
    if (projectLanguageChange) projectLanguageChange(currentLanguage);
  }

  languageButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setLanguage(currentLanguage === "en" ? "zh" : "en");
    });
  });

  setLanguage(safeStorageGet("portfolio-language") || "en");

  var year = doc.querySelector("#year, [data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  function setupProjectVideos() {
    var showcases = Array.prototype.slice.call(doc.querySelectorAll("[data-project-video]"));
    var filmDialog = doc.getElementById("project-film-dialog");
    var filmVideo = doc.getElementById("project-film");
    var filmTitle = doc.getElementById("project-film-title");
    var filmClose = doc.querySelector(".project-film-close");
    var filmStatus = doc.getElementById("project-film-status");
    var filmDirect = doc.querySelector(".project-film-direct");

    if (!showcases.length || !filmDialog || !filmVideo || !filmTitle || !filmDirect) return;

    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = Boolean(connection && connection.saveData);
    var controllers = [];
    var dialogOpen = false;
    var activeController = null;
    var filmGeneration = 0;
    var returnFocus = null;

    var loopMessages = {
      waiting: { en: "The preview loads as it approaches the screen.", zh: "預覽接近畫面時載入。" },
      ready: { en: "Preview ready.", zh: "預覽已就緒。" },
      playing: { en: "Preview playing.", zh: "預覽播放中。" },
      paused: { en: "Preview paused.", zh: "預覽已暫停。" },
      reduced: { en: "Motion is reduced. Play the preview when ready.", zh: "已啟用減少動態效果，可手動播放預覽。" },
      saveData: { en: "Data Saver is on. Play the preview to load it.", zh: "已啟用數據節省，可手動載入並播放預覽。" },
      blocked: { en: "Playback did not start. Use the play button to try again.", zh: "瀏覽器未開始播放，請使用播放按鈕重試。" },
      error: { en: "This preview is unavailable. The full film link remains available.", zh: "此預覽目前無法播放，仍可使用完整影片連結。" }
    };
    var frameMessages = {
      loading: { en: "Loading preview…", zh: "載入預覽中…" },
      unavailable: { en: "Preview cover unavailable", zh: "預覽封面無法載入" }
    };
    var filmMessages = {
      controls: { en: "Use the player controls for playback, volume, progress, and fullscreen.", zh: "可使用播放器控制播放、音量、進度與全螢幕。" },
      changed: { en: "Language changed. Press play to start the English film.", zh: "語言已切換，請按下播放以開始繁體中文影片。" },
      blocked: { en: "Playback did not start automatically. Use the player controls to begin.", zh: "影片未自動開始，請使用播放器控制開始播放。" },
      error: { en: "The selected film could not be loaded. You can still use the direct link.", zh: "所選影片無法載入，仍可使用直接開啟連結。" }
    };

    function applyMessage(node, messages, key) {
      var message = messages[key];
      if (!node || !message) return;
      node.setAttribute("data-en", message.en);
      node.setAttribute("data-zh", message.zh);
      node.textContent = message[currentLanguage];
    }

    function mediaPath(node, kind, language) {
      return node.getAttribute("data-" + kind + "-" + language);
    }

    function backgroundImage(path) {
      return "url('" + path.replace(/'/g, "%27") + "')";
    }

    function clearPoster(controller) {
      controller.posterGeneration += 1;
      if (controller.posterImage) {
        controller.posterImage.onload = null;
        controller.posterImage.onerror = null;
      }
      controller.posterImage = null;
      controller.posterLanguage = null;
      controller.loopVideo.removeAttribute("poster");
      controller.loopVideo.style.backgroundImage = "";
      controller.loopFrame.style.backgroundImage = "";
      controller.loopFrame.classList.remove("has-poster", "has-media", "is-poster-loading", "is-poster-unavailable");
      applyMessage(controller.loadingLabel, frameMessages, "loading");
    }

    function loadPoster(controller, language) {
      var poster = mediaPath(controller.loopVideo, "poster", language);
      if (!poster) return;
      if (controller.posterLanguage === language &&
          (controller.loopFrame.classList.contains("has-poster") || controller.posterImage)) return;

      controller.posterGeneration += 1;
      var generation = controller.posterGeneration;
      var image = new Image();
      controller.posterImage = image;
      controller.posterLanguage = language;
      controller.loopFrame.classList.remove("is-poster-unavailable");
      controller.loopFrame.classList.add("is-poster-loading");
      applyMessage(controller.loadingLabel, frameMessages, "loading");
      image.decoding = "async";
      image.fetchPriority = controller.inViewport ? "high" : "low";
      image.onload = function () {
        if (generation !== controller.posterGeneration || language !== currentLanguage) return;
        controller.posterImage = null;
        controller.loopVideo.setAttribute("poster", poster);
        controller.loopVideo.style.backgroundImage = backgroundImage(poster);
        controller.loopFrame.style.backgroundImage = backgroundImage(poster);
        controller.loopFrame.classList.remove("is-poster-loading", "is-poster-unavailable");
        controller.loopFrame.classList.add("has-poster");
        if (!controller.loopVideo.getAttribute("src") && !reducedMotion.matches && !saveData && !controller.userPaused) {
          setLoopStatus(controller, "ready");
        }
      };
      image.onerror = function () {
        if (generation !== controller.posterGeneration || language !== currentLanguage) return;
        controller.posterImage = null;
        controller.loopFrame.classList.remove("is-poster-loading");
        controller.loopFrame.classList.add("is-poster-unavailable");
        applyMessage(controller.loadingLabel, frameMessages, "unavailable");
      };
      image.src = poster;
    }

    function unloadVideo(video) {
      video.pause();
      video.removeAttribute("src");
      video.preload = "none";
      video.load();
    }

    function setLoopStatus(controller, key) {
      applyMessage(controller.loopStatus, loopMessages, key);
    }

    function setFilmStatus(key) {
      applyMessage(filmStatus, filmMessages, key);
    }

    function setLoopControl(controller) {
      var failed = controller.failedLanguages[currentLanguage];
      var playing = !controller.loopVideo.paused && !controller.loopVideo.ended;
      var copy = failed
        ? { en: "Retry preview", zh: "重試預覽" }
        : playing
          ? { en: "Pause preview", zh: "暫停預覽" }
          : { en: "Play preview", zh: "播放預覽" };
      controller.loopLabel.setAttribute("data-en", copy.en);
      controller.loopLabel.setAttribute("data-zh", copy.zh);
      controller.loopLabel.textContent = copy[currentLanguage];
      controller.loopIcon.textContent = failed ? "↻" : playing ? "Ⅱ" : "▶";
    }

    function loadLoop(controller, forceReload) {
      var language = currentLanguage;
      if (!forceReload && controller.loopLanguage === language && controller.loopVideo.getAttribute("src")) return;
      loadPoster(controller, language);
      controller.loadGeneration += 1;
      controller.loopVideo.classList.remove("is-unavailable");
      controller.loopVideo.preload = "metadata";
      controller.loopVideo.setAttribute("src", mediaPath(controller.loopVideo, "src", language));
      controller.loopLanguage = language;
      controller.loopVideo.load();
    }

    function canAutoPlay(controller) {
      return !reducedMotion.matches && !saveData && !controller.userPaused && !controller.autoplayBlocked &&
        !doc.hidden && controller.inViewport && !dialogOpen && !controller.failedLanguages[currentLanguage];
    }

    function pauseLoop(controller, statusKey) {
      controller.loopVideo.pause();
      if (statusKey) setLoopStatus(controller, statusKey);
      setLoopControl(controller);
    }

    function pauseOtherLoops(active) {
      controllers.forEach(function (controller) {
        if (controller !== active) pauseLoop(controller);
      });
    }

    function tryLoopPlay(controller, manual) {
      if (!manual && !canAutoPlay(controller)) return;
      if (manual) {
        controller.userPaused = false;
        controller.autoplayBlocked = false;
        if (controller.failedLanguages[currentLanguage]) {
          controller.failedLanguages[currentLanguage] = false;
          loadLoop(controller, true);
        }
      }
      if (!controller.loopVideo.getAttribute("src")) loadLoop(controller, false);

      var generation = controller.loadGeneration;
      var promise;
      try {
        promise = controller.loopVideo.play();
      } catch (error) {
        promise = Promise.reject(error);
      }
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (generation !== controller.loadGeneration) return;
          controller.autoplayBlocked = true;
          setLoopStatus(controller, "blocked");
          setLoopControl(controller);
        });
      }
    }

    function applyControllerLanguage(controller, language) {
      controller.loadGeneration += 1;
      pauseLoop(controller);
      clearPoster(controller);
      controller.loopVideo.classList.toggle("is-unavailable", controller.failedLanguages[language]);
      unloadVideo(controller.loopVideo);
      controller.loopLanguage = null;
      controller.autoplayBlocked = false;

      if (controller.failedLanguages[language]) setLoopStatus(controller, "error");
      else if (reducedMotion.matches) setLoopStatus(controller, "reduced");
      else if (saveData) setLoopStatus(controller, "saveData");
      else setLoopStatus(controller, controller.userPaused ? "paused" : controller.posterNearViewport ? "ready" : "waiting");
      setLoopControl(controller);

      if (controller.posterNearViewport) loadPoster(controller, language);
      if (controller.nearViewport && !saveData && !controller.failedLanguages[language]) loadLoop(controller, false);
      if (canAutoPlay(controller)) tryLoopPlay(controller, false);
    }

    function projectTitle(controller, language) {
      return controller.showcase.getAttribute("data-project-title-" + language) ||
        controller.showcase.getAttribute("data-project-title") || controller.project;
    }

    function updateFilmIdentity() {
      if (!activeController) return;
      filmTitle.textContent = projectTitle(activeController, currentLanguage) +
        (currentLanguage === "en" ? " · Full introduction" : " · 完整介紹");
      filmDirect.setAttribute("href", mediaPath(activeController.filmLink, "href", currentLanguage));
    }

    function prepareFilm(startPlayback) {
      if (!activeController) return;
      filmGeneration += 1;
      var generation = filmGeneration;
      unloadVideo(filmVideo);
      updateFilmIdentity();
      var poster = mediaPath(activeController.loopVideo, "poster", currentLanguage);
      filmVideo.setAttribute("poster", poster);
      filmVideo.style.backgroundImage = backgroundImage(poster);
      filmVideo.preload = "metadata";
      filmVideo.setAttribute("src", mediaPath(activeController.filmLink, "href", currentLanguage));
      filmVideo.load();
      filmVideo.muted = false;
      if (!startPlayback) return;

      var promise;
      try {
        promise = filmVideo.play();
      } catch (error) {
        promise = Promise.reject(error);
      }
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (!dialogOpen || generation !== filmGeneration) return;
          setFilmStatus("blocked");
        });
      }
    }

    function openFilm(controller, event) {
      if (typeof filmDialog.showModal !== "function") return;
      try {
        filmDialog.showModal();
      } catch (error) {
        return;
      }
      event.preventDefault();
      dialogOpen = true;
      activeController = controller;
      returnFocus = controller.filmLink;
      controllers.forEach(function (item) { pauseLoop(item); });
      setFilmStatus("controls");
      doc.body.classList.add("project-dialog-open");
      prepareFilm(true);
    }

    showcases.forEach(function (showcase) {
      var controller = {
        showcase: showcase,
        project: showcase.getAttribute("data-project-video"),
        loopVideo: showcase.querySelector(".project-loop-video"),
        loopButton: showcase.querySelector(".project-loop-toggle"),
        loopIcon: showcase.querySelector(".project-control-icon"),
        loopLabel: showcase.querySelector(".project-control-label"),
        loopStatus: showcase.querySelector("[aria-live]"),
        loadingLabel: showcase.querySelector(".project-loading-label"),
        loopFrame: showcase.querySelector(".project-video-frame"),
        filmLink: showcase.querySelector(".project-film-link"),
        posterNearViewport: false,
        nearViewport: false,
        inViewport: false,
        userPaused: false,
        autoplayBlocked: false,
        loopLanguage: null,
        loadGeneration: 0,
        posterGeneration: 0,
        posterLanguage: null,
        posterImage: null,
        failedLanguages: { en: false, zh: false }
      };
      if (!controller.loopVideo || !controller.loopButton || !controller.loadingLabel || !controller.loopFrame || !controller.filmLink) return;
      controllers.push(controller);

      controller.loopButton.addEventListener("click", function () {
        if (!controller.loopVideo.paused && !controller.loopVideo.ended) {
          controller.userPaused = true;
          pauseLoop(controller, "paused");
          return;
        }
        tryLoopPlay(controller, true);
      });
      controller.loopVideo.addEventListener("play", function () {
        pauseOtherLoops(controller);
        setLoopStatus(controller, "playing");
        setLoopControl(controller);
      });
      controller.loopVideo.addEventListener("pause", function () {
        setLoopControl(controller);
      });
      controller.loopVideo.addEventListener("canplay", function () {
        if (controller.loopLanguage === currentLanguage && canAutoPlay(controller)) tryLoopPlay(controller, false);
      });
      controller.loopVideo.addEventListener("loadeddata", function () {
        if (controller.loopLanguage !== currentLanguage) return;
        controller.loopFrame.classList.remove("is-poster-loading", "is-poster-unavailable");
        controller.loopFrame.classList.add("has-media");
      });
      controller.loopVideo.addEventListener("error", function () {
        var failedLanguage = controller.loopLanguage;
        if (!failedLanguage || !controller.loopVideo.getAttribute("src")) return;
        controller.failedLanguages[failedLanguage] = true;
        if (failedLanguage !== currentLanguage) return;
        controller.loopVideo.classList.add("is-unavailable");
        pauseLoop(controller, "error");
      });
      controller.filmLink.addEventListener("click", function (event) {
        openFilm(controller, event);
      });

      if ("IntersectionObserver" in window) {
        var posterObserver = new IntersectionObserver(function (entries) {
          var entry = entries[0];
          controller.posterNearViewport = Boolean(entry && entry.isIntersecting);
          if (controller.posterNearViewport) loadPoster(controller, currentLanguage);
        }, { rootMargin: "640px 0px", threshold: 0 });
        posterObserver.observe(controller.loopFrame);

        var loadObserver = new IntersectionObserver(function (entries) {
          controller.nearViewport = entries.some(function (entry) { return entry.isIntersecting; });
          if (controller.nearViewport && !saveData && !controller.failedLanguages[currentLanguage]) loadLoop(controller, false);
        }, { rootMargin: "240px 0px", threshold: 0 });
        loadObserver.observe(controller.loopFrame);

        var playbackObserver = new IntersectionObserver(function (entries) {
          var entry = entries[0];
          controller.inViewport = Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.35);
          if (controller.inViewport) tryLoopPlay(controller, false);
          else pauseLoop(controller);
        }, { threshold: [0, 0.35, 0.65] });
        playbackObserver.observe(controller.loopFrame);
      } else {
        controller.posterNearViewport = true;
        loadPoster(controller, currentLanguage);
      }
    });

    function applyProjectLanguage(language) {
      controllers.forEach(function (controller) {
        applyControllerLanguage(controller, language);
      });
      if (dialogOpen && activeController) {
        prepareFilm(false);
        setFilmStatus("changed");
      } else {
        setFilmStatus("controls");
      }
    }

    function finishFilmClose() {
      if (!dialogOpen && !filmVideo.getAttribute("src")) return;
      filmGeneration += 1;
      dialogOpen = false;
      activeController = null;
      unloadVideo(filmVideo);
      doc.body.classList.remove("project-dialog-open");
      setFilmStatus("controls");
      if (returnFocus && returnFocus.isConnected) returnFocus.focus();
      returnFocus = null;
      controllers.forEach(function (controller) {
        if (canAutoPlay(controller)) tryLoopPlay(controller, false);
      });
    }

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

    doc.addEventListener("visibilitychange", function () {
      controllers.forEach(function (controller) {
        if (doc.hidden) pauseLoop(controller);
        else if (canAutoPlay(controller)) tryLoopPlay(controller, false);
      });
    });
    reducedMotion.addEventListener("change", function (event) {
      controllers.forEach(function (controller) {
        if (event.matches) pauseLoop(controller, "reduced");
        else if (canAutoPlay(controller)) tryLoopPlay(controller, false);
        else setLoopStatus(controller, controller.userPaused ? "paused" : saveData ? "saveData" : "ready");
      });
    });

    projectLanguageChange = applyProjectLanguage;
    applyProjectLanguage(currentLanguage);
  }

  setupProjectVideos();

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
