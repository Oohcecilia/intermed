/* ==========================================================================
   Intermed Language Institute — interaction layer
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ------------------------------------------------------------------------
     Header state and current year
     ------------------------------------------------------------------------ */

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var heroParallaxQuery = window.matchMedia("(min-width: 721px)");
  var header = document.getElementById("siteHeader");

  function addQueryListener(query, handler) {
    if (query.addEventListener) {
      query.addEventListener("change", handler);
    } else if (query.addListener) {
      query.addListener(handler);
    }
  }

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  var hero = document.querySelector(".hero");
  var heroShift = 0;

  function updateHeroParallax() {
    if (!hero) return;

    if (!heroParallaxQuery.matches || reduceMotionQuery.matches) {
      if (heroShift !== 0) {
        hero.style.setProperty("--hero-shift", "0px");
        heroShift = 0;
      }
      return;
    }

    var rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0) return;

    var nextShift = Math.min(Math.max(window.scrollY * 0.045, 0), 26);
    if (Math.abs(nextShift - heroShift) < 0.1) return;

    heroShift = nextShift;
    hero.style.setProperty("--hero-shift", nextShift.toFixed(2) + "px");
  }

  var scrollQueued = false;

  function handleScroll() {
    if (scrollQueued) return;
    scrollQueued = true;

    window.requestAnimationFrame(function () {
      updateHeader();
      updateHeroParallax();
      scrollQueued = false;
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener(
    "resize",
    function () {
      updateHeader();
      updateHeroParallax();
    },
    { passive: true }
  );

  addQueryListener(reduceMotionQuery, function () {
    updateHeader();
    updateHeroParallax();
  });

  addQueryListener(heroParallaxQuery, updateHeroParallax);

  window.addEventListener("pageshow", function () {
    updateHeader();
    updateHeroParallax();
  });

  updateHeader();
  updateHeroParallax();

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------------ */

  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobileNav");

  if (navToggle && mobileNav) {
    var setNavOpen = function (open) {
      document.body.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

      if (open) {
        var firstLink = mobileNav.querySelector("a");
        if (firstLink) {
          window.requestAnimationFrame(function () {
            firstLink.focus({ preventScroll: true });
          });
        }
      }
    };

    navToggle.addEventListener("click", function () {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setNavOpen(false);
        navToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080 && document.body.classList.contains("nav-open")) {
        setNavOpen(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Subtle entrance animation
     ------------------------------------------------------------------------ */

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  var setRevealDelay = function (el, delay) {
    if (el) el.style.setProperty("--reveal-delay", delay + "ms");
  };

  [".course-grid", ".exam-grid", ".why-grid", ".testimonial-grid"].forEach(function (selector) {
    var group = document.querySelector(selector);
    if (!group) return;

    Array.prototype.forEach.call(group.children, function (child, index) {
      if (child.classList.contains("reveal")) {
        setRevealDelay(child, Math.min(index, 5) * 70);
      }
    });
  });

  var contactAside = document.querySelector(".contact-aside");
  if (contactAside) {
    Array.prototype.forEach.call(contactAside.children, function (child, index) {
      if (child.classList.contains("reveal")) {
        setRevealDelay(child, Math.min(index, 3) * 80);
      }
    });
  }

  var newsFeature = document.querySelector(".news-feature.reveal");
  if (newsFeature) setRevealDelay(newsFeature, 0);
  document.querySelectorAll(".news-side > .reveal").forEach(function (card, index) {
    setRevealDelay(card, 110 + index * 80);
  });

  if (revealItems.length) {
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -7% 0px" }
      );

      revealItems.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Counters for verified figures
     ------------------------------------------------------------------------ */

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  if (counters.length && "IntersectionObserver" in window && !reduceMotionQuery.matches) {
    counters.forEach(function (el) {
      el.textContent = "0";
    });

    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var target = parseInt(el.getAttribute("data-count"), 10);
          var start = null;
          var duration = 720;

          countObserver.unobserve(el);

          if (!target) {
            el.textContent = "0";
            return;
          }

          window.requestAnimationFrame(function step(timestamp) {
            if (start === null) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);

            el.textContent = String(Math.round(target * eased));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              el.textContent = String(target);
            }
          });
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      countObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     Progressive image loading
     ------------------------------------------------------------------------ */

  if (!reduceMotionQuery.matches) {
    document.querySelectorAll("main img").forEach(function (img) {
      if (img.closest(".hero, .testimonial") || img.complete) return;

      img.classList.add("is-loading");

      var revealImage = function () {
        img.classList.remove("is-loading");
        img.classList.add("is-loaded");
      };

      img.addEventListener("load", revealImage, { once: true });
      img.addEventListener("error", revealImage, { once: true });

      if (img.complete) revealImage();
    });
  }

  /* ------------------------------------------------------------------------
     Branch explorer
     ------------------------------------------------------------------------ */

  var branchPanel = document.getElementById("branchPanel");

  if (branchPanel) {
    var branchDetails = branchPanel.querySelectorAll(".branch-detail");
    var branchTabs = document.querySelectorAll(".branch-tab");
    var mapPins = document.querySelectorAll(".map-pin");

    var selectBranch = function (slug) {
      branchDetails.forEach(function (detail) {
        detail.hidden = detail.dataset.branch !== slug;
      });

      branchTabs.forEach(function (tab) {
        tab.setAttribute("aria-pressed", String(tab.dataset.branch === slug));
      });

      mapPins.forEach(function (pin) {
        pin.setAttribute("aria-pressed", String(pin.dataset.branch === slug));
      });
    };

    branchTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        selectBranch(tab.dataset.branch);
      });
    });

    mapPins.forEach(function (pin) {
      pin.addEventListener("click", function () {
        selectBranch(pin.dataset.branch);
      });
    });

    var initialBranch = new URLSearchParams(window.location.search).get("branch");
    var branchExists = Array.prototype.some.call(branchDetails, function (detail) {
      return detail.dataset.branch === initialBranch;
    });

    selectBranch(branchExists ? initialBranch : "iloilo");
  }

  /* ------------------------------------------------------------------------
     Inquiry form
     ------------------------------------------------------------------------ */

  var form = document.getElementById("inquiry-form");

  if (!form) return;

  form.noValidate = true;

  var endpoint = form.dataset.endpoint || "https://anc.d3.net/intermed/";
  var actionField = document.getElementById("form-action");
  var statusBox = document.getElementById("form-status");
  var submitButton = document.getElementById("submit-button");
  var submitLabel = submitButton ? submitButton.querySelector(".btn-label") : null;

  var radios = Array.prototype.slice.call(form.querySelectorAll('input[name="inquiry_type"]'));
  var branchSelect = document.getElementById("branch");
  var toField = document.getElementById("contact-to");
  var forField = document.getElementById("inquiry-for");
  var courseField = document.getElementById("course-field");
  var courseSelect = document.getElementById("course");
  var fileField = document.getElementById("file-field");
  var fileInput = document.getElementById("cv");
  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var numberInput = document.getElementById("number");
  var messageInput = document.getElementById("message");
  var consentInput = document.getElementById("consent");

  var fields = {
    name: nameInput,
    branch: branchSelect,
    email: emailInput,
    number: numberInput,
    course: courseSelect,
    cv: fileInput,
    message: messageInput,
    consent: consentInput
  };

  var selectedRadio = function () {
    return radios.filter(function (radio) {
      return radio.checked;
    })[0] || radios[0];
  };

  var inquiryType = function () {
    var radio = selectedRadio();
    return radio ? radio.dataset.type : "general";
  };

  var actionsByType = {
    general: "contact",
    course: "inquiry",
    scholarship: "inquiry",
    examination: "inquiry",
    employment: "application"
  };

  var buttonLabelFor = function (type) {
    if (type === "employment") return "Send application";
    if (type === "scholarship") return "Send scholarship inquiry";
    if (type === "examination") return "Send examination inquiry";
    return "Send inquiry";
  };

  var clearStatus = function () {
    if (!statusBox) return;
    statusBox.className = "form-status";
    statusBox.textContent = "";
  };

  var setStatus = function (kind, html) {
    if (!statusBox) return;
    statusBox.className = "form-status is-visible form-status--" + kind;
    statusBox.innerHTML = html;
  };

  var updateForField = function () {
    if (!forField) return;
    var type = inquiryType();

    if (type === "course") {
      forField.value = (courseSelect && courseSelect.value) || "Course Inquiry";
    } else if (type === "scholarship") {
      forField.value = "Scholarship";
    } else if (type === "examination") {
      forField.value = "Exam";
    } else if (type === "employment") {
      forField.value = "Career Application";
    } else {
      forField.value = "General Inquiry";
    }
  };

  var syncType = function () {
    var type = inquiryType();

    if (actionField) actionField.value = actionsByType[type] || "inquiry";

    if (courseField && courseSelect) {
      courseField.hidden = type !== "course";
      courseSelect.required = type === "course";
      if (type !== "course") courseSelect.value = "";
    }

    if (fileField && fileInput) {
      fileField.hidden = type !== "employment";
      fileInput.required = type === "employment";
      if (type !== "employment") fileInput.value = "";
    }

    if (submitLabel) submitLabel.textContent = buttonLabelFor(type);

    if (messageInput) {
      if (type === "employment") {
        messageInput.placeholder = "Tell us about your teaching experience and the role you are interested in.";
      } else if (type === "scholarship") {
        messageInput.placeholder = "Tell us about your background and why you would like to be considered for a scholarship.";
      } else if (type === "examination") {
        messageInput.placeholder = "Tell us which examination you are preparing for and your current German level.";
      } else if (type === "course") {
        messageInput.placeholder = "Tell us your current German level or the schedule you are looking for.";
      } else {
        messageInput.placeholder = "Tell us a little about your goals, your German experience, or the information you need.";
      }
    }

    updateForField();
  };

  var updateBranchEmail = function () {
    if (!branchSelect || !toField) return;
    var option = branchSelect.options[branchSelect.selectedIndex];
    toField.value = (option && option.dataset.email) || "office@intermed.institute";
  };

  var setError = function (key, message) {
    var error = form.querySelector('[data-error-for="' + key + '"]');
    var field = fields[key];

    if (error) {
      error.textContent = message || "";
      error.classList.toggle("is-visible", Boolean(message));
    }

    if (field) {
      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
  };

  var rules = {
    name: function () {
      return nameInput.value.trim().length >= 2 ? "" : "Please enter your full name.";
    },
    branch: function () {
      return branchSelect.value ? "" : "Please select a branch.";
    },
    email: function () {
      var value = emailInput.value.trim();
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? "" : "Enter a valid email address.";
    },
    number: function () {
      var digits = numberInput.value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15 ? "" : "Enter a valid contact number.";
    },
    course: function () {
      if (inquiryType() !== "course") return "";
      return courseSelect.value ? "" : "Please choose a course, or select Not sure yet.";
    },
    cv: function () {
      if (inquiryType() !== "employment") return "";
      var file = fileInput.files && fileInput.files[0];
      if (!file) return "Please upload your CV.";
      if (file.size > 10 * 1024 * 1024) return "Your CV must be 10MB or smaller.";
      if (!/\.(pdf|doc|docx)$/i.test(file.name)) return "Please upload a PDF or Word document.";
      return "";
    },
    message: function () {
      return messageInput.value.trim().length >= 10
        ? ""
        : "Please tell us a little more (at least 10 characters).";
    },
    consent: function () {
      return consentInput.checked ? "" : "Please confirm that we may contact you.";
    }
  };

  var validate = function () {
    var firstInvalid = null;

    Object.keys(rules).forEach(function (key) {
      var message = rules[key]();
      setError(key, message);
      if (message && !firstInvalid) firstInvalid = fields[key];
    });

    return firstInvalid;
  };

  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    if (!field) return;

    var eventName =
      field.tagName === "SELECT" || field.type === "checkbox" || field.type === "file"
        ? "change"
        : "input";

    field.addEventListener(eventName, function () {
      if (field.getAttribute("aria-invalid") === "true") {
        setError(key, rules[key]());
      }
    });
  });

  radios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      syncType();
      clearStatus();
    });
  });

  if (branchSelect) {
    branchSelect.addEventListener("change", updateBranchEmail);
  }

  if (courseSelect) {
    courseSelect.addEventListener("change", updateForField);
  }

  /* Preselect an inquiry experience from the URL. */
  var params = new URLSearchParams(window.location.search);
  var typeMap = {
    general: "general",
    course: "course",
    courses: "course",
    scholarship: "scholarship",
    scholarships: "scholarship",
    examination: "examination",
    examinations: "examination",
    exam: "examination",
    employment: "employment",
    career: "employment",
    careers: "employment",
    application: "employment"
  };
  var requestedType = typeMap[(params.get("type") || "").toLowerCase()];

  if (requestedType) {
    var requestedRadio = radios.filter(function (radio) {
      return radio.dataset.type === requestedType;
    })[0];

    if (requestedRadio) requestedRadio.checked = true;
  }

  var requestedCourse = params.get("course");
  if (requestedCourse && courseSelect) {
    var courseMatch = Array.prototype.filter.call(courseSelect.options, function (option) {
      return option.value.toLowerCase() === requestedCourse.toLowerCase();
    })[0];
    if (courseMatch) courseSelect.value = courseMatch.value;
  }

  var requestedBranch = (params.get("branch") || "").toLowerCase();
  if (requestedBranch && branchSelect) {
    var branchMatch = Array.prototype.filter.call(branchSelect.options, function (option) {
      return option.value === requestedBranch;
    })[0];
    if (branchMatch) branchSelect.value = branchMatch.value;
  }

  syncType();
  updateBranchEmail();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearStatus();

    var firstInvalid = validate();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var data = new FormData(form);

    if (!data.get("to")) {
      data.set("to", "office@intermed.institute");
    }

    if (submitButton) submitButton.disabled = true;
    form.classList.add("is-loading");
    form.setAttribute("aria-busy", "true");
    if (submitLabel) submitLabel.textContent = "Sending…";

    var controller = new AbortController();
    var timeout = window.setTimeout(function () {
      controller.abort();
    }, 20000);

    fetch(endpoint, {
      method: "POST",
      body: data,
      signal: controller.signal
    })
      .then(function (response) {
        return response.json().catch(function () {
          return null;
        }).then(function (payload) {
          if (!response.ok) {
            throw new Error((payload && payload.message) || "Request failed");
          }
          if (payload && payload.code && Number(payload.code) !== 200) {
            throw new Error(payload.message || "Request failed");
          }
          return payload;
        });
      })
      .then(function () {
        Object.keys(fields).forEach(function (key) {
          setError(key, "");
        });
        form.reset();
        syncType();
        updateBranchEmail();
        setStatus(
          "success",
          "Thank you. Your inquiry has been sent. Our team will contact you using the details you provided."
        );
      })
      .catch(function () {
        setStatus(
          "error",
          'We could not send your inquiry just now. Please email <a href="mailto:office@intermed.institute">office@intermed.institute</a> or call <a href="tel:+63335020215">+63 33 502 0215</a>.'
        );
      })
      .finally(function () {
        window.clearTimeout(timeout);
        if (submitButton) submitButton.disabled = false;
        form.classList.remove("is-loading");
        form.removeAttribute("aria-busy");
        if (submitLabel) submitLabel.textContent = buttonLabelFor(inquiryType());
      });
  });
})();
