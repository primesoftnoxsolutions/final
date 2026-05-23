const USERS_KEY = "novacraft_users";
const ACTIVE_USER_KEY = "novacraft_active_user";

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

function emailExists(users, email) {
  return users.some((user) => user.email.toLowerCase() === email.toLowerCase());
}

function setupSignup() {
  const signupForm = document.getElementById("signupForm");
  const signupMessage = document.getElementById("signupMessage");

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

    showMessage(signupMessage, "Account created. Redirecting to sign in...", "success");
    signupForm.reset();

    setTimeout(() => {
      window.location.href = "signin.html";
    }, 1200);
  });
}

function setupSignin() {
  const signinForm = document.getElementById("signinForm");
  const signinMessage = document.getElementById("signinMessage");

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

    sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify({ name: user.name, email: user.email }));
    showMessage(signinMessage, `Welcome, ${user.name}. Redirecting to home...`, "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  });
}

function setupHomeGreeting() {
  const activeUserRaw = sessionStorage.getItem(ACTIVE_USER_KEY);

  if (!activeUserRaw) {
    return;
  }

  let activeUser;

  try {
    activeUser = JSON.parse(activeUserRaw);
  } catch (error) {
    sessionStorage.removeItem(ACTIVE_USER_KEY);
    return;
  }

  const heroActions = document.querySelector(".hero-actions");

  if (!heroActions || !activeUser?.name) {
    return;
  }

  const message = document.createElement("p");
  message.className = "eyebrow";
  message.textContent = `Signed in as ${activeUser.name}`;
  heroActions.appendChild(message);
}

document.addEventListener("DOMContentLoaded", () => {
  setupSignup();
  setupSignin();
  setupHomeGreeting();
});
