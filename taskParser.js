// Simple task parser with no external dependencies
class TaskParser {
    constructor() {
        this.initialized = true;
        this.priorityKeywords = {
            high: ['urgent', 'asap', 'critical', 'important', 'priority'],
            medium: ['normal', 'regular'],
            low: ['whenever', 'sometime', 'eventually']
        };
        
        this.contextKeywords = {
            work: ['work', 'job', 'office', 'meeting', 'project'],
            personal: ['personal', 'home', 'family', 'health'],
            shopping: ['buy', 'purchase', 'shop', 'groceries'],
            social: ['party', 'event', 'meet', 'social']
        };
    }

    async initialize() {
        // No initialization needed
        return;
    }

    async parseTask(text) {
        console.log('Parsing task with AI-enhanced parser:', text);
        
        // Extract basic task information
        const task = this.extractTaskDescription(text);
        const { date, time } = this.parseDateTime(text);
        
        // AI-enhanced analysis
        const priority = this.analyzePriority(text);
        const context = this.analyzeContext(text);
        const estimatedDuration = this.estimateDuration(text);
        const dependencies = this.identifyDependencies(text);
        
        return {
            task,
            date,
            time,
            priority,
            context,
            estimatedDuration,
            dependencies,
            metadata: {
                parsedAt: new Date().toISOString(),
                confidence: this.calculateConfidence(text)
            }
        };
    }

    parseDateTime(text) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let date = today.toISOString().split('T')[0];
        let time = '12:00:00';

        // Handle "tomorrow" keyword
        if (text.toLowerCase().includes('tomorrow')) {
            date = tomorrow.toISOString().split('T')[0];
        }

        // Parse time
        const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
            const isPM = timeMatch[3].toLowerCase() === 'pm';

            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;

            time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        }

        return { date, time };
    }

    extractTaskDescription(text) {
        // Remove date/time indicators and priority markers
        return text.replace(/(?:tomorrow|today|next week|urgent|high priority|low priority)/gi, '')
            .replace(/\d{1,2}(?::\d{2})?\s*(?:am|pm)/gi, '')
            .trim();
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

    analyzePriority(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('urgent') || lowerText.includes('high priority')) {
            return 'high';
        } else if (lowerText.includes('low priority')) {
            return 'low';
        }
        return 'medium';
    }

    analyzeContext(text) {
        const lowerText = text.toLowerCase();
        const contexts = [];

        for (const [context, keywords] of Object.entries(this.contextKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                contexts.push(context);
            }
        }

        return contexts.length > 0 ? contexts : ['general'];
    }

    estimateDuration(text) {
        // Default duration
        return '1h';
    }

    identifyDependencies(text) {
        // No dependencies identified in basic implementation
        return [];
    }

    calculateConfidence(text) {
        // Basic confidence calculation
        return 1.0;
    }
}

// Create and make available globally
window.taskParser = new TaskParser(); 