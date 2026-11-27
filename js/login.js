/**
 * SONORA — Live Concert Tickets
 * Login & Sign Up Page Script (js/login.js)
 * Handles:
 *  1. Smooth tab switching between Sign In and Sign Up
 *  2. Exact 3-state live validation (Empty / Error + top banner / Valid checkmark)
 *  3. Password show/hide toggles and Forgot Password inline recovery
 *  4. localStorage session persistence (sonora_user), confirmation banner & redirect
 *  5. Already-logged-in session view & navbar auth sync
 */

(function () {
  "use strict";

  const USER_STORAGE_KEY =
    (window.SONORA_UI && window.SONORA_UI.STORAGE_KEYS && window.SONORA_UI.STORAGE_KEYS.USER) ||
    "sonora_user";
  const ACCOUNTS_STORAGE_KEY = "sonora_accounts";
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const REDIRECT_DELAY_MS = 1100;

  let redirectTimerId = null;

  function readJsonStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage quota errors in restricted environments
    }
  }

  function getStoredUser() {
    const user = readJsonStorage(USER_STORAGE_KEY, null);
    if (!user) {
      return null;
    }
    if (typeof user === "string" && user.trim()) {
      return { name: user.trim(), email: "" };
    }
    if (typeof user === "object" && (user.name || user.email)) {
      return user;
    }
    return null;
  }

  function formatNameFromEmail(email) {
    const localPart = String(email || "").split("@")[0] || "Fan";
    return localPart
      .replace(/[._-]+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function findStoredAccountByEmail(email) {
    const accounts = readJsonStorage(ACCOUNTS_STORAGE_KEY, []);
    if (!Array.isArray(accounts)) {
      return null;
    }
    const normalized = String(email || "").trim().toLowerCase();
    return accounts.find((acc) => acc && String(acc.email).toLowerCase() === normalized) || null;
  }

  function saveAccountRecord(account) {
    const accounts = readJsonStorage(ACCOUNTS_STORAGE_KEY, []);
    const list = Array.isArray(accounts) ? accounts : [];
    const normalized = account.email.toLowerCase();
    const filtered = list.filter((acc) => acc && String(acc.email).toLowerCase() !== normalized);
    filtered.push({
      name: account.name,
      email: account.email,
      createdAt: new Date().toISOString()
    });
    writeJsonStorage(ACCOUNTS_STORAGE_KEY, filtered);
  }

  function getInitials(name, email) {
    const source = (name || email || "S").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  }

  function initLoginPage() {
    const tabsContainer = document.getElementById("authTabsContainer");
    const tabSignIn = document.getElementById("tabSignIn");
    const tabSignUp = document.getElementById("tabSignUp");
    const panelSignIn = document.getElementById("panelSignIn");
    const panelSignUp = document.getElementById("panelSignUp");
    const sessionBox = document.getElementById("authSessionBox");

    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    const signInBanner = document.getElementById("signInErrorBanner");
    const signUpBanner = document.getElementById("signUpErrorBanner");
    const signInSuccess = document.getElementById("signInSuccessBanner");
    const signUpSuccess = document.getElementById("signUpSuccessBanner");

    const switchToSignUpBtn = document.getElementById("switchToSignUpBtn");
    const switchToSignInBtn = document.getElementById("switchToSignInBtn");

    // Forgot password inline elements
    const forgotToggleBtn = document.getElementById("forgotPasswordToggleBtn");
    const forgotBox = document.getElementById("forgotPasswordBox");
    const forgotEmailInput = document.getElementById("forgotEmailInput");
    const forgotSendBtn = document.getElementById("forgotSendBtn");
    const forgotCloseBtn = document.getElementById("forgotCloseBtn");
    const forgotFeedback = document.getElementById("forgotFeedback");

    // Session box elements
    const sessionAvatar = document.getElementById("sessionAvatar");
    const sessionName = document.getElementById("sessionName");
    const sessionEmail = document.getElementById("sessionEmail");
    const sessionSignOutBtn = document.getElementById("sessionSignOutBtn");

    if (!signInForm || !signUpForm) {
      return;
    }

    /**
     * 3-State Validation Helpers:
     *   - "default": State 1 (Empty / clean)
     *   - "error":   State 2 (Red border + inline message)
     *   - "valid":   State 3 (Green border + inside-input checkmark)
     */
    function setFieldState(group, state, errorMessage) {
      if (!group) {
        return;
      }
      const input = group.querySelector("input");
      const errorEl = group.querySelector(".sonora-field-error");

      group.classList.remove("is-error", "is-valid");
      if (input) {
        input.removeAttribute("aria-invalid");
      }
      if (errorEl) {
        errorEl.textContent = "";
      }

      if (state === "error") {
        group.classList.add("is-error");
        if (input) {
          input.setAttribute("aria-invalid", "true");
        }
        if (errorEl) {
          errorEl.textContent = errorMessage || "Please check this field.";
        }
      } else if (state === "valid") {
        group.classList.add("is-valid");
        if (input) {
          input.setAttribute("aria-invalid", "false");
        }
      }
    }

    const validators = {
      signInEmail: (val) => {
        const trimmed = val.trim();
        if (!trimmed) {
          return "Email is required.";
        }
        if (!EMAIL_REGEX.test(trimmed)) {
          return "Enter a valid email address";
        }
        return "";
      },
      signInPassword: (val) => {
        if (!val) {
          return "Password is required";
        }
        if (val.length < 6) {
          return "Password must be at least 6 characters";
        }
        return "";
      },
      signUpName: (val) => {
        const trimmed = val.trim();
        if (!trimmed) {
          return "Full name is required";
        }
        if (trimmed.length < 2) {
          return "Enter your full name (at least 2 characters)";
        }
        return "";
      },
      signUpEmail: (val) => {
        const trimmed = val.trim();
        if (!trimmed) {
          return "Email is required";
        }
        if (!EMAIL_REGEX.test(trimmed)) {
          return "Enter a valid email address";
        }
        return "";
      },
      signUpPassword: (val) => {
        if (!val) {
          return "Password is required";
        }
        if (val.length < 6) {
          return "Password must be at least 6 characters";
        }
        return "";
      },
      signUpConfirm: (val) => {
        const pwd = document.getElementById("signUpPassword").value;
        if (!val) {
          return "Please confirm your password";
        }
        if (val !== pwd) {
          return "Passwords do not match";
        }
        return "";
      }
    };

    function validateField(input, validatorKey, forceShowEmptyError) {
      if (!input) {
        return true;
      }
      const group = input.closest(".sonora-field-group");
      const value = input.value;
      const isTouched = input.dataset.touched === "true";

      if (!value && !forceShowEmptyError && !isTouched) {
        setFieldState(group, "default");
        return false;
      }

      const errorMsg = validators[validatorKey](value);
      if (errorMsg) {
        setFieldState(group, "error", errorMsg);
        return false;
      }

      setFieldState(group, "valid");
      return true;
    }

    function wireFormValidation(form, fieldRules, bannerEl) {
      form.dataset.submitted = "false";

      fieldRules.forEach(({ id, key }) => {
        const input = document.getElementById(id);
        if (!input) {
          return;
        }

        input.addEventListener("blur", () => {
          if (input.value.trim().length > 0 || form.dataset.submitted === "true") {
            input.dataset.touched = "true";
            validateField(input, key, form.dataset.submitted === "true");
          } else {
            // Keep State 1 clean if user tabbed through an empty field without submitting
            input.dataset.touched = "false";
            setFieldState(input.closest(".sonora-field-group"), "default");
          }
        });

        input.addEventListener("input", () => {
          if (input.value.length > 0) {
            input.dataset.touched = "true";
          }

          if (form.dataset.submitted === "true" || input.dataset.touched === "true") {
            validateField(input, key, form.dataset.submitted === "true");
          }

          // Re-check confirm password live whenever signUpPassword changes
          if (id === "signUpPassword") {
            const confirmInput = document.getElementById("signUpConfirm");
            if (confirmInput && (confirmInput.value.length > 0 || form.dataset.submitted === "true")) {
              validateField(confirmInput, "signUpConfirm", form.dataset.submitted === "true");
            }
          }

          // Hide top error banner as soon as every field is valid
          if (bannerEl && !bannerEl.hidden) {
            const allValid = fieldRules.every((rule) => {
              const el = document.getElementById(rule.id);
              return el && !validators[rule.key](el.value);
            });
            if (allValid) {
              bannerEl.hidden = true;
            }
          }
        });
      });
    }

    function resetFormValidation(form, bannerEl, successEl) {
      form.dataset.submitted = "false";
      if (bannerEl) {
        bannerEl.hidden = true;
      }
      if (successEl) {
        successEl.hidden = true;
      }
      form.querySelectorAll(".sonora-field-group").forEach((group) => {
        setFieldState(group, "default");
      });
      form.querySelectorAll("input").forEach((input) => {
        input.dataset.touched = "false";
      });
    }

    const signInRules = [
      { id: "signInEmail", key: "signInEmail" },
      { id: "signInPassword", key: "signInPassword" }
    ];

    const signUpRules = [
      { id: "signUpName", key: "signUpName" },
      { id: "signUpEmail", key: "signUpEmail" },
      { id: "signUpPassword", key: "signUpPassword" },
      { id: "signUpConfirm", key: "signUpConfirm" }
    ];

    wireFormValidation(signInForm, signInRules, signInBanner);
    wireFormValidation(signUpForm, signUpRules, signUpBanner);

    /**
     * Switches smoothly between Sign In and Sign Up views.
     */
    function switchTab(mode, shouldFocus) {
      const isSignUp = mode === "signup";

      tabSignIn.classList.toggle("is-active", !isSignUp);
      tabSignIn.setAttribute("aria-selected", String(!isSignUp));
      tabSignIn.setAttribute("tabindex", isSignUp ? "-1" : "0");

      tabSignUp.classList.toggle("is-active", isSignUp);
      tabSignUp.setAttribute("aria-selected", String(isSignUp));
      tabSignUp.setAttribute("tabindex", isSignUp ? "0" : "-1");

      panelSignIn.hidden = isSignUp;
      panelSignUp.hidden = !isSignUp;

      if (forgotBox) {
        forgotBox.hidden = true;
      }

      if (shouldFocus) {
        const targetInput = document.getElementById(isSignUp ? "signUpName" : "signInEmail");
        if (targetInput) {
          targetInput.focus();
        }
      }
    }

    tabSignIn.addEventListener("click", () => switchTab("signin", false));
    tabSignUp.addEventListener("click", () => switchTab("signup", false));

    // Keyboard arrow support on tablist
    [tabSignIn, tabSignUp].forEach((tab) => {
      tab.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          const nextMode = tab === tabSignIn ? "signup" : "signin";
          switchTab(nextMode, false);
          (nextMode === "signup" ? tabSignUp : tabSignIn).focus();
        }
      });
    });

    if (switchToSignUpBtn) {
      switchToSignUpBtn.addEventListener("click", () => switchTab("signup", true));
    }

    if (switchToSignInBtn) {
      switchToSignInBtn.addEventListener("click", () => switchTab("signin", true));
    }

    /**
     * Password Show / Hide Toggle Buttons
     */
    document.querySelectorAll("[data-password-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-password-toggle");
        const input = document.getElementById(targetId);
        if (!input) {
          return;
        }
        const reveal = input.type === "password";
        input.type = reveal ? "text" : "password";
        btn.setAttribute("aria-pressed", String(reveal));
        btn.setAttribute("aria-label", reveal ? "Hide password" : "Show password");

        const eyeShow = btn.querySelector("[data-eye-show]");
        const eyeHide = btn.querySelector("[data-eye-hide]");
        if (eyeShow && eyeHide) {
          eyeShow.classList.toggle("d-none", reveal);
          eyeHide.classList.toggle("d-none", !reveal);
        }
      });
    });

    /**
     * Forgot Password Inline Recovery
     */
    if (forgotToggleBtn && forgotBox) {
      forgotToggleBtn.addEventListener("click", () => {
        const willOpen = forgotBox.hidden;
        forgotBox.hidden = !willOpen;
        if (forgotFeedback) {
          forgotFeedback.textContent = "";
          forgotFeedback.className = "small mt-2 mb-0";
        }
        if (willOpen && forgotEmailInput) {
          const signInEmail = document.getElementById("signInEmail");
          if (signInEmail && signInEmail.value.trim()) {
            forgotEmailInput.value = signInEmail.value.trim();
          }
          forgotEmailInput.focus();
        }
      });
    }

    if (forgotCloseBtn && forgotBox) {
      forgotCloseBtn.addEventListener("click", () => {
        forgotBox.hidden = true;
      });
    }

    if (forgotSendBtn && forgotEmailInput && forgotFeedback) {
      forgotSendBtn.addEventListener("click", () => {
        const emailVal = forgotEmailInput.value.trim();
        if (!EMAIL_REGEX.test(emailVal)) {
          forgotFeedback.textContent = "Please enter a valid email address to receive a reset link.";
          forgotFeedback.className = "small mt-2 mb-0 text-danger";
          forgotEmailInput.focus();
          return;
        }
        forgotFeedback.textContent = `Password reset instructions sent to ${emailVal}.`;
        forgotFeedback.className = "small mt-2 mb-0 text-success";
      });
    }

    /**
     * Complete Login / Sign Up, persist session & redirect to my-tickets.html
     */
    function completeAuthentication(userPayload, successBannerEl, messageText, submitBtn) {
      writeJsonStorage(USER_STORAGE_KEY, userPayload);

      if (window.SONORA_UI && typeof window.SONORA_UI.refreshAuth === "function") {
        window.SONORA_UI.refreshAuth();
      }
      if (window.SONORA_UI && typeof window.SONORA_UI.refreshBadges === "function") {
        window.SONORA_UI.refreshBadges();
      }

      if (successBannerEl) {
        const msgSpan = successBannerEl.querySelector("[data-success-text]");
        if (msgSpan) {
          msgSpan.textContent = messageText;
        }
        successBannerEl.hidden = false;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Redirecting to My Tickets...";
      }

      if (redirectTimerId) {
        window.clearTimeout(redirectTimerId);
      }
      redirectTimerId = window.setTimeout(() => {
        window.location.href = "my-tickets.html";
      }, REDIRECT_DELAY_MS);
    }

    /**
     * Sign In Submit Handler
     */
    signInForm.addEventListener("submit", (event) => {
      event.preventDefault();
      signInForm.dataset.submitted = "true";

      let firstInvalidInput = null;
      let isFormValid = true;

      signInRules.forEach(({ id, key }) => {
        const input = document.getElementById(id);
        const valid = validateField(input, key, true);
        if (!valid) {
          isFormValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = input;
          }
        }
      });

      if (!isFormValid) {
        if (signInBanner) {
          signInBanner.hidden = false;
        }
        if (signInSuccess) {
          signInSuccess.hidden = true;
        }
        if (firstInvalidInput) {
          firstInvalidInput.focus();
        }
        return;
      }

      if (signInBanner) {
        signInBanner.hidden = true;
      }

      const email = document.getElementById("signInEmail").value.trim();
      const keepSignedIn = Boolean(document.getElementById("keepSignedIn").checked);
      const existingAccount = findStoredAccountByEmail(email);
      const resolvedName = existingAccount ? existingAccount.name : formatNameFromEmail(email);
      const submitBtn = document.getElementById("signInSubmitBtn");

      completeAuthentication(
        {
          name: resolvedName,
          email: email,
          keepSignedIn: keepSignedIn,
          signedInAt: new Date().toISOString()
        },
        signInSuccess,
        `Welcome back, ${resolvedName}! Opening your tickets...`,
        submitBtn
      );
    });

    /**
     * Sign Up Submit Handler
     */
    signUpForm.addEventListener("submit", (event) => {
      event.preventDefault();
      signUpForm.dataset.submitted = "true";

      let firstInvalidInput = null;
      let isFormValid = true;

      signUpRules.forEach(({ id, key }) => {
        const input = document.getElementById(id);
        const valid = validateField(input, key, true);
        if (!valid) {
          isFormValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = input;
          }
        }
      });

      if (!isFormValid) {
        if (signUpBanner) {
          signUpBanner.hidden = false;
        }
        if (signUpSuccess) {
          signUpSuccess.hidden = true;
        }
        if (firstInvalidInput) {
          firstInvalidInput.focus();
        }
        return;
      }

      if (signUpBanner) {
        signUpBanner.hidden = true;
      }

      const fullName = document.getElementById("signUpName").value.trim();
      const email = document.getElementById("signUpEmail").value.trim();
      const submitBtn = document.getElementById("signUpSubmitBtn");

      saveAccountRecord({ name: fullName, email: email });

      completeAuthentication(
        {
          name: fullName,
          email: email,
          keepSignedIn: true,
          signedInAt: new Date().toISOString()
        },
        signUpSuccess,
        `Account created! Welcome to SONORA, ${fullName}. Opening your tickets...`,
        submitBtn
      );
    });

    /**
     * Render Already-Logged-In View vs Auth Forms
     */
    function syncSessionView() {
      const user = getStoredUser();

      if (user) {
        if (tabsContainer) {
          tabsContainer.hidden = true;
        }
        panelSignIn.hidden = true;
        panelSignUp.hidden = true;
        if (sessionBox) {
          sessionBox.hidden = false;
        }

        const displayName = user.name || formatNameFromEmail(user.email);
        if (sessionAvatar) {
          sessionAvatar.textContent = getInitials(displayName, user.email);
        }
        if (sessionName) {
          sessionName.textContent = displayName;
        }
        if (sessionEmail) {
          sessionEmail.textContent = user.email || "Active SONORA session";
        }
        return;
      }

      if (tabsContainer) {
        tabsContainer.hidden = false;
      }
      if (sessionBox) {
        sessionBox.hidden = true;
      }

      const params = new URLSearchParams(window.location.search);
      const requestedMode =
        params.get("tab") === "signup" ||
        params.get("mode") === "signup" ||
        window.location.hash === "#signup"
          ? "signup"
          : "signin";

      switchTab(requestedMode, false);
    }

    if (sessionSignOutBtn) {
      sessionSignOutBtn.addEventListener("click", () => {
        if (redirectTimerId) {
          window.clearTimeout(redirectTimerId);
        }
        window.localStorage.removeItem(USER_STORAGE_KEY);
        if (window.SONORA_UI && typeof window.SONORA_UI.refreshAuth === "function") {
          window.SONORA_UI.refreshAuth();
        }
        if (window.SONORA_UI && typeof window.SONORA_UI.refreshBadges === "function") {
          window.SONORA_UI.refreshBadges();
        }
        resetFormValidation(signInForm, signInBanner, signInSuccess);
        resetFormValidation(signUpForm, signUpBanner, signUpSuccess);
        syncSessionView();
      });
    }

    // Hook navbar Sign In / Sign Up buttons on login.html so they switch tabs smoothly
    const navAuthContainer = document.getElementById("sonoraAuthActions");
    if (navAuthContainer) {
      navAuthContainer.addEventListener("click", (event) => {
        const clickedLink = event.target.closest("a");
        if (clickedLink) {
          const href = clickedLink.getAttribute("href") || "";
          if (href.includes("signin.html")) {
            event.preventDefault();
            switchTab("signin", true);
          } else if (href.includes("signup.html")) {
            event.preventDefault();
            switchTab("signup", true);
          }
          return;
        }

        const clickedBtn = event.target.closest("#sonoraSignOutBtn");
        if (clickedBtn) {
          window.setTimeout(() => {
            resetFormValidation(signInForm, signInBanner, signInSuccess);
            resetFormValidation(signUpForm, signUpBanner, signUpSuccess);
            syncSessionView();
          }, 0);
        }
      });
    }

    window.addEventListener("storage", (event) => {
      if (event.key === USER_STORAGE_KEY) {
        syncSessionView();
      }
    });

    syncSessionView();
  }

  document.addEventListener("DOMContentLoaded", initLoginPage);
})();
