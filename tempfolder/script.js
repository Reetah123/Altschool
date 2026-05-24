const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentGrade = document.getElementById("studentGrade");
const studentTable = document.getElementById("studentTable");
const studentTableBody = document.getElementById("studentTableBody");
const averageGrade = document.getElementById("averageGrade");
const errorMessage = document.getElementById("errorMessage");
const emptyNote = document.getElementById("emptyNote");

let students = [];
let nextId = 1;

const savedStudents = localStorage.getItem("students");
const savedNextId = localStorage.getItem("nextId");

if (savedStudents) {
  students = JSON.parse(savedStudents);
}

if (savedNextId) {
  nextId = Number(savedNextId);
}

studentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = studentName.value.trim();
  const grade = Number(studentGrade.value);

  // Validation
  if (name === "") {
    errorMessage.textContent = "Student name cannot be empty.";
    return;
  }

  if (studentGrade.value === "" || isNaN(grade)) {
    errorMessage.textContent = "Please enter a valid grade.";
    return;
  }

  if (grade < 0 || grade > 100) {
    errorMessage.textContent = "Grade must be between 0 and 100.";
    return;
  }
  // Create student object
  const student = {
    id: nextId,
    name: name,
    grade: grade,
  };

  // Add student to the array
  students.push(student);
  nextId++;

  // Save and update the page
  saveStudents();
  displayStudents();

  // Clear form inputs
  studentForm.reset();
  errorMessage.textContent = "";
});

// Display students on the page
function displayStudents() {
  studentTableBody.innerHTML = "";

  if (students.length === 0) {
    emptyNote.style.display = "block";
    studentTable.style.display = "none";
    averageGrade.textContent = "—";
    return;
  }

  emptyNote.style.display = "none";
  studentTable.style.display = "table";

  const average = calculateAverage();
  averageGrade.textContent = average.toFixed(1);

  students.forEach(function (student, index) {
    const row = document.createElement("tr");

    // Bonus: highlight students above average
    if (student.grade > average) {
      row.classList.add("above-average");
    }

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td>${student.grade}</td>
      <td><button class="delete-btn" data-id="${student.id}">Delete</button></td>
    `;

    studentTableBody.appendChild(row);
  });
}

// Calculate average grade
function calculateAverage() {
  let total = 0;

  students.forEach(function (student) {
    total += student.grade;
  });

  return total / students.length;
}

// Delete student using the id
function deleteStudent(id) {
  students = students.filter(function (student) {
    return student.id !== id;
  });

  saveStudents();
  displayStudents();
}

// Listen for clicks on delete buttons
studentTableBody.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-btn")) {
    const id = Number(event.target.getAttribute("data-id"));
    deleteStudent(id);
  }
});

// Save students to localStorage
function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("nextId", String(nextId));
}

// Display students when page loads
displayStudents();
