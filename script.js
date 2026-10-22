const welcomeForm = document.querySelector("#welcome-form");
const welcomePage = document.querySelector("#welcome-page");
const foodPage = document.querySelector("#food-page");
const customerName = document.querySelector("#customer-name");
const customerGreeting = document.querySelector("#customer-greeting");
const foodOptions = document.querySelectorAll(".food-option");
const selectionMessage = document.querySelector("#selection-message");

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
    selectionMessage.textContent = `${option.querySelector(".food-name").textContent} selected!`;
  });
});
