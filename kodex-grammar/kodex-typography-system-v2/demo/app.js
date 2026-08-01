const specimen = document.querySelector("#specimen");
const textureButton = document.querySelector("#textureToggle");
const modeButtons = document.querySelectorAll("[data-mode]");

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modeButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    specimen.classList.toggle(
      "mobile",
      button.dataset.mode === "mobile",
    );
  });
});

textureButton.addEventListener("click", () => {
  document.body.classList.toggle("texture-on");
  textureButton.classList.toggle("active");
});
