document.addEventListener('DOMContentLoaded', function() {
  // --- Essential DOM Elements ---
  const body = document.body;
  const timerDisplay = document.getElementById('timer');
  const logoEl = document.querySelector('.logo');
  const homePageQuoteEl = document.getElementById('homePageQuote');


  // --- Settings Widget Elements ---
  const themeSelect = document.getElementById('theme-select');
  const workTimeInput = document.getElementById('work-time');
  const breakTimeInput = document.getElementById('break-time');
  const pomodoroAlertEnableCheckbox = document.getElementById('pomodoro-alert-enable');
  const weatherLocationInput = document.getElementById('weather-location');
  const homeTaskDisplaySelect = document.getElementById('home-task-display');

  // --- Home Page Display Elements ---
  const tasksDisplayEl = document.getElementById('tasksDisplay');
  const homeTasksCountEl = document.getElementById('homeTasksCount');
  const homeAssignmentListEl = document.getElementById('assignmentList');
  const homeAssignmentsCountEl = document.getElementById('homeAssignmentsCount');
  const homeScheduleGrid = document.getElementById('homeScheduleGrid');

  // --- Overview Modal Elements ---
  const overviewDetails = document.getElementById('overview-details');
  const showOverviewBtn = document.getElementById('showOverviewBtn');
  const hideOverviewBtn = document.getElementById('hideOverviewBtn');
  const currentDateEl = document.getElementById('current-date');
  const weatherDescriptionEl = document.getElementById('weatherDescription');
  const dailyQuoteEl = document.getElementById('dailyQuote'); // For overview modal
  const todayTasksListEl = document.getElementById('todayTasksList');
  const todayAssignmentListEl = document.getElementById('todayAssignmentList');

  // --- Other Widget Elements ---
  const widgetOverlay = document.getElementById('widget-overlay');
  const tasksCompletedEl = document.getElementById('tasks-completed');
  const notificationsListEl = document.getElementById('notifications-list');


  // --- Global State Variables ---
  let workTime = parseInt(localStorage.getItem('pomodoroWorkTime')) || 25;
  let totalTime = workTime * 60;
  let timeLeft = totalTime;
  let timerId = null;

  // --- Initial Theme Application ---
  function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('dark-mode');
      if(themeSelect) themeSelect.value = 'dark';
    } else if (savedTheme === 'light') {
      body.classList.remove('dark-mode');
      if(themeSelect) themeSelect.value = 'light';
    } else { // No 'theme' set, check old 'darkMode' or default to light
      if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark'); // Migrate old setting
        if(themeSelect) themeSelect.value = 'dark';
      } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        if(themeSelect) themeSelect.value = 'light';
      }
    }
  }

  // --- Dark Mode Toggle Function ---
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  function toggleDarkMode() {
    body.classList.toggle('dark-mode');
    const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    if(themeSelect) themeSelect.value = newTheme;
  }
  if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);

  // --- Timer Functionality ---
  function updateDisplay() {
    if (!timerDisplay) return;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function startTimer(event) {
    if (event) event.stopPropagation();
    if (!timerId) {
      timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
          clearInterval(timerId);
          timerId = null;
          if (localStorage.getItem('pomodoroAlerts') !== 'false') {
            alert('Time’s up!');
          }
          timeLeft = totalTime; // Reset to work time for now
          updateDisplay();
        }
      }, 1000);
    }
  }

  function pauseTimer(event) {
    if (event) event.stopPropagation();
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function resetTimer(event) {
    if (event) event.stopPropagation();
    clearInterval(timerId);
    timerId = null;
    workTime = parseInt(localStorage.getItem('pomodoroWorkTime')) || 25; // Re-fetch in case changed
    totalTime = workTime * 60;
    timeLeft = totalTime;
    updateDisplay();
  }

  // --- Navigation Functions ---
  function navigateToPage(url) {
    body.classList.add('fade-out');
    setTimeout(() => window.location.href = url, 500);
  }

  const pomodoroDiv = document.querySelector('.pomodoro');
  if (pomodoroDiv) {
      pomodoroDiv.addEventListener('click', (e) => {
          // Only navigate if not clicking on a button inside .controls
          if (!e.target.closest('.controls')) {
            navigateToPage('pomodoro.html');
          }
      });
  }
  
  const navigateToTasksContainer = document.getElementById('navigateToTasksContainer');
  if (navigateToTasksContainer) {
      navigateToTasksContainer.addEventListener('click', (e) => {
          if (!e.target.classList.contains('view-all-link') && !e.target.closest('a')) {
               navigateToPage('tasks.html');
          }
      });
  }

  const navigateToScheduleBtn = document.getElementById('navigateToScheduleBtn');
  if (navigateToScheduleBtn) {
      navigateToScheduleBtn.addEventListener('click', () => navigateToPage('schedule.html'));
  }
  
  const navigateToPastPaperBtn = document.getElementById('navigateToPastPaperBtn');
  if (navigateToPastPaperBtn) {
    navigateToPastPaperBtn.addEventListener('click', () => navigateToPage('past_paper.html'));
  }

  const navigateToAssignmentSchedulerContainer = document.getElementById('navigateToAssignmentSchedulerContainer');
  if (navigateToAssignmentSchedulerContainer) {
    navigateToAssignmentSchedulerContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('view-all-link') && !e.target.closest('a')) {
            navigateToPage('Assignment scheduler.html');
        }
    });
  }

  const navigateToProgress = document.getElementById('navigateToProgress');
  if (navigateToProgress) {
    navigateToProgress.addEventListener('click', () => navigateToPage('progress.html'));
  }

  // --- Logout Function ---
  const logoutIcon = document.querySelector('.logout-icon');
  function logout() {
    localStorage.removeItem('currentUser'); // Example: clear user session
    navigateToPage('login.html'); // Redirect to login page
  }
  if (logoutIcon) logoutIcon.addEventListener('click', logout);


  // --- Home Page Content Rendering ---
  function renderTasksOnHomePage() {
    if (!tasksDisplayEl) return;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskFilter = localStorage.getItem('homeTaskFilter') || 'all';
    const originalTasksLength = tasks.length;
    let pendingTasksCount = tasks.filter(task => !task.completed).length;

    if (taskFilter === 'pending') {
        tasks = tasks.filter(task => !task.completed);
    }

    tasksDisplayEl.innerHTML = '';
    if (tasks.length === 0) {
        const li = document.createElement('li');
        if (originalTasksLength > 0 && taskFilter === 'pending') {
            li.textContent = "All tasks completed! 🎉";
        } else {
            li.textContent = "No tasks yet. Add some! 📝";
        }
        li.style.color = body.classList.contains('dark-mode') ? '#888' : '#777';
        tasksDisplayEl.appendChild(li);
    } else {
        tasks.slice(0, 5).forEach(task => { // Show max 5 tasks
            const li = document.createElement('li');
            li.textContent = task.text;
            if (task.completed) {
                li.style.textDecoration = 'line-through';
                li.style.color = body.classList.contains('dark-mode') ? '#777' : '#aaa';
            }
            tasksDisplayEl.appendChild(li);
        });
    }
    if (homeTasksCountEl) {
        homeTasksCountEl.textContent = `${pendingTasksCount} pending / ${originalTasksLength} total.`;
    }
  }

  function renderAssignmentsOnHomePage() {
    if (!homeAssignmentListEl) return;
    let allAssignments = JSON.parse(localStorage.getItem('events') || '[]');
    const todayStr = new Date().toISOString().split('T')[0];
    
    const upcomingAssignments = allAssignments.filter(event => event.date >= todayStr);
    upcomingAssignments.sort((a, b) => new Date(a.date) - new Date(b.date));

    homeAssignmentListEl.innerHTML = '';
    if (upcomingAssignments.length === 0) {
        homeAssignmentListEl.innerHTML = `<li style="font-size: 0.9em; color: ${body.classList.contains('dark-mode') ? '#888' : '#777'};">No upcoming assignments. 🎉</li>`;
        if(homeAssignmentsCountEl) homeAssignmentsCountEl.textContent = "All clear!";
    } else {
        upcomingAssignments.slice(0, 3).forEach(assignment => { // Show max 3
            let li = document.createElement('li');
            li.textContent = `${assignment.name} (Due: ${new Date(assignment.date).toLocaleDateString()})`;
            homeAssignmentListEl.appendChild(li);
        });
        if (upcomingAssignments.length > 3) {
            let li = document.createElement('li');
            li.style.fontSize = '0.85em';
            li.style.color = body.classList.contains('dark-mode') ? '#777' : '#999';
            li.textContent = `...and ${upcomingAssignments.length - 3} more.`;
            homeAssignmentListEl.appendChild(li);
        }
        if(homeAssignmentsCountEl) homeAssignmentsCountEl.textContent = `${upcomingAssignments.length} upcoming.`;
    }
  }

  function renderHomeSchedule() {
    if (!homeScheduleGrid) return;
    homeScheduleGrid.querySelectorAll('.day-column').forEach(col => col.innerHTML = ''); // Clear previous
    let studySchedule = JSON.parse(localStorage.getItem('studySchedule')) || [];
    studySchedule.forEach(task => {
      const dayColumn = homeScheduleGrid.querySelector(`[data-day="${task.day}"]`);
      if (dayColumn) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.textContent = task.name;
        dayColumn.appendChild(taskCard);
      }
    });
  }
  
  function fetchHomePageQuote() {
      if (!homePageQuoteEl) return;
      fetch('https://quotable.io/random?maxLength=100') // Shorter quotes for home
      .then(response => response.json())
      .then(data => {
        if(homePageQuoteEl) homePageQuoteEl.textContent = `"${data.content}"`;
      })
      .catch(() => {
        if(homePageQuoteEl) homePageQuoteEl.textContent = '"The secret of getting ahead is getting started."'; // Fallback
      });
  }


  // --- Overview Modal ---
  function showOverview() {
    if (!overviewDetails) return;
    overviewDetails.style.display = 'flex';
    setTimeout(() => overviewDetails.classList.add('show'), 10);

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if(currentDateEl) currentDateEl.textContent = today.toLocaleDateString(navigator.language, options); // Use browser language

    const city = localStorage.getItem('weatherCity')?.trim() || 'Addis Ababa';
    const weatherApiCity = city === '' ? 'Addis Ababa' : city; // Default if empty
    fetch(`https://wttr.in/${encodeURIComponent(weatherApiCity)}?format=%C+%t`)
      .then(response => response.text())
      .then(data => {
        if(weatherDescriptionEl) weatherDescriptionEl.textContent = data.includes("Unknown location") ? "City not found" : data;
      })
      .catch(() => {
        if(weatherDescriptionEl) weatherDescriptionEl.textContent = 'Weather data unavailable';
      });

    fetch('https://quotable.io/random')
      .then(response => response.json())
      .then(data => {
        if(dailyQuoteEl) dailyQuoteEl.textContent = `"${data.content}" - ${data.author}`;
      })
      .catch(() => {
        if(dailyQuoteEl) dailyQuoteEl.textContent = 'Inspiration quote unavailable';
      });

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (todayTasksListEl) {
        todayTasksListEl.innerHTML = '';
        if (tasks.length === 0) {
            todayTasksListEl.innerHTML = '<li>No tasks found.</li>';
        } else {
            tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.text;
            if (task.completed) li.style.textDecoration = 'line-through';
            todayTasksListEl.appendChild(li);
            });
        }
    }

    const todayDateStr = today.toISOString().split('T')[0];
    const assignments = JSON.parse(localStorage.getItem('events')) || [];
    const todayAssignments = assignments.filter(assignment => assignment.date === todayDateStr);
    if (todayAssignmentListEl) {
        todayAssignmentListEl.innerHTML = '';
        if (todayAssignments.length === 0) {
            todayAssignmentListEl.innerHTML = '<li>No assignments due today.</li>';
        } else {
            todayAssignments.forEach(assignment => {
            const li = document.createElement('li');
            li.textContent = assignment.name;
            todayAssignmentListEl.appendChild(li);
            });
        }
    }
  }
  function hideOverview() {
    if (!overviewDetails) return;
    overviewDetails.classList.remove('show');
    setTimeout(() => overviewDetails.style.display = 'none', 300);
  }
  if (showOverviewBtn) showOverviewBtn.addEventListener('click', showOverview);
  if (hideOverviewBtn) hideOverviewBtn.addEventListener('click', hideOverview);


  // --- Widget System ---
  function showWidget(widgetId) {
    if(widgetOverlay) widgetOverlay.style.display = 'block';
    document.querySelectorAll('.widget').forEach(widget => widget.classList.remove('show'));
    const widget = document.getElementById(widgetId);
    if (widget) {
      widget.classList.add('show');
      // Populate widget content
      if (widgetId === 'progress-widget' && tasksCompletedEl) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasksCompletedEl.textContent = tasks.filter(task => task.completed).length;
      } else if (widgetId === 'notifications-widget' && notificationsListEl) {
        const todayStr = new Date().toISOString().split('T')[0];
        const assignments = JSON.parse(localStorage.getItem('events')) || [];
        const upcomingAssignments = assignments.filter(a => a.date >= todayStr);
        notificationsListEl.innerHTML = '';
        if (upcomingAssignments.length === 0) {
            notificationsListEl.innerHTML = '<li>No upcoming assignments or reminders.</li>';
        } else {
            upcomingAssignments.sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(a => {
            const li = document.createElement('li');
            li.textContent = `Assignment "${a.name}" due on ${new Date(a.date).toLocaleDateString()}.`;
            notificationsListEl.appendChild(li);
            });
        }
      } else if (widgetId === 'settings-widget') {
        if(themeSelect) themeSelect.value = localStorage.getItem('theme') || 'light';
        if(workTimeInput) workTimeInput.value = localStorage.getItem('pomodoroWorkTime') || 25;
        if(breakTimeInput) breakTimeInput.value = localStorage.getItem('pomodoroBreakTime') || 5;
        if(pomodoroAlertEnableCheckbox) pomodoroAlertEnableCheckbox.checked = localStorage.getItem('pomodoroAlerts') !== 'false';
        if(weatherLocationInput) weatherLocationInput.value = localStorage.getItem('weatherCity') || '';
        if(homeTaskDisplaySelect) homeTaskDisplaySelect.value = localStorage.getItem('homeTaskFilter') || 'all';
      }
    }
  }

  function closeWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    if (widget) widget.classList.remove('show');
    if(widgetOverlay) widgetOverlay.style.display = 'none';
  }

  function saveSettings() {
    // Theme
    if (themeSelect) {
        const selectedTheme = themeSelect.value;
        localStorage.setItem('theme', selectedTheme);
        if (selectedTheme === 'dark') {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    }
    // Pomodoro
    if (workTimeInput) localStorage.setItem('pomodoroWorkTime', workTimeInput.value);
    if (breakTimeInput) localStorage.setItem('pomodoroBreakTime', breakTimeInput.value);
    if (pomodoroAlertEnableCheckbox) localStorage.setItem('pomodoroAlerts', pomodoroAlertEnableCheckbox.checked);
    
    workTime = parseInt(localStorage.getItem('pomodoroWorkTime')) || 25;
    totalTime = workTime * 60;
    if (!timerId) { // Apply new time if timer isn't running
        timeLeft = totalTime;
        updateDisplay();
    } else { // If timer is running, just update for next cycle
        // User might expect current session to continue with old time or reset.
        // For now, it affects next "reset" or "start".
    }
    // Weather
    if (weatherLocationInput) localStorage.setItem('weatherCity', weatherLocationInput.value.trim());
    // Home Task Filter
    if (homeTaskDisplaySelect) localStorage.setItem('homeTaskFilter', homeTaskDisplaySelect.value);
    renderTasksOnHomePage(); // Re-render tasks on home page with new filter

    alert('Settings saved!');
    closeWidget('settings-widget');
  }
  
  // Event listeners for timer controls
  const startTimerBtn = document.getElementById('startTimerBtn');
  const pauseTimerBtn = document.getElementById('pauseTimerBtn');
  const resetTimerBtn = document.getElementById('resetTimerBtn');
  if(startTimerBtn) startTimerBtn.addEventListener('click', startTimer);
  if(pauseTimerBtn) pauseTimerBtn.addEventListener('click', pauseTimer);
  if(resetTimerBtn) resetTimerBtn.addEventListener('click', resetTimer);

  // Event listeners for widget icons in header
  document.querySelector('.progress-icon')?.addEventListener('click', () => showWidget('progress-widget'));
  document.querySelector('.notifications-icon')?.addEventListener('click', () => showWidget('notifications-widget'));
  document.querySelector('.settings-icon')?.addEventListener('click', () => showWidget('settings-widget'));

  // Event listeners for close buttons in widgets
  document.querySelectorAll('.close-btn, .close-widget-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      closeWidget(this.dataset.widgetId);
    });
  });

  // Event listener for save settings button
  document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);

  // Event listener for widget overlay to close active widgets
  if(widgetOverlay) {
    widgetOverlay.addEventListener('click', function() {
      document.querySelectorAll('.widget.show').forEach(widget => widget.classList.remove('show'));
      this.style.display = 'none';
    });
  }

  // --- Initialization Calls ---
  applyInitialTheme(); // Apply theme first
  updateDisplay(); // Pomodoro timer
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && logoEl) {
    logoEl.textContent = `${currentUser.username}'s Study Hub`; // Personalized greeting
  }

  renderTasksOnHomePage();
  renderAssignmentsOnHomePage();
  renderHomeSchedule();
  fetchHomePageQuote(); // Fetch a quote for the home page inspiration block

});