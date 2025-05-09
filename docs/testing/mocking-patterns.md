# Testing and Mocking Patterns

This document outlines the mocking patterns and testing strategies used in the TaskBuddy application.

## Supabase Client Mocking

### Basic Setup

The Supabase client is mocked using a chainable mock pattern that mimics the actual Supabase client's method chaining:

```javascript
const createChainableMock = () => {
    const mock = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => {
            return Promise.resolve(mock.lastResult).then(callback);
        })
    };
    return mock;
};
```

### Usage Example

```javascript
// Setup mock
const mockChain = createChainableMock();
window.supabaseClient.from.mockImplementation(() => mockChain);

// Set mock response
setupMockResponse(mockChain, {
    data: [{ id: 1, title: 'Test task' }],
    error: null
});

// Use in test
await addTask();
```

## Task Parser Mocking

The task parser is mocked to provide consistent parsing results for testing:

```javascript
window.taskParser = {
    parseTask: jest.fn().mockImplementation(async (text) => {
        // Implementation details...
    })
};
```

### Snapshot Testing

Task parser results are tested using snapshot tests to ensure consistent output structure:

```javascript
test('should parse task correctly', async () => {
    const result = await window.taskParser.parseTask('Test task');
    expect(result).toMatchSnapshot({
        date: expect.any(String),
        metadata: {
            parsedAt: expect.any(String)
        }
    });
});
```

## AI Service Mocking

The AI service is mocked to provide predictable suggestions and analysis:

```javascript
window.taskAI = {
    getTaskSuggestions: jest.fn(() => Promise.resolve([])),
    analyzeTasks: jest.fn(() => Promise.resolve({
        groupedTasks: {},
        suggestions: []
    }))
};
```

## Integration Testing

Integration tests combine multiple components to test complete workflows:

1. Task Creation Flow
2. Task Management Flow
3. AI Integration Flow

### Example Integration Test

```javascript
test('should successfully add, toggle, and delete a task', async () => {
    // Add task
    await addTask();
    
    // Toggle task
    await toggleTask(1, true);
    
    // Delete task
    await deleteTask(1);
});
```

## Error Handling

All mocks include proper error handling:

```javascript
setupMockResponse(mockChain, {
    data: null,
    error: { message: 'Database connection failed' }
});

await expect(addTask()).rejects.toThrow('Database connection failed');
```

## Best Practices

1. Always clear mocks before each test
2. Use type checking for mock responses
3. Implement proper error handling
4. Use snapshot tests for complex parsing
5. Test edge cases and error scenarios
6. Keep mock implementations simple and focused

## Common Patterns

### Method Chaining

```javascript
const mock = createChainableMock();
mock.select().eq('id', 1).then(callback);
```

### Response Validation

```javascript
const validateSupabaseResponse = (response) => {
    if (!response || typeof response !== 'object') {
        throw new Error('Invalid Supabase response');
    }
    return response;
};
```

### Mock Reset

```javascript
beforeEach(() => {
    jest.clearAllMocks();
    const chain = createChainableMock();
    mockSupabase.from.mockImplementation(() => chain);
});
```

## Troubleshooting

Common issues and solutions:

1. **Mock Chain Breaking**: Ensure all chain methods return `this`
2. **Promise Resolution**: Use `setupMockResponse` for proper promise handling
3. **Type Errors**: Use `validateSupabaseResponse` for type checking
4. **Snapshot Failures**: Update snapshots when intentional changes are made 