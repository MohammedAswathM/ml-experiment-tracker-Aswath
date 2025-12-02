const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema({
  // Basic Information
  experimentName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'pending'],
    default: 'pending'
  },
  
  // Model Configuration
  model: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['classification', 'regression', 'clustering', 'deep-learning', 'nlp', 'computer-vision', 'other'],
      required: true
    },
    framework: {
      type: String,
      enum: ['tensorflow', 'pytorch', 'scikit-learn', 'keras', 'xgboost', 'other']
    },
    version: String
  },
  
  // Dataset Information
  dataset: {
    name: {
      type: String,
      required: true
    },
    size: Number,
    trainSize: Number,
    testSize: Number,
    validationSize: Number,
    features: [String],
    targetVariable: String,
    dataSource: String
  },
  
  // Hyperparameters (flexible schema)
  hyperparameters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Training Configuration
  trainingConfig: {
    epochs: Number,
    batchSize: Number,
    optimizer: String,
    learningRate: Number,
    earlyStopping: Boolean,
    duration: Number // in seconds
  },
  
  // Metrics (flexible for different model types)
  metrics: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1Score: Number,
    loss: Number,
    validationLoss: Number,
    mse: Number,
    rmse: Number,
    mae: Number,
    r2Score: Number,
    auc: Number,
    customMetrics: {
      type: Map,
      of: Number
    }
  },
  
  // Per-epoch metrics for trend analysis
  epochMetrics: [{
    epoch: Number,
    trainLoss: Number,
    valLoss: Number,
    trainAccuracy: Number,
    valAccuracy: Number,
    learningRate: Number
  }],
  
  // Research Notes
  notes: {
    type: String,
    default: ''
  },
  observations: {
    type: String,
    default: ''
  },
  
  // AI-Generated Insights
  aiInsights: {
    summary: String,
    recommendations: [String],
    anomalies: [String],
    comparisonWithPrevious: String,
    generatedAt: Date
  },
  
  // Tags and Categories
  tags: [String],
  category: String,
  
  // Reproducibility
  randomSeed: Number,
  environmentInfo: {
    pythonVersion: String,
    cudaVersion: String,
    packages: Map
  },
  
  // File References
  artifacts: {
    modelPath: String,
    checkpointPath: String,
    logsPath: String,
    configFile: String
  },
  
  // Metadata
  createdBy: {
    type: String,
    default: 'default-user'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  
  // Performance flags (for quick filtering)
  isBestPerforming: {
    type: Boolean,
    default: false
  },
  hasAnomalies: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
experimentSchema.index({ status: 1, createdAt: -1 });
experimentSchema.index({ 'model.type': 1 });
experimentSchema.index({ tags: 1 });
experimentSchema.index({ 'metrics.accuracy': -1 });

// Virtual for duration in minutes
experimentSchema.virtual('durationMinutes').get(function() {
  return this.trainingConfig?.duration ? 
    Math.round(this.trainingConfig.duration / 60) : null;
});

// Method to calculate improvement over previous experiment
experimentSchema.methods.calculateImprovement = function(previousExperiment) {
  if (!previousExperiment) return null;
  
  const improvements = {};
  const currentMetrics = this.metrics;
  const prevMetrics = previousExperiment.metrics;
  
  for (let metric in currentMetrics) {
    if (typeof currentMetrics[metric] === 'number' && prevMetrics[metric]) {
      const improvement = ((currentMetrics[metric] - prevMetrics[metric]) / prevMetrics[metric]) * 100;
      improvements[metric] = improvement.toFixed(2);
    }
  }
  
  return improvements;
};

module.exports = mongoose.model('Experiment', experimentSchema);