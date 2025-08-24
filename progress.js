document.addEventListener('DOMContentLoaded', function() {
    // Function to get last 7 days
    function getLast7Days() {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }

    // Retrieve data
    const last7Days = getLast7Days();
    let tasks = [];
    let studySessions = [];

    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
        console.error("Error parsing tasks from localStorage:", e);
        // tasks remains []
    }

    try {
        studySessions = JSON.parse(localStorage.getItem('studySessions')) || [];
    } catch (e) {
        console.error("Error parsing studySessions from localStorage:", e);
        // studySessions remains []
    }

    // Aggregate tasks completed per day
    const tasksPerDay = last7Days.map(date => {
        return tasks.filter(task => task.completed && task.completedDate === date).length;
    });

    // Aggregate study time per day in minutes
    const studyTimePerDay = last7Days.map(date => {
        const totalDurationInOriginalUnit = studySessions.filter(session => session.date === date)
            .reduce((sum, session) => {
                // Assuming session.duration is in seconds from pomodoro.js (totalTime)
                // If it was logged as minutes (totalTime / 60), adjust here or in logging.
                // Based on pomodoro.js, totalTime was in seconds, so session.duration is seconds.
                return sum + (Number(session.duration) || 0);
            }, 0);
        return Math.round(totalDurationInOriginalUnit / 60); // Convert seconds to minutes
    });

    // Create bar chart for tasks
    const tasksCtx = document.getElementById('tasksChart');
    if (tasksCtx) {
        new Chart(tasksCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Tasks Completed',
                    data: tasksPerDay,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, // Maintain aspect ratio but allow shrinking
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Tasks'
                        },
                        ticks: {
                           stepSize: 1 // Ensure y-axis shows whole numbers for tasks
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    } else {
        console.error("Failed to find canvas with ID 'tasksChart'");
    }


    // Create line chart for study time
    const studyTimeCtx = document.getElementById('studyTimeChart');
    if (studyTimeCtx) {
        new Chart(studyTimeCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Study Time (minutes)',
                    data: studyTimePerDay,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)', // Fill color for area under line
                    borderWidth: 2,
                    fill: true // Changed to true to show area, can be false for just line
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    } else {
        console.error("Failed to find canvas with ID 'studyTimeChart'");
    }
});