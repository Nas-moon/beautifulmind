function toggleLesson(header) {
  const lesson = header.parentElement;
  lesson.classList.toggle("open");
}

const form = document.querySelector("form");
const status = document.getElementById("form-status");
const iframe = document.getElementById("hidden_iframe");

let submitted = false;

form.addEventListener("submit", () => {
  submitted = true;
});

iframe.addEventListener("load", () => {
  if (!submitted) return;

  // Safe: Google has received the data
  status.hidden = false;
  status.focus();

  form.reset();
  submitted = false;
});

const submitBtn = form.querySelector("input[type='submit']");
submitBtn.disabled = false;

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

burgerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle("show");
});

document.addEventListener("click", () => {
  mobileMenu.classList.remove("show");
});
