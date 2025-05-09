class AIInsights {
    constructor() {
        this.insightsContainer = null;
        this.initialize();
    }

    initialize() {
        // Create insights container
        this.insightsContainer = document.createElement('div');
        this.insightsContainer.id = 'ai-insights-container';
        this.insightsContainer.className = 'ai-insights';
        document.body.appendChild(this.insightsContainer);
    }

    showInsights(parsedTask) {
        const insights = this.generateInsights(parsedTask);
        if (insights.length === 0) return;

        const insightElement = document.createElement('div');
        insightElement.className = 'insight-card';
        
        const header = document.createElement('div');
        header.className = 'insight-header';
        header.innerHTML = '<span class="ai-icon">🤖</span> AI Insights';
        
        const content = document.createElement('div');
        content.className = 'insight-content';
        content.innerHTML = insights.map(insight => `<p>${insight}</p>`).join('');
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.hideInsights(insightElement);
        
        insightElement.appendChild(header);
        insightElement.appendChild(content);
        insightElement.appendChild(closeBtn);
        
        this.insightsContainer.appendChild(insightElement);
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideInsights(insightElement), 5000);
    }

    generateInsights(parsedTask) {
        const insights = [];
        
        // Priority insight
        if (parsedTask.priority === 'high') {
            insights.push(`<span class="priority-high">⚠️ High Priority Task</span>`);
        }
        
        // Context insight
        if (parsedTask.context.length > 0) {
            const contextEmoji = {
                work: '💼',
                personal: '👤',
                shopping: '🛒',
                social: '🎉'
            };
            const contextDisplay = parsedTask.context
                .map(ctx => `${contextEmoji[ctx] || '📌'} ${ctx}`)
                .join(', ');
            insights.push(`Context: ${contextDisplay}`);
        }
        
        // Duration insight
        insights.push(`⏱️ Estimated Duration: ${parsedTask.estimatedDuration}`);
        
        // Dependencies insight
        if (parsedTask.dependencies.length > 0) {
            insights.push(`🔗 Dependencies: ${parsedTask.dependencies.join(', ')}`);
        }
        
        // Confidence score
        if (parsedTask.metadata?.confidence) {
            const confidence = Math.round(parsedTask.metadata.confidence * 100);
            insights.push(`🎯 Parsing Confidence: ${confidence}%`);
        }
        
        return insights;
    }

    hideInsights(element) {
        element.classList.add('fade-out');
        setTimeout(() => element.remove(), 300);
    }
}

// Create and make available globally
window.aiInsights = new AIInsights(); 