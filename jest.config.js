module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./jest.setup.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    testMatch: ['**/__tests__/**/*.test.js'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    }
}; 