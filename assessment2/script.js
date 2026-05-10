// Select form inputs and elements used for displaying validation errors

const registrationForm = document.getElementById("registrationForm");

const fullName = document.getElementById("fullName");
const nameError = document.getElementById("nameError");

const emailError = document.getElementById("emailError");
const email = document.getElementById("email");

const password = document.getElementById("password");
const passwordError = document.getElementById("passwordError");

const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const age = document.getElementById("age");
const ageError = document.getElementById("ageError");

const successMessage = document.getElementById("successMessage");

registrationForm.addEventListener("submit", function (e) {
  e.preventDefault();
  validateInputs();
});

// REAL-TIME VALIDATION OR VISUAL FEEDBACK

fullName.addEventListener("input", function () {
  if (fullName.value === "") {
    nameError.textContent = "Full Name is required";
  } else {
    nameError.textContent = "";
  }
});

function validateInputs() {
  let isValid = true;

  // CLEAR PREVIOUS MESSAGES
  nameError.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";
  confirmPasswordError.textContent = "";
  ageError.textContent = "";
  successMessage.textContent = "";
  // GET INPUT VALUES
  const fullNameValue = fullName.value;
  const emailValue = email.value;
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;
  const ageValue = age.value;
  

  if (emailValue === "") {
    emailError.textContent = "Email Address is required";
    alert("Email Address is required");
    isValid = false;
  } else if (!emailValue.includes("@") || !emailValue.includes(".")) {
    emailError.textContent = "Enter a valid email address";
    alert("Enter a valid email address");
    isValid = false;
  }
  // PASSWORD VALIDATION
  let hasUpperCase = false;
  let hasNumber = false;
  let hasSpecialCharacter = false;
  const specialCharacters = "!@#$%^&*";

  for (let i = 0; i < passwordValue.length; i++) {
    let character = passwordValue[i];

    // Checks uppercase letter
    if (character >= "A" && character <= "Z") {
      hasUpperCase = true;
    }
    // Check number
    if (character >= "0" && character <= "9") {
      hasNumber = true;
    }
    // Check special character
    if (specialCharacters.includes(character)) {
      hasSpecialCharacter = true;
    }
  }

  if (passwordValue.length < 8) {
    passwordError.textContent = "Password must be at least 8 characters";
    alert("Password must be at least 8 characters");
    isValid = false;
  } else if (hasUpperCase === false) {
    passwordError.textContent = "Password must contain one uppercase letter";
    alert("Password must contain one uppercase letter");
    isValid = false;
  } else if (hasNumber === false) {
    passwordError.textContent = "Password must contain one number";
    alert("Password must contain one number");
    isValid = false;
  } else if (hasSpecialCharacter === false) {
    passwordError.textContent = "Password must contain one special character";
    alert("Password must contain one special character");
    isValid = false;
  }
  // CONFIRM PASSWORD VALIDATION
  if (confirmPasswordValue !== passwordValue) {
    confirmPasswordError.textContent = "Passwords do not match";
    alert("Passwords do not match");
    isValid = false;
  }
  // AGE VALIDATION
  if (ageValue === "") {
    ageError.textContent = "Age is required";
    alert("Age is required");
    isValid = false;
  } else if (ageValue < 18) {
    ageError.textContent = "You must be 18 or older";
    alert("You must be 18 or older");
    isValid = false;
  }
  // SUCCESS MESSAGE
  if (isValid === true) {
    successMessage.textContent = "Registration Successful!";
    alert("Registration Successful!");
  }
}
