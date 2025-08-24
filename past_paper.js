document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const mainContainer = document.querySelector('.past-paper-main'); // Get main container

    // --- Dark Mode ---
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }
    window.toggleDarkMode = function() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    }

    // --- Navigation ---
    window.navigateToHome = () => {
        body.classList.add('fade-out');
        // Ensure pdf-focused class is removed if navigating away
        if (mainContainer.classList.contains('pdf-focused')) {
            mainContainer.classList.remove('pdf-focused');
        }
        setTimeout(() => window.location.href = 'index.html', 500);
    }
    window.logout = () => {
        localStorage.removeItem('currentUser');
        body.classList.add('fade-out');
        if (mainContainer.classList.contains('pdf-focused')) {
            mainContainer.classList.remove('pdf-focused');
        }
        setTimeout(() => window.location.href = 'login.html', 500);
    }

    // --- DOM Elements ---
    const paperSelectionSection = document.getElementById('paper-selection-section');
    // const fileUploadArea = document.getElementById('file-upload-area'); // Not directly manipulated as a whole after init
    const pdfFileInput = document.getElementById('pdf-file-input');
    const browseFileBtn = document.getElementById('browse-file-btn');
    const dragDropZone = document.getElementById('drag-drop-zone');

    const pdfDisplaySection = document.getElementById('pdf-display-section');
    const loadedPaperNameEl = document.getElementById('loaded-paper-name');
    const pdfViewer = document.getElementById('pdf-viewer');
    const togglePdfSizeBtn = document.getElementById('toggle-pdf-size-btn'); // New button

    const workoutCompanionSection = document.getElementById('workout-companion-section');
    const currentPaperInfoEl = document.getElementById('current-paper-info');
    const timerDisplay = document.getElementById('timer-display');
    const findMarkSchemeBtn = document.getElementById('find-mark-scheme-btn');
    const setCustomTimerBtn = document.getElementById('set-custom-timer-btn');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const pauseTimerBtn = document.getElementById('pause-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    const finishSessionBtn = document.getElementById('finish-session-btn');
    const notesArea = document.getElementById('notes-area');

    // --- State Variables ---
    let currentFile = null;
    let currentFileURL = null;
    let timerInterval = null;
    let timeLeftInSeconds = (parseInt(localStorage.getItem('pomodoroWorkTime')) || 25) * 60;
    let isTimerPaused = false;

    // --- File Handling ---
    browseFileBtn.addEventListener('click', () => pdfFileInput.click());
    pdfFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    dragDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragDropZone.classList.add('dragover');
    });

    dragDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault(); // Important for consistency
        dragDropZone.classList.remove('dragover');
    });

    dragDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    function handleFile(file) {
        if (file && file.type === "application/pdf") {
            currentFile = file;

            if (currentFileURL) {
                URL.revokeObjectURL(currentFileURL);
            }
            currentFileURL = URL.createObjectURL(file);
            pdfViewer.src = currentFileURL;

            loadedPaperNameEl.textContent = file.name; // Show full name here
            let workoutTitle = file.name;
            if (workoutTitle.length > 35) { // Truncate for workout companion header
                workoutTitle = workoutTitle.substring(0, 32) + "...";
            }
            currentPaperInfoEl.textContent = `Workout: ${workoutTitle}`;

            pdfDisplaySection.style.display = 'block';
            workoutCompanionSection.style.display = 'block';
            paperSelectionSection.style.display = 'none';

            findMarkSchemeBtn.onclick = () => {
                const query = file.name.replace(/\.pdf$/i, "") + " mark scheme";
                window.open(`https://www.google.com/search?q=site:papacambridge.com ${encodeURIComponent(query)}`, '_blank');
            };
            
            // Reset wider view button text
            togglePdfSizeBtn.textContent = 'Wider View';
            if (mainContainer.classList.contains('pdf-focused')) { // If previous paper was in wider view, reset for new paper
                 mainContainer.classList.remove('pdf-focused');
            }


            resetTimerToDefault();
            updateTimerDisplay();

        } else {
            alert("Please select a valid PDF file.");
            currentFile = null;
            if (currentFileURL) {
                URL.revokeObjectURL(currentFileURL);
                currentFileURL = null;
            }
            pdfViewer.src = 'about:blank';
        }
    }

    // --- PDF Size Toggle ---
    togglePdfSizeBtn.addEventListener('click', () => {
        mainContainer.classList.toggle('pdf-focused');
        if (mainContainer.classList.contains('pdf-focused')) {
            togglePdfSizeBtn.textContent = 'Normal View';
        } else {
            togglePdfSizeBtn.textContent = 'Wider View';
        }
    });

    // --- Timer Logic ---
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeftInSeconds);
    }

    function resetTimerToDefault() {
        clearInterval(timerInterval);
        timerInterval = null;
        isTimerPaused = false;
        timeLeftInSeconds = (parseInt(localStorage.getItem('pomodoroWorkTime')) || 25) * 60;
        updateTimerDisplay();
        startTimerBtn.style.display = 'inline-block';
        startTimerBtn.disabled = false;
        pauseTimerBtn.style.display = 'none';
        pauseTimerBtn.textContent = 'Pause Timer';
        resetTimerBtn.style.display = 'none';
    }
    
    setCustomTimerBtn.addEventListener('click', () => {
        if (timerInterval && !isTimerPaused) {
             alert("Please pause or reset the current timer before setting a new one.");
             return;
        }
        const newTimeMinutes = prompt("Enter workout duration in minutes:", Math.floor(timeLeftInSeconds / 60));
        if (newTimeMinutes !== null && !isNaN(newTimeMinutes) && parseInt(newTimeMinutes) > 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            isTimerPaused = false;
            timeLeftInSeconds = parseInt(newTimeMinutes) * 60;
            updateTimerDisplay();
            startTimerBtn.style.display = 'inline-block';
            startTimerBtn.disabled = false;
            pauseTimerBtn.style.display = 'none';
            pauseTimerBtn.textContent = 'Pause Timer';
            resetTimerBtn.style.display = 'none';
        } else if (newTimeMinutes !== null) {
            alert("Invalid time entered. Please enter a positive number.");
        }
    });

    startTimerBtn.addEventListener('click', () => {
        if (timeLeftInSeconds <= 0) {
            alert("Please set a valid timer duration using 'Set Custom Timer'.");
            return;
        }
        isTimerPaused = false;
        clearInterval(timerInterval); 
        timerInterval = setInterval(() => {
            if (!isTimerPaused && timeLeftInSeconds > 0) {
                timeLeftInSeconds--;
                updateTimerDisplay();
            } else if (timeLeftInSeconds === 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                alert('Time is up!');
                pauseTimerBtn.style.display = 'none';
                startTimerBtn.style.display = 'inline-block';
                startTimerBtn.disabled = true; 
            }
        }, 1000);
        startTimerBtn.style.display = 'none';
        pauseTimerBtn.style.display = 'inline-block';
        resetTimerBtn.style.display = 'inline-block';
    });

    pauseTimerBtn.addEventListener('click', () => {
        isTimerPaused = !isTimerPaused;
        pauseTimerBtn.textContent = isTimerPaused ? 'Resume Timer' : 'Pause Timer';
    });

    resetTimerBtn.addEventListener('click', () => {
        resetTimerToDefault();
    });

    finishSessionBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        
        // Calculate actual time worked if timer was started
        let initialTime = (parseInt(localStorage.getItem('pomodoroWorkTimeUsed')) || parseInt(localStorage.getItem('pomodoroWorkTime')) || 25) * 60;
        // If custom time was set, need a way to get that initial value.
        // For simplicity, if timer ran, pomodoroWorkTime is likely the base.
        // This part needs robust logic if tracking actual time spent is critical for custom times.
        // For now, let's just say workout finished.
        alert(`Workout session finished! Notes saved (simulated).`);
        
        // Reset UI
        workoutCompanionSection.style.display = 'none';
        pdfDisplaySection.style.display = 'none';
        if (currentFileURL) {
            URL.revokeObjectURL(currentFileURL);
            currentFileURL = null;
        }
        pdfViewer.src = 'about:blank';
        paperSelectionSection.style.display = 'block';
        
        // Reset wider view if active
        if (mainContainer.classList.contains('pdf-focused')) {
            mainContainer.classList.remove('pdf-focused');
            togglePdfSizeBtn.textContent = 'Wider View';
        }

        currentFile = null;
        pdfFileInput.value = '';
        notesArea.value = '';
        loadedPaperNameEl.textContent = "";
        currentPaperInfoEl.textContent = "Workout Companion";

        resetTimerToDefault();
    });

    // --- Initialization ---
    updateTimerDisplay(); 
});