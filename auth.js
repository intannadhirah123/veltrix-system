/* Veltrix single-admin sign-in for the IMS566 academic prototype. */
(() => {
  const ADMIN_USERNAME = "Intannadhirah";
  const ADMIN_PASSWORD = "veltrix123";
  const SESSION_KEY = "vx_session";

  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("adminUsername");
  const passwordInput = document.getElementById("adminPassword");
  const errorBox = document.getElementById("loginError");
  const toggle = document.getElementById("togglePassword");

  toggle?.addEventListener("click", () => {
    const showing = passwordInput.type === "text";
    passwordInput.type = showing ? "password" : "text";
    toggle.innerHTML = showing ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    toggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const valid = username.toLowerCase() === ADMIN_USERNAME.toLowerCase() && password === ADMIN_PASSWORD;

    if (!valid) {
      errorBox.classList.add("show");
      usernameInput.classList.toggle("invalid", username.toLowerCase() !== ADMIN_USERNAME.toLowerCase());
      passwordInput.classList.toggle("invalid", password !== ADMIN_PASSWORD);
      return;
    }

    const adminSession = {
      authenticated: true,
      username: ADMIN_USERNAME,
      fullname: "Intan Nadhirah",
      email: "",
      role: "System Administrator",
      at: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(adminSession));
      window.location.replace("index.html");
    } catch (error) {
      errorBox.textContent = "Unable to start your admin session. Please enable browser session storage and try again.";
      errorBox.classList.add("show");
    }
  });

  [usernameInput, passwordInput].forEach((input) => input?.addEventListener("input", () => {
    errorBox.classList.remove("show");
    input.classList.remove("invalid");
  }));
})();
