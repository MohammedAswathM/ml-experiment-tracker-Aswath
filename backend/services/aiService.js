const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // Generate insights for a single experiment
  async generateExperimentInsights(experiment, allExperiments = []) {
    try {
      const prompt = this.buildInsightPrompt(experiment, allExperiments);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const insights = this.parseInsights(response.text());
      
      return insights;
    } catch (error) {
      console.error('AI Insight Generation Error:', error);
      return this.getFallbackInsights(experiment);
    }
  }

  // Build detailed prompt for ML experiment analysis
  buildInsightPrompt(experiment, allExperiments) {
    const recentExperiments = allExperiments
      .filter(exp => exp.model.type === experiment.model.type)
      .slice(-5)
      .map(exp => ({
        name: exp.experimentName,
        accuracy: exp.metrics.accuracy,
        loss: exp.metrics.loss,
        params: Object.fromEntries(exp.hyperparameters)
      }));

    return `You are an expert ML engineer analyzing experiment results. Provide detailed, actionable insights.

CURRENT EXPERIMENT:
- Name: ${experiment.experimentName}
- Model: ${experiment.model.name} (${experiment.model.type})
- Framework: ${experiment.model.framework}
- Dataset: ${experiment.dataset.name} (${experiment.dataset.size} samples)

HYPERPARAMETERS:
${JSON.stringify(Object.fromEntries(experiment.hyperparameters), null, 2)}

TRAINING CONFIG:
- Epochs: ${experiment.trainingConfig?.epochs}
- Batch Size: ${experiment.trainingConfig?.batchSize}
- Optimizer: ${experiment.trainingConfig?.optimizer}
- Learning Rate: ${experiment.trainingConfig?.learningRate}

METRICS:
- Accuracy: ${experiment.metrics.accuracy}
- Loss: ${experiment.metrics.loss}
- Validation Loss: ${experiment.metrics.validationLoss}
- F1 Score: ${experiment.metrics.f1Score}
- Precision: ${experiment.metrics.precision}
- Recall: ${experiment.metrics.recall}

EPOCH-WISE TRENDS:
${experiment.epochMetrics ? this.formatEpochTrends(experiment.epochMetrics) : 'Not available'}

RECENT SIMILAR EXPERIMENTS:
${JSON.stringify(recentExperiments, null, 2)}

NOTES FROM RESEARCHER:
${experiment.notes || 'None'}

Please provide a JSON response with the following structure:
{
  "summary": "2-3 sentence overall assessment of the experiment",
  "recommendations": ["specific actionable recommendation 1", "recommendation 2", "recommendation 3"],
  "anomalies": ["any unusual patterns or red flags"],
  "comparisonWithPrevious": "how this compares to recent experiments",
  "hyperparameterSuggestions": {
    "parameterName": "suggested value and reasoning"
  }
}

Focus on:
1. Overfitting/underfitting detection
2. Learning rate optimization
3. Batch size impacts
4. Convergence patterns
5. Metric trade-offs
6. Next steps for improvement`;
  }

  formatEpochTrends(epochMetrics) {
    if (!epochMetrics || epochMetrics.length === 0) return 'None';
    
    const first = epochMetrics[0];
    const last = epochMetrics[epochMetrics.length - 1];
    const mid = epochMetrics[Math.floor(epochMetrics.length / 2)];
    
    return `
    Early (Epoch ${first.epoch}): Train Loss=${first.trainLoss}, Val Loss=${first.valLoss}
    Mid (Epoch ${mid.epoch}): Train Loss=${mid.trainLoss}, Val Loss=${mid.valLoss}
    Final (Epoch ${last.epoch}): Train Loss=${last.trainLoss}, Val Loss=${last.valLoss}
    `;
  }

  parseInsights(text) {
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      return {
        summary: parsed.summary || 'Analysis completed',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies : [],
        comparisonWithPrevious: parsed.comparisonWithPrevious || '',
        hyperparameterSuggestions: parsed.hyperparameterSuggestions || {},
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('JSON parsing error:', error);
      // Fallback: try to extract insights from plain text
      return {
        summary: text.substring(0, 200),
        recommendations: [],
        anomalies: [],
        comparisonWithPrevious: '',
        generatedAt: new Date()
      };
    }
  }

  getFallbackInsights(experiment) {
    const insights = {
      summary: 'Experiment completed. Manual analysis recommended.',
      recommendations: [],
      anomalies: [],
      comparisonWithPrevious: '',
      generatedAt: new Date()
    };

    // Basic rule-based insights
    if (experiment.metrics.accuracy < 0.6) {
      insights.recommendations.push('Low accuracy detected. Consider increasing model complexity or feature engineering.');
    }

    if (experiment.metrics.validationLoss > experiment.metrics.loss * 1.5) {
      insights.anomalies.push('Potential overfitting: Validation loss significantly higher than training loss.');
      insights.recommendations.push('Apply regularization techniques (L1/L2, dropout) to reduce overfitting.');
    }

    return insights;
  }

  // Natural Language Query Processing
  async processNaturalLanguageQuery(query, experiments) {
    try {
      const prompt = `You are an ML experiment database assistant. Answer the following question based on the experiment data provided.

QUESTION: ${query}

AVAILABLE EXPERIMENTS:
${JSON.stringify(experiments.map(exp => ({
  name: exp.experimentName,
  model: exp.model.name,
  type: exp.model.type,
  accuracy: exp.metrics.accuracy,
  loss: exp.metrics.loss,
  date: exp.createdAt,
  status: exp.status,
  hyperparameters: Object.fromEntries(exp.hyperparameters)
})), null, 2)}

Provide a clear, concise answer. If asked for specific experiments, return their IDs or names. If asked for comparisons, provide detailed analysis.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('NL Query Error:', error);
      return 'Sorry, I could not process your query. Please try rephrasing.';
    }
  }

  // Suggest optimal hyperparameters based on historical data
  async suggestHyperparameters(modelType, dataset, previousExperiments) {
    try {
      const relevantExperiments = previousExperiments
        .filter(exp => exp.model.type === modelType)
        .sort((a, b) => (b.metrics.accuracy || 0) - (a.metrics.accuracy || 0))
        .slice(0, 10);

      const prompt = `As an ML optimization expert, suggest optimal hyperparameters for a new experiment.

MODEL TYPE: ${modelType}
DATASET: ${dataset.name} (${dataset.size} samples, ${dataset.features?.length} features)

TOP PERFORMING PAST EXPERIMENTS:
${JSON.stringify(relevantExperiments.map(exp => ({
  accuracy: exp.metrics.accuracy,
  hyperparameters: Object.fromEntries(exp.hyperparameters),
  trainingConfig: exp.trainingConfig
})), null, 2)}

Based on these successful experiments, suggest optimal hyperparameters as a JSON object:
{
  "learningRate": 0.001,
  "batchSize": 32,
  "epochs": 50,
  "optimizer": "adam",
  "reasoning": "Explanation for these choices"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Hyperparameter suggestion error:', error);
      return null;
    }
  }

  // Detect anomalies across all experiments
  async detectAnomalies(experiments) {
    const anomalies = [];

    experiments.forEach(exp => {
      // Rule-based anomaly detection
      if (exp.metrics.validationLoss > exp.metrics.loss * 2) {
        anomalies.push({
          experimentId: exp._id,
          experimentName: exp.experimentName,
          type: 'severe_overfitting',
          severity: 'high',
          description: 'Validation loss is more than 2x training loss'
        });
      }

      if (exp.metrics.accuracy < 0.5 && exp.model.type === 'classification') {
        anomalies.push({
          experimentId: exp._id,
          experimentName: exp.experimentName,
          type: 'poor_performance',
          severity: 'medium',
          description: 'Accuracy below 50% for classification task'
        });
      }

      if (exp.trainingConfig?.duration > 36000) { // 10 hours
        anomalies.push({
          experimentId: exp._id,
          experimentName: exp.experimentName,
          type: 'long_training',
          severity: 'low',
          description: 'Training took more than 10 hours'
        });
      }
    });

    return anomalies;
  }

  // Generate comparative report
  async generateComparativeReport(experimentIds, allExperiments) {
    try {
      const experiments = allExperiments.filter(exp => 
        experimentIds.includes(exp._id.toString())
      );

      const prompt = `Generate a comparative analysis report for these ML experiments:

${JSON.stringify(experiments.map(exp => ({
  name: exp.experimentName,
  model: exp.model.name,
  metrics: exp.metrics,
  hyperparameters: Object.fromEntries(exp.hyperparameters),
  date: exp.createdAt
})), null, 2)}

Provide:
1. Performance comparison
2. Best performing configuration
3. Key differences and their impacts
4. Recommendations for future experiments

Format as markdown.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Report generation error:', error);
      return 'Report generation failed. Please try again.';
    }
  }
}

module.exports = new AIService();