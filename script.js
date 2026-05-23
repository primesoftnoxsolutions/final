const USERS_KEY = "novacraft_users";
const ACTIVE_USER_KEY = "novacraft_active_user";

const authModal = document.getElementById("authModal");
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const signinMessage = document.getElementById("signinMessage");
const signupMessage = document.getElementById("signupMessage");
const signedInBadge = document.getElementById("signedInBadge");
const logoutBtn = document.getElementById("logoutBtn");

function getUsers() {
  try {
    const rawUsers = localStorage.getItem(USERS_KEY);
    return rawUsers ? JSON.parse(rawUsers) : [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getActiveUser() {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function setActiveUser(user) {
  localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
}

function clearActiveUser() {
  localStorage.removeItem(ACTIVE_USER_KEY);
}

function showMessage(element, text, type) {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("error", "success");

  if (type) {
    element.classList.add(type);
  }
}

function clearMessages() {
  showMessage(signinMessage, "", "");
  showMessage(signupMessage, "", "");
}

function emailExists(users, email) {
  return users.some((user) => user.email.toLowerCase() === email.toLowerCase());
}

function setAuthView(view) {
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll("[data-auth-panel]");

  tabs.forEach((tab) => {
    const isActive = tab.dataset.authView === view;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    const shouldShow = panel.dataset.authPanel === view;
    panel.classList.toggle("hidden", !shouldShow);
  });

  clearMessages();
}

function openAuthModal(view = "signin") {
  if (!authModal) {
    return;
  }

  setAuthView(view);
  authModal.classList.add("is-open");
  authModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeAuthModal() {
  if (!authModal) {
    return;
  }

  authModal.classList.remove("is-open");
  authModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  clearMessages();
}

function renderAuthState() {
  const user = getActiveUser();
  const guestItems = document.querySelectorAll("[data-auth='guest']");
  const userItems = document.querySelectorAll("[data-auth='user']");

  guestItems.forEach((item) => item.classList.toggle("hidden", Boolean(user)));
  userItems.forEach((item) => item.classList.toggle("hidden", !user));

  if (signedInBadge) {
    if (user?.name) {
      signedInBadge.textContent = `Signed in as ${user.name}`;
      signedInBadge.classList.remove("hidden");
    } else {
      signedInBadge.textContent = "";
      signedInBadge.classList.add("hidden");
    }
  }
}

function setupModalControls() {
  if (!authModal) {
    return;
  }

  const openers = document.querySelectorAll("[data-open-auth]");
  const closers = document.querySelectorAll("[data-close-auth]");
  const switchers = document.querySelectorAll("[data-switch-auth]");
  const tabs = document.querySelectorAll(".auth-tab");

  openers.forEach((opener) => {
    opener.addEventListener("click", () => {
      const requestedView = opener.dataset.openAuth || "signin";
      openAuthModal(requestedView);
    });
  });

  closers.forEach((closer) => {
    closer.addEventListener("click", closeAuthModal);
  });

  switchers.forEach((switcher) => {
    switcher.addEventListener("click", () => {
      setAuthView(switcher.dataset.switchAuth || "signin");
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setAuthView(tab.dataset.authView || "signin");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && authModal.classList.contains("is-open")) {
      closeAuthModal();
    }
  });
}

function setupSignup() {
  if (!signupForm) {
    return;
  }

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();

    if (!name || !email || !password || !confirmPassword) {
      showMessage(signupMessage, "Please fill all fields.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage(signupMessage, "Password must be at least 6 characters.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage(signupMessage, "Passwords do not match.", "error");
      return;
    }

    const users = getUsers();

    if (emailExists(users, email)) {
      showMessage(signupMessage, "This email is already registered.", "error");
      return;
    }

    users.push({ name, email, password, createdAt: new Date().toISOString() });
    saveUsers(users);

    showMessage(signupMessage, "Account created. Please sign in.", "success");
    signupForm.reset();

    setTimeout(() => {
      setAuthView("signin");
    }, 700);
  });
}

function setupSignin() {
  if (!signinForm) {
    return;
  }

  signinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(signinForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      showMessage(signinMessage, "Please enter email and password.", "error");
      return;
    }

    const users = getUsers();
    const user = users.find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
    );

    if (!user) {
      showMessage(signinMessage, "Invalid email or password.", "error");
      return;
    }

    setActiveUser({ name: user.name, email: user.email });
    renderAuthState();
    showMessage(signinMessage, `Welcome, ${user.name}.`, "success");
    signinForm.reset();

    setTimeout(() => {
      closeAuthModal();
    }, 700);
  });
}

function setupLogout() {
  if (!logoutBtn) {
    return;
  }

  logoutBtn.addEventListener("click", () => {
    clearActiveUser();
    renderAuthState();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupModalControls();
  setupSignup();
  setupSignin();
  setupLogout();
  renderAuthState();
});
