document.addEventListener('DOMContentLoaded', () => {
  // Check for dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  // Retrieve assignments from localStorage
  let assignments = JSON.parse(localStorage.getItem('events')) || [];

  // DOM elements
  const assignmentNameInput = document.getElementById('assignmentName');
  const assignmentDateInput = document.getElementById('assignmentDate');
  const assignmentDescriptionInput = document.getElementById('assignmentDescription');
  const addAssignmentBtn = document.getElementById('addAssignmentBtn');
  const assignmentList = document.getElementById('assignmentList');
  const noAssignmentsMessage = document.getElementById('noAssignments');
  
  // *** FIX: Ensure error message elements are selected ***
  const assignmentNameError = document.getElementById('assignmentNameError');
  const assignmentDateError = document.getElementById('assignmentDateError');
  const assignmentDescriptionError = document.getElementById('assignmentDescriptionError');
  
  const backBtn = document.getElementById('backBtn');


  // Function to display "No assignments" message
  function displayNoAssignmentsMessage() {
    if (noAssignmentsMessage) {
        noAssignmentsMessage.style.display = assignments.length === 0 ? 'block' : 'none';
    }
  }

  // Render assignments in the list
  function renderAssignments() {
    if (!assignmentList) return; 

    assignmentList.innerHTML = '';
    // Sort assignments by date before rendering
    assignments.sort((a, b) => new Date(a.date) - new Date(b.date)); 
    
    assignments.forEach((assignment, index) => {
      const li = document.createElement('li');
      li.className = 'bg-white rounded-lg shadow-md py-3 px-4 mb-2 flex justify-between items-center';

      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800">${assignment.name}</h3>
        <p class="text-sm text-gray-600">Due: ${assignment.date}</p>
        <p class="text-gray-700">${assignment.description || ''}</p>
      `;

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-xs';
      deleteButton.addEventListener('click', () => {
        assignments.splice(index, 1);
        localStorage.setItem('events', JSON.stringify(assignments));
        renderAssignments(); 
        displayNoAssignmentsMessage(); 
      });

      li.appendChild(contentDiv);
      li.appendChild(deleteButton);
      assignmentList.appendChild(li);
    });
    displayNoAssignmentsMessage(); 
  }

  // Validate form inputs (using the original simpler logic from your HTML,
  // which is fine now that error elements are defined)
  function validateForm() {
    let isValid = true;

    // Validate Assignment Name
    if (!assignmentNameInput || !assignmentNameError) {
        console.error("Assignment name input or error display element is missing.");
        return false; // Critical elements missing
    }
    if (!assignmentNameInput.value.trim()) {
      assignmentNameError.style.display = 'block';
      isValid = false;
    } else {
      assignmentNameError.style.display = 'none';
    }

    // Validate Assignment Date
    if (!assignmentDateInput || !assignmentDateError) {
        console.error("Assignment date input or error display element is missing.");
        return false; // Critical elements missing
    }
    if (!assignmentDateInput.value) {
      assignmentDateError.style.display = 'block';
      isValid = false;
    } else {
      assignmentDateError.style.display = 'none';
    }

    // Validate Assignment Description
    if (!assignmentDescriptionInput || !assignmentDescriptionError) {
        console.error("Assignment description input or error display element is missing.");
        return false; // Critical elements missing
    }
    if (!assignmentDescriptionInput.value.trim()) {
      assignmentDescriptionError.style.display = 'block';
      isValid = false;
    } else {
      assignmentDescriptionError.style.display = 'none';
    }

    return isValid;
  }

  // Add a new assignment
  if (addAssignmentBtn) {
    addAssignmentBtn.addEventListener('click', () => {
      // Ensure input elements exist before trying to access their 'value' property
      if (!assignmentNameInput || !assignmentDateInput || !assignmentDescriptionInput) {
          console.error("One or more input fields are missing from the DOM.");
          return; // Exit if critical input elements are not found
      }

      const name = assignmentNameInput.value.trim();
      const date = assignmentDateInput.value;
      const description = assignmentDescriptionInput.value.trim();

      if (validateForm()) {
        assignments.push({ name: name, date: date, description: description });
        localStorage.setItem('events', JSON.stringify(assignments));
        
        assignmentNameInput.value = '';
        assignmentDateInput.value = '';
        assignmentDescriptionInput.value = '';
        
        renderAssignments();
      }
    });
  } else {
      console.error("Add Assignment button not found.");
  }

  // Back button returns to the home page
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  } else {
      console.error("Back button not found.");
  }

  // Initial render of assignments on page load
  renderAssignments();
});