const welcomeForm = document.querySelector("#welcome-form");
const startPage = document.querySelector("#start-page");
const welcomePage = document.querySelector("#welcome-page");
const foodPage = document.querySelector("#food-page");
const customerName = document.querySelector("#customer-name");
const customerGreeting = document.querySelector("#customer-greeting");
const foodOptions = document.querySelectorAll(".food-option");
const selectionMessage = document.querySelector("#selection-message");
const menuButton = document.querySelector("#menu-button");
const menuPage = document.querySelector("#menu-page");
const menuGreeting = document.querySelector("#menu-greeting");
const backButton = document.querySelector("#back-button");
const menuItems = document.querySelectorAll(".menu-item");
const menuSections = document.querySelectorAll(".menu-section");
let selectedCategory = "";

welcomeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  customerGreeting.textContent = customerName.value.trim();
  welcomePage.hidden = true;
  foodPage.hidden = false;
});

foodOptions.forEach((option) => {
  option.addEventListener("click", () => {
    foodOptions.forEach((foodOption) => {
      foodOption.setAttribute("aria-pressed", String(foodOption === option));
    });
    selectedCategory = option.classList.contains("veg-option") ? "veg" : "nonveg";
    selectionMessage.textContent = `${option.querySelector(".food-name").textContent} selected!`;
    menuButton.hidden = false;
  });
});

menuButton.addEventListener("click", () => {
  menuGreeting.textContent = `Choose an item to see its price, ${customerName.value.trim()}.`;
  startPage.hidden = true;
  menuPage.hidden = false;
  document.body.classList.add("menu-visible");
  menuSections.forEach((section) => {
    section.hidden = section.id !== `${selectedCategory}-menu`;
  });
  document.querySelector(`#${selectedCategory}-menu`).scrollIntoView();
});

backButton.addEventListener("click", () => {
  menuSections.forEach((section) => {
    section.hidden = false;
  });
  menuPage.hidden = true;
  startPage.hidden = false;
  document.body.classList.remove("menu-visible");
  foodPage.hidden = false;
  window.scrollTo(0, 0);
});

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    const isExpanded = item.getAttribute("aria-expanded") === "true";
    item.setAttribute("aria-expanded", String(!isExpanded));
  });
});
