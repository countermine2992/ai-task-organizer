import { pipeline } from '@xenova/transformers';

class TaskParser {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Load the model and tokenizer
            this.model = await pipeline('token-classification', 'Xenova/distilbert-base-cased');
            this.initialized = true;
            console.log('Task parser initialized successfully');
        } catch (error) {
            console.error('Error initializing task parser:', error);
            throw error;
        }
    }

    async parseTask(text) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Tokenize and classify the input text
            const result = await this.model(text);
            
            // Extract entities
            const entities = this.extractEntities(result);
            
            // Parse date and time
            const { date, time } = this.parseDateTime(entities);
            
            // Extract task description
            const task = this.extractTaskDescription(text, entities);

            return {
                task,
                date: date || this.getDefaultDate(),
                time: time || '12:00:00'
            };
        } catch (error) {
            console.error('Error parsing task:', error);
            return this.getDefaultParsing(text);
        }
    }

    extractEntities(result) {
        const entities = {
            date: [],
            time: [],
            task: []
        };

        let currentEntity = null;
        let currentText = '';

        result.forEach(token => {
            if (token.entity.startsWith('B-')) {
                // Start of new entity
                if (currentEntity) {
                    entities[currentEntity].push(currentText.trim());
                }
                currentEntity = token.entity.substring(2).toLowerCase();
                currentText = token.word;
            } else if (token.entity.startsWith('I-')) {
                // Continuation of entity
                currentText += ' ' + token.word;
            } else {
                // No entity
                if (currentEntity) {
                    entities[currentEntity].push(currentText.trim());
                    currentEntity = null;
                    currentText = '';
                }
            }
        });

        // Add the last entity if exists
        if (currentEntity) {
            entities[currentEntity].push(currentText.trim());
        }

        return entities;
    }

    parseDateTime(entities) {
        const date = entities.date[0] || null;
        const time = entities.time[0] || null;

        return {
            date: date ? this.formatDate(date) : null,
            time: time ? this.formatTime(time) : null
        };
    }

    formatDate(dateStr) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Simple date parsing for common formats
        if (dateStr.toLowerCase().includes('tomorrow')) {
            return tomorrow.toISOString().split('T')[0];
        }
        if (dateStr.toLowerCase().includes('today')) {
            return now.toISOString().split('T')[0];
        }

        // Add more date parsing logic here
        return tomorrow.toISOString().split('T')[0];
    }

    formatTime(timeStr) {
        // Simple time parsing for common formats
        const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
        if (timeMatch) {
            let [_, hours, minutes, period] = timeMatch;
            hours = parseInt(hours);
            minutes = minutes ? parseInt(minutes) : 0;

            if (period) {
                if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
                if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
            }

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        }

        return '12:00:00';
    }

    extractTaskDescription(text, entities) {
        // Remove date and time entities from the text to get the task description
        let task = text;
        entities.date.forEach(date => {
            task = task.replace(date, '');
        });
        entities.time.forEach(time => {
            task = task.replace(time, '');
        });
        return task.trim();
    }

    getDefaultDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    getDefaultParsing(text) {
        return {
            task: text,
            date: this.getDefaultDate(),
            time: '12:00:00'
        };
    }
}

// Create and export a singleton instance
const taskParser = new TaskParser();
export default taskParser; 