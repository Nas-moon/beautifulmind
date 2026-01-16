function toggleLesson(header) {
    const lesson = header.parentElement;
    lesson.classList.toggle("open");
}

 const form = document.querySelector("form");
const status = document.getElementById("form-status");

form.addEventListener("submit", () => {
  // Show success message
  status.hidden = false;

  // Move screen reader + keyboard focus to message
  status.focus();

  // Optional UX improvements
  form.reset();
});

const button = form.querySelector("button[type='submit']");
button.disabled = true;