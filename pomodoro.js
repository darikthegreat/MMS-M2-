// Function to log study time to localStorage
function logStudyTime(duration) {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    let studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
    studySessions.push({ date: today, duration: duration });
    localStorage.setItem('studySessions', JSON.stringify(studySessions));
}

let totalTime = 25 * 60;
let timeLeft = totalTime;
let timerId = null;
let isRunning = false;
let isWorkSession = true;
let sessionCount = 0;

const workTimeInput = document.getElementById('workTime');
const shortBreakInput = document.getElementById('shortBreak');
const longBreakInput = document.getElementById('longBreak');
const timerDisplay = document.querySelector('.timer');
const startPauseBtn = document.getElementById('start-pause');
const resetBtn = document.getElementById('reset');
const progressRing = document.querySelector('.progress-ring');
const sessionType = document.getElementById('session-type');
const nextSession = document.getElementById('next-session');
const settingsWidget = document.getElementById('settingsWidget');
const overlay = document.getElementById('overlay');
const animationLayer = document.querySelector('.animation-layer');

const savedSettings = JSON.parse(localStorage.getItem('pomodoroSettings'));
if (savedSettings) {
    workTimeInput.value = savedSettings.work;
    shortBreakInput.value = savedSettings.shortBreak;
    longBreakInput.value = savedSettings.longBreak;
    totalTime = savedSettings.work * 60;
    timeLeft = totalTime;
}

const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressRing.style.strokeDasharray = circumference;
progressRing.style.strokeDashoffset = circumference;

function updateProgress(percent) {
    const offset = circumference - (percent * circumference);
    progressRing.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    updateProgress(timeLeft / totalTime);
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startPauseBtn.textContent = '⏸ Pause';
        animationLayer.classList.add('running');
        animationLayer.style.animationDuration = `${totalTime}s`;
        if (isWorkSession) {
            animationLayer.style.background = 'linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 240, 0.15))';
        } else {
            animationLayer.style.background = 'linear-gradient(90deg, rgba(240, 240, 240, 0.05), rgba(220, 220, 220, 0.15))';
        }
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerId);
                if (isWorkSession) {
                    logStudyTime(totalTime / 60); // Log the work session duration in minutes
                }
                sessionCount++;
                if (isWorkSession) {
                    isWorkSession = false;
                    if (sessionCount % 4 === 0) {
                        totalTime = parseInt(longBreakInput.value) * 60;
                        sessionType.textContent = 'Long Break';
                        nextSession.textContent = 'Work';
                    } else {
                        totalTime = parseInt(shortBreakInput.value) * 60;
                        sessionType.textContent = 'Short Break';
                        nextSession.textContent = 'Work';
                    }
                } else {
                    isWorkSession = true;
                    totalTime = parseInt(workTimeInput.value) * 60;
                    sessionType.textContent = 'Work';
                    nextSession.textContent = 'Short Break';
                }
                timeLeft = totalTime;
                updateDisplay();
                alert(isWorkSession ? 'Time to work!' : 'Time for a break!');
                isRunning = false;
                startPauseBtn.textContent = '▶ Start';
                animationLayer.classList.remove('running');
            }
        }, 1000);
    } else {
        pauseTimer();
    }
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    startPauseBtn.textContent = '▶ Resume';
    animationLayer.style.animationPlayState = 'paused';
}

function resetTimer() {
    clearInterval(timerId);
    isWorkSession = true; // Reset to work session
    sessionType.textContent = 'Work';
    nextSession.textContent = 'Short Break';
    totalTime = parseInt(workTimeInput.value) * 60; // Reset to default work time or saved work time
    timeLeft = totalTime;
    isRunning = false;
    startPauseBtn.textContent = '▶ Start';
    updateDisplay();
    animationLayer.classList.remove('running');
    animationLayer.style.animationPlayState = 'initial'; // Reset animation state
    if (animationLayer.style.background) { // Reset background if it was set
        animationLayer.style.background = '';
    }
}


document.getElementById('settingsToggle').addEventListener('click', () => {
    settingsWidget.classList.add('open');
    overlay.style.display = 'block';
});

document.querySelector('.close-widget').addEventListener('click', () => {
    settingsWidget.classList.remove('open');
    overlay.style.display = 'none';
});

overlay.addEventListener('click', () => {
    settingsWidget.classList.remove('open');
    overlay.style.display = 'none';
});

document.getElementById('saveSettings').addEventListener('click', () => {
    const work = parseInt(workTimeInput.value);
    const shortBreak = parseInt(shortBreakInput.value);
    const longBreak = parseInt(longBreakInput.value);
    localStorage.setItem('pomodoroSettings', JSON.stringify({
        work: work,
        shortBreak: shortBreak,
        longBreak: longBreak
    }));

    // Update current session if it's a work session or reset to new work time
    if (isWorkSession) {
        totalTime = work * 60;
    } else {
        // If currently in a break, next session will be work with the new duration
        // Or simply reset to work session with new duration
        isWorkSession = true; // Default to work session after settings change
        sessionType.textContent = 'Work';
        nextSession.textContent = 'Short Break';
        totalTime = work * 60;
    }
    timeLeft = totalTime; // Apply new duration immediately or for the next session start
    resetTimer(); // Resets and updates display with new values
    settingsWidget.classList.remove('open');
    overlay.style.display = 'none';
});

startPauseBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay(); // Initial call to set timer and progress