const {
    addTask,
    deleteTask,
    toggleTask,
    createTaskElement
} = require('../app.js');

describe('Task Management', () => {
    // Common mock setup
    let mockFrom;
    let mockInsert;
    let mockDelete;
    let mockUpdate;
    let mockSelect;
    let mockEq;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        document.getElementById('taskInput').value = '';
        document.getElementById('taskList').innerHTML = '';

        // Setup common mock functions
        mockEq = jest.fn();
        mockInsert = jest.fn();
        mockDelete = jest.fn();
        mockUpdate = jest.fn();
        mockSelect = jest.fn();

        // Create chainable mock functions
        mockFrom = jest.fn().mockReturnValue({
            insert: mockInsert.mockReturnValue({
                select: mockSelect
            }),
            delete: mockDelete.mockReturnValue({
                eq: mockEq
            }),
            update: mockUpdate.mockReturnValue({
                eq: mockEq
            }),
            select: mockSelect
        });

        window.supabaseClient.from = mockFrom;
        window.taskParser = {
            parseTask: jest.fn().mockResolvedValue({
                task: 'Test task',
                date: '2025-05-09',
                time: '12:00:00',
                priority: 'medium',
                context: ['general'],
                estimatedDuration: '1h',
                dependencies: [],
                metadata: {
                    parsedAt: new Date().toISOString(),
                    confidence: 1
                }
            })
        };

        // Mock window.alert
        window.alert = jest.fn();
    });

    describe('Task Creation', () => {
        test('should add a new task with valid data', async () => {
            // Arrange
            const taskInput = document.getElementById('taskInput');
            taskInput.value = 'Test task';

            mockSelect.mockResolvedValueOnce({
                data: [{ id: 1, title: 'Test task' }],
                error: null
            });

            // Act
            await addTask();

            // Assert
            expect(mockFrom).toHaveBeenCalledWith('tasks');
            expect(mockInsert).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalled();
            expect(taskInput.value).toBe('');
        });

        test('should validate task data structure', async () => {
            // Arrange
            const taskInput = document.getElementById('taskInput');
            taskInput.value = 'Test task';

            mockSelect.mockResolvedValueOnce({
                data: [{
                    id: expect.any(Number),
                    title: expect.any(String),
                    scheduled_date: expect.any(String),
                    scheduled_time: expect.any(String),
                    priority: expect.any(String),
                    context: expect.any(Array)
                }],
                error: null
            });

            // Act
            await addTask();

            // Assert
            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: expect.any(String),
                    scheduled_date: expect.any(String),
                    scheduled_time: expect.any(String),
                    priority: expect.any(String),
                    context: expect.any(Array)
                })
            );
        });

        test('should handle database schema error', async () => {
            // Arrange
            const taskInput = document.getElementById('taskInput');
            taskInput.value = 'Test task';

            const error = { code: 'PGRST204', message: 'Database schema needs to be updated' };
            mockSelect.mockRejectedValueOnce(error);

            // Act & Assert
            await expect(addTask()).rejects.toThrow(error.message);
            expect(window.alert).toHaveBeenCalledWith('Failed to add task: ' + error.message);
        });
    });

    describe('Task Deletion', () => {
        test('should delete task successfully', async () => {
            // Arrange
            const taskId = 1;
            mockEq.mockResolvedValueOnce({
                data: { id: taskId },
                error: null
            });

            // Act
            await deleteTask(taskId);

            // Assert
            expect(mockFrom).toHaveBeenCalledWith('tasks');
            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', taskId);
        });

        test('should handle deletion error', async () => {
            // Arrange
            const taskId = 1;
            const error = { message: 'Failed to delete task' };
            mockEq.mockRejectedValueOnce(error);

            // Act & Assert
            await expect(deleteTask(taskId)).rejects.toThrow(error.message);
            expect(window.alert).toHaveBeenCalledWith('Failed to delete task: ' + error.message);
        });
    });

    describe('Task Completion', () => {
        test('should toggle task completion successfully', async () => {
            // Arrange
            const taskId = 1;
            const completed = true;
            mockEq.mockResolvedValueOnce({
                data: { id: taskId, completed },
                error: null
            });

            // Act
            await toggleTask(taskId, completed);

            // Assert
            expect(mockFrom).toHaveBeenCalledWith('tasks');
            expect(mockUpdate).toHaveBeenCalledWith({ completed });
            expect(mockEq).toHaveBeenCalledWith('id', taskId);
        });

        test('should handle toggle error', async () => {
            // Arrange
            const taskId = 1;
            const completed = true;
            const error = { message: 'Failed to update task' };
            mockEq.mockRejectedValueOnce(error);

            // Act & Assert
            await expect(toggleTask(taskId, completed)).rejects.toThrow(error.message);
            expect(window.alert).toHaveBeenCalledWith('Failed to update task: ' + error.message);
        });
    });

    describe('Task Element Creation', () => {
        test('should create task element with correct structure', () => {
            // Arrange
            const task = {
                id: 1,
                title: 'Test task',
                scheduled_date: '2024-03-21',
                scheduled_time: '14:00:00',
                priority: 'high',
                context: ['work'],
                completed: false
            };

            // Act
            const element = createTaskElement(task);

            // Assert
            expect(element.className).toBe('task-item');
            expect(element.dataset.taskId).toBe(task.id.toString());
            expect(element.querySelector('.task-title').textContent).toBe(task.title);
            expect(element.querySelector('.task-datetime')).toBeTruthy();
            expect(element.querySelector('.task-datetime').textContent).toBe(`${task.scheduled_date} ${task.scheduled_time}`);
            expect(element.querySelector('.task-metadata')).toBeTruthy();
            expect(element.querySelector('.task-metadata').textContent).toContain(task.priority);
            expect(element.querySelector('.task-metadata').textContent).toContain(task.context[0]);
        });

        test('should handle invalid task data', () => {
            expect(() => createTaskElement(null)).toThrow('Invalid task data');
            expect(() => createTaskElement({})).toThrow('Invalid task data');
            expect(() => createTaskElement({ title: 'Test' })).toThrow('Invalid task data');
        });
    });
}); 