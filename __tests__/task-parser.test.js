// Mock taskParser is already available in window.taskParser from jest.setup.js

describe('Task Parser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should parse task with date and time', async () => {
        // Arrange
        const taskText = 'Meeting with team tomorrow at 2pm';
        
        // Act
        const result = await window.taskParser.parseTask(taskText);

        // Assert
        expect(result.task).toBe('Meeting with team');
        expect(result.date).toBe(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]);
        expect(result.time).toBe('14:00:00');
        expect(result.priority).toBe('medium');
        expect(result.context).toContain('work');
        expect(result.estimatedDuration).toBe('1h');
        expect(result.dependencies).toEqual([]);
    });

    test('should parse task with priority', async () => {
        // Arrange
        const taskText = 'Urgent: Fix production bug';
        
        // Act
        const result = await window.taskParser.parseTask(taskText);

        // Assert
        expect(result.task).toBe('Fix production bug');
        expect(result.priority).toBe('high');
        expect(result.context).toContain('work');
    });

    test('should parse task with context', async () => {
        // Arrange
        const taskText = 'Buy groceries for dinner';
        
        // Act
        const result = await window.taskParser.parseTask(taskText);

        // Assert
        expect(result.task).toBe('Buy groceries for dinner');
        expect(result.context).toContain('shopping');
        expect(result.context).toContain('personal');
    });

    test('should handle parsing error', async () => {
        // Arrange
        const taskText = 'Invalid task';
        window.taskParser.parseTask.mockRejectedValueOnce(new Error('Parsing failed'));

        // Act & Assert
        await expect(window.taskParser.parseTask(taskText)).rejects.toThrow('Parsing failed');
    });
}); 