console.log('App.js loaded, checking DOM elements...');

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const suggestGroupsBtn = document.getElementById('suggestGroups');
const loadingSpinner = document.getElementById('loadingSpinner');

// Verify DOM elements
console.log('DOM Elements found:', {
    taskInput: !!taskInput,
    addTaskBtn: !!addTaskBtn,
    taskList: !!taskList,
    suggestGroupsBtn: !!suggestGroupsBtn,
    loadingSpinner: !!loadingSpinner
});

// Verify taskParser and supabaseClient
console.log('TaskParser loaded:', !!window.taskParser);
console.log('SupabaseClient loaded:', !!window.supabaseClient);

// Show/hide spinner
function showSpinner() {
    console.log('Showing spinner...');
    loadingSpinner.classList.add('active');
}

function hideSpinner() {
    console.log('Hiding spinner...');
    loadingSpinner.classList.remove('active');
}

// Task Management Functions
async function toggleTask(taskId, completed) {
    showSpinner();
    try {
        console.log('toggleTask called with:', { taskId, completed });
        const { data, error } = await window.supabaseClient
            .from('tasks')
            .update({ completed })
            .eq('id', taskId);

        if (error) {
            throw error;
        }

        await loadTasks();
    } catch (error) {
        console.error('Error in toggleTask:', error);
        alert(`Failed to update task: ${error.message}`);
        throw error;
    } finally {
        hideSpinner();
    }
}

async function deleteTask(taskId) {
    showSpinner();
    try {
        console.log('deleteTask called with:', { taskId });
        const { data, error } = await window.supabaseClient
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            throw error;
        }

        await loadTasks();
    } catch (error) {
        console.error('Error in deleteTask:', error);
        alert(`Failed to delete task: ${error.message}`);
        throw error;
    } finally {
        hideSpinner();
    }
}

async function addTask() {
    showSpinner();
    try {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        
        if (!taskText) {
            throw new Error('Task text cannot be empty');
        }

        console.log('Adding task:', taskText);
        
        // Parse task using AI
        const parsedTask = await window.taskParser.parseTask(taskText);
        console.log('AI-enhanced task parsing result:', parsedTask);
        
        // Prepare task data
        const taskData = {
            title: parsedTask.task,
            scheduled_date: parsedTask.date,
            scheduled_time: parsedTask.time,
            priority: parsedTask.priority,
            context: parsedTask.context,
            estimated_duration: parsedTask.estimatedDuration,
            dependencies: parsedTask.dependencies,
            metadata: parsedTask.metadata,
            created_at: new Date().toISOString()
        };

        console.log('Inserting task data:', taskData);
        const { data, error } = await window.supabaseClient
            .from('tasks')
            .insert(taskData)
            .select();

        if (error) {
            throw error;
        }

        taskInput.value = '';
        await loadTasks();
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task: ' + error.message);
        throw error;
    } finally {
        hideSpinner();
    }
}

function showAIInsights(parsedTask) {
    const insights = [];
    
    // Priority insight
    if (parsedTask.priority === 'high') {
        insights.push('This task has been marked as high priority based on its urgency indicators.');
    }
    
    // Context insight
    if (parsedTask.context.length > 0) {
        insights.push(`This task appears to be related to: ${parsedTask.context.join(', ')}`);
    }
    
    // Duration insight
    insights.push(`Estimated duration: ${parsedTask.estimatedDuration}`);
    
    // Dependencies insight
    if (parsedTask.dependencies.length > 0) {
        insights.push(`This task depends on: ${parsedTask.dependencies.join(', ')}`);
    }
    
    // Show insights in a toast or notification
    if (insights.length > 0) {
        const insightMessage = insights.join('\n');
        console.log('AI Insights:', insightMessage);
        // You can replace this with a proper toast/notification system
        alert('AI Insights:\n' + insightMessage);
    }
}

function sortTasks(tasks) {
    return tasks.sort((a, b) => {
        const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
        const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
        return dateA - dateB;
    });
}

async function loadTasks() {
    showSpinner();
    try {
        const { data, error } = await window.supabaseClient
            .from('tasks')
            .select();

        if (error) {
            throw error;
        }

        const sortedTasks = data.sort((a, b) => {
            const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
            const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
            return dateA - dateB;
        });

        updateTaskList(sortedTasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Failed to load tasks: ' + error.message);
        throw error;
    } finally {
        hideSpinner();
    }
}

function updateTaskGroups(groupedTasks) {
    const taskGroupsContainer = document.getElementById('taskGroups');
    taskGroupsContainer.innerHTML = '';

    // Sort groups by number of tasks (most tasks first)
    const sortedGroups = Object.entries(groupedTasks)
        .sort(([, tasksA], [, tasksB]) => tasksB.length - tasksA.length);

    sortedGroups.forEach(([context, tasks]) => {
        if (tasks.length === 0) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'task-group';
        
        const header = document.createElement('div');
        header.className = 'group-header';
        
        const emoji = {
            work: '💼',
            personal: '👤',
            shopping: '🛒',
            social: '🎉',
            general: '📌',
            urgent: '⚡',
            meetings: '👥',
            errands: '🏃',
            health: '❤️',
            learning: '📚'
        }[context] || '📌';
        
        header.innerHTML = `
            <span class="group-emoji">${emoji}</span>
            <span class="group-title">${context.charAt(0).toUpperCase() + context.slice(1)}</span>
            <span class="task-count">(${tasks.length})</span>
        `;
        
        const taskList = document.createElement('div');
        taskList.className = 'group-tasks';
        
        // Sort tasks within group by date
        const sortedTasks = sortTasks(tasks);
        
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
        
        groupDiv.appendChild(header);
        groupDiv.appendChild(taskList);
        taskGroupsContainer.appendChild(groupDiv);
    });

    // Add empty state if no groups
    if (taskGroupsContainer.children.length === 0) {
        taskGroupsContainer.innerHTML = `
            <div class="no-groups">
                <p>No task groups yet. Add some tasks to see them organized!</p>
            </div>
        `;
    }
}

function updateSuggestions(suggestions, groupedTasks) {
    if (!suggestions || !groupedTasks || !Array.isArray(suggestions)) {
        throw new Error('Invalid suggestions data');
    }

    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';

    suggestions.forEach(suggestion => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'suggestion-item';

        // Always treat suggestion as object
        let text = '';
        let action = '';
        if (typeof suggestion === 'object' && suggestion !== null) {
            text = suggestion.text || '';
            action = suggestion.action || '';
        } else {
            text = String(suggestion);
        }

        // Create text element
        const textElement = document.createElement('div');
        textElement.className = 'suggestion-text';
        textElement.textContent = text;
        suggestionElement.appendChild(textElement);

        // Create action element if it exists
        if (action) {
            const actionElement = document.createElement('div');
            actionElement.className = 'suggestion-action';
            actionElement.textContent = action;
            suggestionElement.appendChild(actionElement);
        }

        suggestionsList.appendChild(suggestionElement);
    });
}

function updateTaskList(tasks) {
    taskList.innerHTML = '';
    if (tasks && tasks.length > 0) {
        console.log('Creating task elements for', tasks.length, 'tasks');
        tasks.forEach((task, index) => {
            try {
                console.log(`Creating element for task ${index + 1}:`, task);
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            } catch (error) {
                console.error('Error creating task element:', error, task);
            }
        });
    } else {
        console.log('No tasks found, showing empty state');
        taskList.innerHTML = '<div class="no-tasks">No tasks yet. Add one above!</div>';
    }
}

function createTaskElement(task) {
    console.log('Creating task element for:', task);
    if (!task || !task.id) {
        console.error('Invalid task data:', task);
        throw new Error('Invalid task data');
    }

    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.dataset.taskId = task.id;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'task-title';
    titleDiv.textContent = task.title;
    contentDiv.appendChild(titleDiv);

    // Date and time
    const datetimeDiv = document.createElement('div');
    datetimeDiv.className = 'task-datetime';
    datetimeDiv.textContent = `${task.scheduled_date} ${task.scheduled_time}`;
    contentDiv.appendChild(datetimeDiv);

    // Metadata (priority, context)
    const metadataDiv = document.createElement('div');
    metadataDiv.className = 'task-metadata';
    metadataDiv.textContent = `Priority: ${task.priority} | Context: ${task.context.join(', ')}`;
    contentDiv.appendChild(metadataDiv);

    taskElement.appendChild(contentDiv);

    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = task.completed ? 'Uncomplete' : 'Complete';
    toggleButton.onclick = () => toggleTask(task.id, !task.completed);
    actionsDiv.appendChild(toggleButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteTask(task.id);
    actionsDiv.appendChild(deleteButton);

    taskElement.appendChild(actionsDiv);

    console.log('Task element created successfully');
    return taskElement;
}

// Test Supabase connection
async function testSupabaseConnection() {
    console.log('Testing Supabase connection...');
    try {
        if (!window.supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        const { data, error } = await window.supabaseClient.from('tasks').select('count');
        
        if (error) {
            console.error('Supabase connection test failed:', error);
            alert('Failed to connect to Supabase. Please check your configuration.');
            return false;
        }
        
        console.log('Supabase connection test successful:', data);
        return true;
    } catch (error) {
        console.error('Error testing Supabase connection:', error);
        alert('Error connecting to Supabase. Please check your configuration.');
        return false;
    }
}

// Add event listeners
console.log('Setting up event listeners...');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, setting up event listeners...');
    
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskInput = document.getElementById('taskInput');
    
    if (addTaskBtn) {
        console.log('Adding click handler to Add Task button');
        addTaskBtn.onclick = () => {
            console.log('Add Task button clicked - handler called');
            addTask();
        };
    } else {
        console.error('Add Task button not found');
    }
    
    if (taskInput) {
        console.log('Adding keypress handler to task input');
        taskInput.onkeypress = (e) => {
            console.log('Key pressed in task input:', e.key);
            if (e.key === 'Enter') {
                console.log('Enter key pressed - calling addTask');
                addTask();
            }
        };
    } else {
        console.error('Task input not found');
    }

    const suggestGroupsBtn = document.getElementById('suggestGroupsBtn');
    if (suggestGroupsBtn) {
        console.log('Adding click handler to Suggest Groups button');
        suggestGroupsBtn.addEventListener('click', getAISuggestions);
    } else {
        console.error('Suggest Groups button not found');
    }
});

// Initialize app
async function initializeApp() {
    console.log('Initializing app...');
    
    // Check table structure first
    const columns = await checkTableStructure();
    if (!columns) {
        alert('Failed to check table structure. Please check the console for details.');
        return;
    }
    
    // Wait for Supabase client to be ready
    let attempts = 0;
    while (!window.supabaseClient && attempts < 10) {
        console.log('Waiting for Supabase client...');
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.supabaseClient) {
        console.error('Supabase client not initialized after waiting');
        alert('Failed to initialize Supabase client. Please refresh the page.');
        return;
    }
    
    // Test Supabase connection
    const connected = await testSupabaseConnection();
    if (!connected) {
        console.error('Failed to connect to Supabase');
        return;
    }
    
    // Load initial tasks
    await loadTasks();
}

// Start the app
initializeApp().catch(error => {
    console.error('Failed to initialize app:', error);
    alert('Failed to initialize app. Please check the console for details.');
});

// Add this function at the top of the file
async function checkTableStructure() {
    try {
        const { data, error } = await window.supabaseClient
            .from('tasks')
            .select('*')
            .limit(1);

        if (error) throw error;

        // Log the first row to see the structure
        console.log('Table structure:', Object.keys(data[0] || {}));
        return Object.keys(data[0] || {});
    } catch (error) {
        console.error('Error checking table structure:', error);
        return null;
    }
}

// AI Task Grouping Functions
async function getAISuggestions() {
    console.log('getAISuggestions called');
    showSpinner();
    try {
        // Get tasks from database
        const { data, error } = await window.supabaseClient
            .from('tasks')
            .select()
            .limit(10);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            updateSuggestions([], {});
            return;
        }

        // Get AI analysis and suggestions
        const { groupedTasks, suggestions } = await window.taskAI.analyzeTasks(data);
        console.log('DEBUG: suggestions passed to updateSuggestions:', suggestions);
        updateSuggestions(suggestions, groupedTasks);
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        alert('Failed to get AI suggestions: ' + error.message);
        throw error;
    } finally {
        hideSpinner();
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addTask,
        deleteTask,
        toggleTask,
        loadTasks,
        getAISuggestions,
        updateSuggestions,
        updateTaskGroups,
        createTaskElement,
        showSpinner,
        hideSpinner
    };
} 