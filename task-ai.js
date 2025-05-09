// Task AI Module
window.taskAI = {
    async getTaskSuggestions(tasks) {
        try {
            // Group tasks by time of day
            const morningTasks = tasks.filter(task => {
                const time = new Date(`${task.scheduled_date}T${task.scheduled_time}`);
                return time.getHours() < 12;
            });
            
            const afternoonTasks = tasks.filter(task => {
                const time = new Date(`${task.scheduled_date}T${task.scheduled_time}`);
                return time.getHours() >= 12 && time.getHours() < 17;
            });
            
            const eveningTasks = tasks.filter(task => {
                const time = new Date(`${task.scheduled_date}T${task.scheduled_time}`);
                return time.getHours() >= 17;
            });

            // Generate suggestions based on task patterns
            const suggestions = [];

            // Time-based grouping suggestions
            if (morningTasks.length >= 2) {
                suggestions.push({
                    text: `You have ${morningTasks.length} tasks scheduled for the morning.`,
                    action: 'Consider grouping these tasks together for better efficiency.'
                });
            }

            if (afternoonTasks.length >= 2) {
                suggestions.push({
                    text: `You have ${afternoonTasks.length} tasks scheduled for the afternoon.`,
                    action: 'Try to schedule these tasks in sequence to minimize context switching.'
                });
            }

            if (eveningTasks.length >= 2) {
                suggestions.push({
                    text: `You have ${eveningTasks.length} tasks scheduled for the evening.`,
                    action: 'Consider if any of these tasks could be moved to earlier in the day.'
                });
            }

            // Priority-based suggestions
            const highPriorityTasks = tasks.filter(task => task.priority === 'high');
            if (highPriorityTasks.length > 0) {
                suggestions.push({
                    text: `You have ${highPriorityTasks.length} high-priority tasks.`,
                    action: 'Make sure to tackle these tasks first thing in the day.'
                });
            }

            // Context-based suggestions
            const contexts = {};
            tasks.forEach(task => {
                if (task.context && task.context.length > 0) {
                    task.context.forEach(ctx => {
                        contexts[ctx] = (contexts[ctx] || 0) + 1;
                    });
                }
            });

            Object.entries(contexts).forEach(([context, count]) => {
                if (count >= 2) {
                    suggestions.push({
                        text: `You have ${count} tasks related to ${context}.`,
                        action: 'Consider grouping these tasks together to maintain focus.'
                    });
                }
            });

            // Duration-based suggestions
            const longTasks = tasks.filter(task => {
                const duration = task.estimated_duration;
                return duration && duration.includes('h') && parseInt(duration) >= 2;
            });

            if (longTasks.length > 0) {
                suggestions.push({
                    text: `You have ${longTasks.length} tasks that take 2+ hours each.`,
                    action: 'Consider breaking these into smaller subtasks for better progress tracking.'
                });
            }

            return suggestions;
        } catch (error) {
            console.error('Error generating AI suggestions:', error);
            return [];
        }
    },

    async analyzeTasks(tasks) {
        try {
            // Group tasks by context
            const groupedTasks = {};
            tasks.forEach(task => {
                if (task.context && task.context.length > 0) {
                    task.context.forEach(ctx => {
                        if (!groupedTasks[ctx]) {
                            groupedTasks[ctx] = [];
                        }
                        groupedTasks[ctx].push(task);
                    });
                } else {
                    if (!groupedTasks['general']) {
                        groupedTasks['general'] = [];
                    }
                    groupedTasks['general'].push(task);
                }
            });

            // Get suggestions
            const suggestions = await this.getTaskSuggestions(tasks);

            return {
                groupedTasks,
                suggestions
            };
        } catch (error) {
            console.error('Error analyzing tasks:', error);
            return {
                groupedTasks: {},
                suggestions: []
            };
        }
    }
}; 