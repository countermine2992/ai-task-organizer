const {
    addTask,
    deleteTask,
    toggleTask,
    loadTasks,
    getAISuggestions
} = require('../../app.js');

const {
    createChainableMock,
    setupMockResponse,
    validateSupabaseResponse
} = require('../../jest.setup.js');

describe('Task Management Integration', () => {
    let mockChain;

    beforeEach(() => {
        // Setup fresh mock chain for each test
        mockChain = createChainableMock();
        window.supabaseClient.from.mockImplementation(() => mockChain);
    });

    describe('Complete Task Flow', () => {
        test('should successfully add, toggle, and delete a task', async () => {
            // 1. Add Task
            const taskText = 'Test integration task';
            document.getElementById('taskInput').value = taskText;

            // Mock successful task addition
            setupMockResponse(mockChain, {
                data: [{
                    id: 1,
                    title: taskText,
                    scheduled_date: '2024-03-21',
                    scheduled_time: '12:00:00',
                    priority: 'medium',
                    context: ['general'],
                    completed: false
                }],
                error: null
            });

            await addTask();
            expect(document.querySelector('.task-item')).toBeTruthy();

            // 2. Toggle Task
            setupMockResponse(mockChain, {
                data: [{
                    id: 1,
                    completed: true
                }],
                error: null
            });

            await toggleTask(1, true);
            expect(document.querySelector('.task-item button').textContent).toBe('Uncomplete');

            // 3. Delete Task
            setupMockResponse(mockChain, {
                data: null,
                error: null
            });

            await deleteTask(1);
            expect(document.querySelector('.task-item')).toBeFalsy();
        });
    });

    describe('Task Loading and AI Integration', () => {
        test('should load tasks and get AI suggestions', async () => {
            // Mock task loading
            const mockTasks = [
                {
                    id: 1,
                    title: 'Work task',
                    scheduled_date: '2024-03-21',
                    scheduled_time: '09:00:00',
                    priority: 'high',
                    context: ['work'],
                    completed: false
                },
                {
                    id: 2,
                    title: 'Personal task',
                    scheduled_date: '2024-03-21',
                    scheduled_time: '14:00:00',
                    priority: 'medium',
                    context: ['personal'],
                    completed: false
                }
            ];

            setupMockResponse(mockChain, {
                data: mockTasks,
                error: null
            });

            await loadTasks();
            expect(document.querySelectorAll('.task-item').length).toBe(2);

            // Mock AI suggestions
            const mockAnalysis = {
                groupedTasks: {
                    work: [mockTasks[0]],
                    personal: [mockTasks[1]]
                },
                suggestions: [
                    {
                        text: 'Consider scheduling work tasks in the morning',
                        action: 'This can help maintain focus and energy levels.'
                    }
                ]
            };

            window.taskAI.analyzeTasks.mockResolvedValueOnce(mockAnalysis);
            await getAISuggestions();

            const suggestions = document.querySelectorAll('.suggestion-item');
            expect(suggestions.length).toBe(1);
            expect(suggestions[0].querySelector('.suggestion-text').textContent).toBe(mockAnalysis.suggestions[0].text);
            expect(suggestions[0].querySelector('.suggestion-action').textContent).toBe(mockAnalysis.suggestions[0].action);
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle database errors gracefully', async () => {
            // Mock database error
            setupMockResponse(mockChain, {
                data: null,
                error: { message: 'Database connection failed' }
            });

            // Test error handling in addTask
            document.getElementById('taskInput').value = 'Test task';
            await expect(addTask()).rejects.toThrow('Database connection failed');
            expect(window.alert).toHaveBeenCalledWith('Failed to add task: Database connection failed');

            // Test error handling in loadTasks
            await expect(loadTasks()).rejects.toThrow('Database connection failed');
            expect(window.alert).toHaveBeenCalledWith('Failed to load tasks: Database connection failed');
        });
    });
}); 