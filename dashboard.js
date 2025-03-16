// document.addEventListener('DOMContentLoaded', function() {
    
    // ############################### Advait ##########################################
    
    taskOverlay = document.querySelector(".task-overlay");
    taskModal = document.querySelector(".task-modal");
    taskModalClose = document.querySelector(".task-modal-close");
    taskList = document.querySelector(".task-list");
    viewAllBtn = document.querySelector(".view-all");
    closeBtn = document.querySelector(".close-task-modal");
    
    console.log(viewAllBtn);
    const firebaseURL = "https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json";
    async function fetchRecentTasks() {
        try {
            const response = await axios.get(firebaseURL);
            const tasksData = response.data;
            
            if (!tasksData) return;
    
            // Convert object to an array of tasks
            const tasksArray = Object.values(tasksData.tasks);
    
            // Sort tasks by date and time (newest first) and selecing the first 2 tasks
            tasksArray.sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
            const recentTasks = tasksArray.slice(0, 2);
    
        
            const task1 = document.getElementById("task-1");
            const task2 = document.getElementById("task-2");
    
            // Update first task
            if (recentTasks[0]) {
                task1.querySelector(".date").textContent = recentTasks[0].date;
                task1.querySelector(".time").textContent = recentTasks[0].time;
                task1.querySelector(".task-description").textContent = recentTasks[0].task;
            }
    
            // Update second task
            if (recentTasks[1]) {
                task2.querySelector(".date").textContent = recentTasks[1].date;
                task2.querySelector(".time").textContent = recentTasks[1].time;
                task2.querySelector(".task-description").textContent = recentTasks[1].task;
            }
    
            taskList.innerHTML = "";
            tasksArray.forEach(tasktodo => {
                const taskItem = document.createElement("li");
                taskItem.textContent = `${tasktodo.date} ${tasktodo.time} - ${tasktodo.task}`;
                taskList.appendChild(taskItem);
            })
    
    
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }
    
    fetchRecentTasks();
    console.log(viewAllBtn);
    viewAllBtn.addEventListener("click", () =>{ taskOverlay.style.display = "flex"})
    
    closeBtn.addEventListener("click", () => { taskOverlay.style.display = "none"})
    
// });