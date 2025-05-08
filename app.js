import taskParser from './taskParser.js';
import { supabase, GROK_API_URL, GROK_API_KEY } from './config.js';

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const suggestGroupsBtn = document.getElementById('suggestGroups');
const loadingSpinner = document.getElementById('loadingSpinner');

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('tasks').select('count');
        
        if (error) {
            console.error('Supabase connection test failed:', error);
            alert('Failed to connect to Supabase. Please check your configuration.');
            return false;
        }
        
        console.log('Supabase connection test successful');
        return true;
    } catch (error) {
        console.error('Error testing Supabase connection:', error);
        alert('Error connecting to Supabase. Please check your configuration.');
        return false;
    }
}

// Show/hide spinner
function showSpinner() {
    loadingSpinner.classList.add('active');
}

function hideSpinner() {
    loadingSpinner.classList.remove('active');
}

// Task Management
async function addTask(taskText) {
    try {
        showSpinner();
        
        // Parse task using local DistilBERT model
        const parsedTask = await taskParser.parseTask(taskText);
        
        // Store in Supabase
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    title: parsedTask.task,
                    scheduled_date: parsedTask.date,
                    scheduled_time: parsedTask.time,
                    completed: false
                }
            ])
            .select();

        if (error) {
            console.error('Error adding task:', error);
            throw error;
        }
        
        console.log('Task added successfully:', data);
        
        // Refresh task list
        await loadTasks();
        taskInput.value = '';
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again.');
    } finally {
        hideSpinner();
    }
}

async function loadTasks() {
    try {
        showSpinner();
        console.log('Loading tasks...');
        
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .order('scheduled_date', { ascending: true })
            .order('scheduled_time', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }

        console.log('Tasks loaded:', tasks);

        taskList.innerHTML = '';
        if (tasks && tasks.length > 0) {
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        } else {
            taskList.innerHTML = '<div class="no-tasks">No tasks yet. Add one above!</div>';
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Failed to load tasks. Please refresh the page.');
    } finally {
        hideSpinner();
    }
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    const dateTime = new Date(`${task.scheduled_date}T${task.scheduled_time}`);
    const formattedDateTime = dateTime.toLocaleString();

    div.innerHTML = `
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-datetime">${formattedDateTime}</div>
        </div>
        <div class="task-actions">
            <button onclick="toggleTask(${task.id}, ${!task.completed})">
                ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        </div>
    `;

    return div;
}

async function toggleTask(taskId, completed) {
    try {
        showSpinner();
        const { error } = await supabase
            .from('tasks')
            .update({ completed })
            .eq('id', taskId);

        if (error) throw error;
        await loadTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task. Please try again.');
    } finally {
        hideSpinner();
    }
}

async function deleteTask(taskId) {
    try {
        showSpinner();
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) throw error;
        await loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
    } finally {
        hideSpinner();
    }
}

async function suggestGroups() {
    try {
        showSpinner();
        
        // Get all incomplete tasks
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('completed', false);

        if (error) throw error;

        if (!tasks || tasks.length === 0) {
            alert('No incomplete tasks to analyze.');
            return;
        }

        // Format tasks for Grok API
        const taskList = tasks.map(task => ({
            title: task.title,
            date: task.scheduled_date,
            time: task.scheduled_time
        }));

        // Send to Grok API for analysis
        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROK_API_KEY}`
            },
            body: JSON.stringify({
                tasks: taskList,
                analysis_type: 'grouping'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Display suggestions in a modal
        showSuggestionsModal(result.suggestions);
    } catch (error) {
        console.error('Error getting group suggestions:', error);
        alert('Failed to get group suggestions. Please try again.');
    } finally {
        hideSpinner();
    }
}

function showSuggestionsModal(suggestions) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Create modal content
    const content = document.createElement('div');
    content.className = 'modal-content';
    
    // Add suggestions
    const suggestionsList = document.createElement('ul');
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        suggestionsList.appendChild(li);
    });
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = () => {
        document.body.removeChild(modal);
    };
    
    // Assemble modal
    content.appendChild(document.createElement('h3')).textContent = 'Task Grouping Suggestions';
    content.appendChild(suggestionsList);
    content.appendChild(closeButton);
    modal.appendChild(content);
    
    // Add modal to page
    document.body.appendChild(modal);
}

// Event Listeners
addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTask(taskText);
        }
    }
});

suggestGroupsBtn.addEventListener('click', suggestGroups);

// Initialize app
async function initializeApp() {
    try {
        console.log('Initializing app...');
        await loadTasks();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Failed to initialize app. Please refresh the page.');
    }
}

// Start the app
initializeApp(); 