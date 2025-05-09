describe('Task Parser Snapshot Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const testCases = [
        {
            name: 'Basic task with time',
            input: 'Meeting with team at 2pm',
            expected: {
                task: 'Meeting with team',
                date: expect.any(String),
                time: '14:00:00',
                priority: 'medium',
                context: ['general'],
                estimatedDuration: '1h',
                dependencies: [],
                metadata: {
                    parsedAt: expect.any(String),
                    confidence: 1.0
                }
            }
        },
        {
            name: 'Task with priority and context',
            input: 'Urgent: Fix production bug in shopping cart',
            expected: {
                task: 'Fix production bug in shopping cart',
                date: expect.any(String),
                time: '12:00:00',
                priority: 'high',
                context: ['work', 'shopping'],
                estimatedDuration: '1h',
                dependencies: [],
                metadata: {
                    parsedAt: expect.any(String),
                    confidence: 1.0
                }
            }
        },
        {
            name: 'Task with tomorrow keyword',
            input: 'Tomorrow: Buy groceries at 5pm',
            expected: {
                task: 'Buy groceries',
                date: expect.any(String),
                time: '17:00:00',
                priority: 'medium',
                context: ['shopping'],
                estimatedDuration: '1h',
                dependencies: [],
                metadata: {
                    parsedAt: expect.any(String),
                    confidence: 1.0
                }
            }
        },
        {
            name: 'Complex task with multiple contexts',
            input: 'High priority: Client presentation tomorrow at 10am for work project',
            expected: {
                task: 'Client presentation for work project',
                date: expect.any(String),
                time: '10:00:00',
                priority: 'high',
                context: ['work'],
                estimatedDuration: '1h',
                dependencies: [],
                metadata: {
                    parsedAt: expect.any(String),
                    confidence: 1.0
                }
            }
        }
    ];

    testCases.forEach(({ name, input, expected }) => {
        test(`should parse ${name} correctly`, async () => {
            const result = await window.taskParser.parseTask(input);
            expect(result).toMatchSnapshot({
                date: expect.any(String),
                metadata: {
                    parsedAt: expect.any(String)
                }
            });
        });
    });

    test('should handle edge cases consistently', async () => {
        const edgeCases = [
            'Task with no time',
            'Task with invalid time',
            'Task with multiple priorities',
            'Task with unknown context',
            'Empty task',
            'Task with special characters',
            'Task with very long text'
        ];

        for (const input of edgeCases) {
            const result = await window.taskParser.parseTask(input);
            expect(result).toMatchSnapshot({
                date: expect.any(String),
                metadata: {
                    parsedAt: expect.any(String)
                }
            });
        }
    });

    test('should maintain consistent output structure', async () => {
        const result = await window.taskParser.parseTask('Test task');
        expect(result).toMatchObject({
            task: expect.any(String),
            date: expect.any(String),
            time: expect.any(String),
            priority: expect.any(String),
            context: expect.any(Array),
            estimatedDuration: expect.any(String),
            dependencies: expect.any(Array),
            metadata: {
                parsedAt: expect.any(String),
                confidence: expect.any(Number)
            }
        });
    });
}); 