const {
    getAISuggestions,
    updateSuggestions
} = require('../app.js');

describe('AI Suggestions', () => {
    // Common mock setup
    let mockFrom;
    let mockSelect;
    let mockLimit;

    beforeEach(() => {
        jest.clearAllMocks();
        document.getElementById('suggestionsList').innerHTML = '';

        // Setup common mock functions
        mockLimit = jest.fn();
        mockSelect = jest.fn();

        // Create chainable mock functions
        mockFrom = jest.fn().mockReturnValue({
            select: mockSelect.mockReturnValue({
                limit: mockLimit
            })
        });

        window.supabaseClient.from = mockFrom;
        window.taskAI = {
            analyzeTasks: jest.fn()
        };

        // Mock window.alert
        window.alert = jest.fn();
    });

    describe('Task Analysis', () => {
        test('should get AI suggestions for tasks successfully', async () => {
            // Arrange
            const mockTasks = [
                {
                    id: 1,
                    title: 'Morning meeting',
                    scheduled_date: '2024-03-21',
                    scheduled_time: '09:00:00',
                    priority: 'high',
                    context: ['work']
                }
            ];

            mockLimit.mockResolvedValueOnce({
                data: mockTasks,
                error: null
            });

            const mockAnalysis = {
                groupedTasks: {
                    work: mockTasks
                },
                suggestions: [
                    {
                        text: 'Consider scheduling meetings in the morning for better productivity',
                        action: 'This can help maintain focus and energy levels.'
                    }
                ]
            };

            window.taskAI.analyzeTasks.mockResolvedValueOnce(mockAnalysis);

            // Act
            await getAISuggestions();

            // Assert
            expect(mockFrom).toHaveBeenCalledWith('tasks');
            expect(mockSelect).toHaveBeenCalled();
            expect(mockLimit).toHaveBeenCalledWith(10);
            expect(window.taskAI.analyzeTasks).toHaveBeenCalledWith(mockTasks);
        });

        test('should validate task data structure', async () => {
            // Arrange
            const mockTasks = [
                {
                    id: 1,
                    title: 'Test task',
                    scheduled_date: '2024-03-21',
                    scheduled_time: '09:00:00',
                    priority: 'high',
                    context: ['work']
                }
            ];

            mockLimit.mockResolvedValueOnce({
                data: mockTasks,
                error: null
            });

            const mockAnalysis = {
                groupedTasks: {
                    work: mockTasks
                },
                suggestions: [
                    {
                        text: 'Test suggestion',
                        action: 'Test action'
                    }
                ]
            };

            window.taskAI.analyzeTasks.mockResolvedValueOnce(mockAnalysis);

            // Act
            await getAISuggestions();

            // Assert
            expect(window.taskAI.analyzeTasks).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        title: expect.any(String),
                        scheduled_date: expect.any(String),
                        scheduled_time: expect.any(String),
                        priority: expect.any(String),
                        context: expect.any(Array)
                    })
                ])
            );
        });
    });

    describe('Error Handling', () => {
        test('should handle empty task list', async () => {
            // Arrange
            mockLimit.mockResolvedValueOnce({
                data: [],
                error: null
            });

            // Act
            await getAISuggestions();

            // Assert
            expect(document.getElementById('suggestionsList').innerHTML).toBe('');
        });

        test('should handle database error', async () => {
            // Arrange
            const error = { message: 'Database connection failed' };
            mockLimit.mockRejectedValueOnce(error);

            // Act & Assert
            await expect(getAISuggestions()).rejects.toThrow(error.message);
            expect(window.alert).toHaveBeenCalledWith('Failed to get AI suggestions: ' + error.message);
        });

        test('should handle AI service error', async () => {
            // Arrange
            mockLimit.mockResolvedValueOnce({
                data: [{ id: 1, title: 'Test task' }],
                error: null
            });

            const error = new Error('AI service unavailable');
            window.taskAI.analyzeTasks.mockRejectedValueOnce(error);

            // Act & Assert
            await expect(getAISuggestions()).rejects.toThrow(error.message);
            expect(window.alert).toHaveBeenCalledWith('Failed to get AI suggestions: ' + error.message);
        });
    });

    describe('UI Updates', () => {
        test('should update suggestions UI correctly', () => {
            // Arrange
            const suggestions = [
                {
                    text: 'You have 2 tasks scheduled for the morning.',
                    action: 'Consider grouping these tasks together for better efficiency.'
                },
                {
                    text: 'You have 3 high-priority tasks.',
                    action: 'Make sure to tackle these tasks first thing in the day.'
                }
            ];
            const groupedTasks = {
                work: [{ id: 1, title: 'Work task' }],
                personal: [{ id: 2, title: 'Personal task' }]
            };

            // Act
            updateSuggestions(suggestions, groupedTasks);

            // Assert
            const suggestionsList = document.getElementById('suggestionsList');
            const suggestionElements = suggestionsList.getElementsByClassName('suggestion-item');
            expect(suggestionElements.length).toBe(suggestions.length);
            
            // Check first suggestion
            const firstSuggestion = suggestionElements[0];
            expect(firstSuggestion.querySelector('.suggestion-text').textContent).toBe(suggestions[0].text);
            expect(firstSuggestion.querySelector('.suggestion-action').textContent).toBe(suggestions[0].action);
            
            // Check second suggestion
            const secondSuggestion = suggestionElements[1];
            expect(secondSuggestion.querySelector('.suggestion-text').textContent).toBe(suggestions[1].text);
            expect(secondSuggestion.querySelector('.suggestion-action').textContent).toBe(suggestions[1].action);
        });

        test('should handle empty suggestions', () => {
            // Arrange
            const suggestions = [];
            const groupedTasks = {};

            // Act
            updateSuggestions(suggestions, groupedTasks);

            // Assert
            const suggestionsList = document.getElementById('suggestionsList');
            expect(suggestionsList.innerHTML).toBe('');
        });

        test('should handle invalid suggestion data', () => {
            // Act & Assert
            expect(() => updateSuggestions(null, null)).toThrow('Invalid suggestions data');
            expect(() => updateSuggestions(undefined, undefined)).toThrow('Invalid suggestions data');
            expect(() => updateSuggestions([], null)).toThrow('Invalid suggestions data');
        });
    });
}); 