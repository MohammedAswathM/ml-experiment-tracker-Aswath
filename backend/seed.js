require('dotenv').config();
const mongoose = require('mongoose');
const Experiment = require('./models/Experiment');

const sampleExperiments = [
  {
    experimentName: "ResNet50 Image Classification v1",
    description: "Testing ResNet50 on CIFAR-10 with data augmentation and transfer learning",
    status: "completed",
    model: {
      name: "ResNet50",
      type: "computer-vision",
      framework: "pytorch",
      version: "2.0.0"
    },
    dataset: {
      name: "CIFAR-10",
      size: 50000,
      trainSize: 40000,
      testSize: 10000,
      features: ["image_pixels"],
      targetVariable: "class_label"
    },
    hyperparameters: new Map([
      ['learning_rate', 0.001],
      ['weight_decay', 0.0001],
      ['dropout', 0.5],
      ['momentum', 0.9]
    ]),
    trainingConfig: {
      epochs: 100,
      batchSize: 128,
      optimizer: "adam",
      learningRate: 0.001,
      earlyStopping: true,
      duration: 3600
    },
    metrics: {
      accuracy: 0.9245,
      precision: 0.9180,
      recall: 0.9200,
      f1Score: 0.9190,
      loss: 0.2345,
      validationLoss: 0.2567
    },
    epochMetrics: [
      { epoch: 1, trainLoss: 2.3, valLoss: 2.1, trainAccuracy: 0.3, valAccuracy: 0.35 },
      { epoch: 25, trainLoss: 0.8, valLoss: 0.9, trainAccuracy: 0.75, valAccuracy: 0.72 },
      { epoch: 50, trainLoss: 0.4, valLoss: 0.5, trainAccuracy: 0.88, valAccuracy: 0.85 },
      { epoch: 75, trainLoss: 0.28, valLoss: 0.32, trainAccuracy: 0.91, valAccuracy: 0.89 },
      { epoch: 100, trainLoss: 0.23, valLoss: 0.26, trainAccuracy: 0.925, valAccuracy: 0.91 }
    ],
    notes: "Excellent results. Minimal overfitting with proper regularization.",
    tags: ["image-classification", "resnet", "cifar10", "transfer-learning"]
  },
  {
    experimentName: "BERT Sentiment Analysis",
    description: "Fine-tuning BERT base for movie review sentiment classification",
    status: "completed",
    model: {
      name: "BERT-base-uncased",
      type: "nlp",
      framework: "tensorflow",
      version: "2.11.0"
    },
    dataset: {
      name: "IMDB Reviews",
      size: 25000,
      trainSize: 20000,
      testSize: 5000,
      features: ["text"],
      targetVariable: "sentiment"
    },
    hyperparameters: new Map([
      ['learning_rate', 0.00002],
      ['max_seq_length', 512],
      ['warmup_steps', 500],
      ['num_labels', 2]
    ]),
    trainingConfig: {
      epochs: 5,
      batchSize: 16,
      optimizer: "adam",
      learningRate: 0.00002,
      earlyStopping: false,
      duration: 7200
    },
    metrics: {
      accuracy: 0.9450,
      precision: 0.9420,
      recall: 0.9480,
      f1Score: 0.9450,
      loss: 0.1523,
      validationLoss: 0.1687
    },
    notes: "BERT performs exceptionally well on sentiment analysis. Consider distillation for production.",
    tags: ["nlp", "bert", "sentiment-analysis", "transformers"]
  },
  {
    experimentName: "XGBoost Customer Churn Prediction",
    description: "Predicting customer churn using XGBoost with feature engineering",
    status: "completed",
    model: {
      name: "XGBoost",
      type: "classification",
      framework: "xgboost",
      version: "1.7.0"
    },
    dataset: {
      name: "Telecom Churn Dataset",
      size: 7043,
      trainSize: 5634,
      testSize: 1409,
      features: ["tenure", "monthly_charges", "total_charges", "contract_type"],
      targetVariable: "churn"
    },
    hyperparameters: new Map([
      ['max_depth', 6],
      ['learning_rate', 0.1],
      ['n_estimators', 200],
      ['subsample', 0.8],
      ['colsample_bytree', 0.8],
      ['gamma', 0.1]
    ]),
    trainingConfig: {
      epochs: 200,
      batchSize: 32,
      optimizer: "gradient-boosting",
      learningRate: 0.1,
      earlyStopping: true,
      duration: 120
    },
    metrics: {
      accuracy: 0.8234,
      precision: 0.7890,
      recall: 0.8100,
      f1Score: 0.7993,
      auc: 0.8567
    },
    notes: "Good performance. Feature importance shows contract type and tenure are key predictors.",
    tags: ["classification", "xgboost", "churn-prediction", "tabular-data"]
  },
  {
    experimentName: "LSTM Stock Price Prediction",
    description: "Time series forecasting using LSTM for stock price prediction",
    status: "completed",
    model: {
      name: "LSTM",
      type: "deep-learning",
      framework: "keras",
      version: "2.12.0"
    },
    dataset: {
      name: "S&P 500 Historical Data",
      size: 5000,
      trainSize: 4000,
      testSize: 1000,
      features: ["open", "high", "low", "close", "volume"],
      targetVariable: "next_day_close"
    },
    hyperparameters: new Map([
      ['lstm_units', 128],
      ['dropout', 0.2],
      ['lookback_window', 60],
      ['layers', 3]
    ]),
    trainingConfig: {
      epochs: 50,
      batchSize: 64,
      optimizer: "adam",
      learningRate: 0.001,
      earlyStopping: true,
      duration: 1800
    },
    metrics: {
      mse: 12.45,
      rmse: 3.53,
      mae: 2.67,
      r2Score: 0.8923
    },
    epochMetrics: [
      { epoch: 1, trainLoss: 45.2, valLoss: 43.1 },
      { epoch: 25, trainLoss: 18.3, valLoss: 20.5 },
      { epoch: 50, trainLoss: 12.1, valLoss: 13.2 }
    ],
    notes: "Decent predictions but high variance. Consider adding more features.",
    tags: ["time-series", "lstm", "stock-prediction", "regression"]
  },
  {
    experimentName: "Random Forest Diabetes Classification",
    description: "Binary classification for diabetes prediction using Random Forest",
    status: "completed",
    model: {
      name: "Random Forest",
      type: "classification",
      framework: "scikit-learn",
      version: "1.3.0"
    },
    dataset: {
      name: "Pima Indians Diabetes Database",
      size: 768,
      trainSize: 614,
      testSize: 154,
      features: ["glucose", "blood_pressure", "bmi", "age"],
      targetVariable: "diabetes"
    },
    hyperparameters: new Map([
      ['n_estimators', 100],
      ['max_depth', 10],
      ['min_samples_split', 5],
      ['min_samples_leaf', 2],
      ['max_features', 'sqrt']
    ]),
    trainingConfig: {
      epochs: 1,
      batchSize: 614,
      optimizer: "random-forest",
      learningRate: null,
      earlyStopping: false,
      duration: 30
    },
    metrics: {
      accuracy: 0.7792,
      precision: 0.7234,
      recall: 0.7012,
      f1Score: 0.7121,
      auc: 0.8234
    },
    notes: "Baseline model. Could benefit from feature engineering and hyperparameter tuning.",
    tags: ["classification", "random-forest", "healthcare", "diabetes"]
  },
  {
    experimentName: "U-Net Medical Image Segmentation",
    description: "Semantic segmentation of lung CT scans for disease detection",
    status: "running",
    model: {
      name: "U-Net",
      type: "computer-vision",
      framework: "pytorch",
      version: "2.0.0"
    },
    dataset: {
      name: "Lung CT Scan Dataset",
      size: 1200,
      trainSize: 960,
      testSize: 240,
      features: ["ct_scan_slices"],
      targetVariable: "segmentation_mask"
    },
    hyperparameters: new Map([
      ['learning_rate', 0.0001],
      ['depth', 5],
      ['initial_filters', 64],
      ['kernel_size', 3]
    ]),
    trainingConfig: {
      epochs: 200,
      batchSize: 8,
      optimizer: "adam",
      learningRate: 0.0001,
      earlyStopping: true
    },
    metrics: {},
    notes: "Training in progress. Using dice coefficient as loss function.",
    tags: ["segmentation", "unet", "medical-imaging", "ct-scans"]
  },
  {
    experimentName: "GPT-2 Text Generation Fine-tuning",
    description: "Fine-tuning GPT-2 on technical documentation for code generation",
    status: "failed",
    model: {
      name: "GPT-2 Medium",
      type: "nlp",
      framework: "pytorch",
      version: "2.0.0"
    },
    dataset: {
      name: "GitHub Code Documentation",
      size: 50000,
      trainSize: 45000,
      testSize: 5000,
      features: ["documentation_text"],
      targetVariable: "code_snippet"
    },
    hyperparameters: new Map([
      ['learning_rate', 0.00005],
      ['block_size', 1024],
      ['num_layers', 24]
    ]),
    trainingConfig: {
      epochs: 10,
      batchSize: 4,
      optimizer: "adamw",
      learningRate: 0.00005,
      earlyStopping: false,
      duration: 18000
    },
    metrics: {
      loss: 3.45,
      validationLoss: 3.89
    },
    notes: "Training failed due to GPU memory issues. Need to reduce batch size or model size.",
    tags: ["nlp", "gpt2", "text-generation", "code-generation"]
  },
  {
    experimentName: "Logistic Regression Baseline",
    description: "Simple baseline for binary classification task",
    status: "completed",
    model: {
      name: "Logistic Regression",
      type: "classification",
      framework: "scikit-learn",
      version: "1.3.0"
    },
    dataset: {
      name: "Credit Card Fraud Detection",
      size: 284807,
      trainSize: 227845,
      testSize: 56962,
      features: ["transaction_features"],
      targetVariable: "is_fraud"
    },
    hyperparameters: new Map([
      ['C', 1.0],
      ['penalty', 'l2'],
      ['solver', 'lbfgs'],
      ['max_iter', 1000]
    ]),
    trainingConfig: {
      epochs: 1,
      optimizer: "lbfgs",
      duration: 60
    },
    metrics: {
      accuracy: 0.9991,
      precision: 0.8732,
      recall: 0.6123,
      f1Score: 0.7195,
      auc: 0.9456
    },
    notes: "Good baseline but low recall. Class imbalance issue - need to try SMOTE or weighted classes.",
    tags: ["classification", "logistic-regression", "fraud-detection", "baseline"]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Experiment.deleteMany({});
    console.log('🗑️  Cleared existing experiments');

    // Insert sample data
    const inserted = await Experiment.insertMany(sampleExperiments);
    console.log(`✅ Inserted ${inserted.length} sample experiments`);

    console.log('\n📊 Sample Experiments:');
    inserted.forEach((exp, idx) => {
      console.log(`  ${idx + 1}. ${exp.experimentName} (${exp.status})`);
    });

    console.log('\n✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();