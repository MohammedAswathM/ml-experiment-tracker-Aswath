require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Experiment = require('./models/Experiment');
const aiService = require('./services/aiService');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== EXPERIMENT CRUD ROUTES ====================

// GET all experiments with filtering and sorting
app.get('/api/experiments', async (req, res) => {
  try {
    const { 
      status, 
      modelType, 
      sortBy = 'createdAt', 
      order = 'desc',
      limit = 100,
      search 
    } = req.query;

    let query = {};
    
    if (status) query.status = status;
    if (modelType) query['model.type'] = modelType;
    if (search) {
      query.$or = [
        { experimentName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const experiments = await Experiment.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: experiments.length,
      data: experiments
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching experiments',
      error: error.message 
    });
  }
});

// GET single experiment by ID
app.get('/api/experiments/:id', async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    
    if (!experiment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Experiment not found' 
      });
    }

    res.json({ success: true, data: experiment });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching experiment',
      error: error.message 
    });
  }
});

// CREATE new experiment
app.post('/api/experiments', async (req, res) => {
  try {
    const experiment = new Experiment(req.body);
    await experiment.save();

    // Generate AI insights asynchronously
    if (process.env.GEMINI_API_KEY) {
      const allExperiments = await Experiment.find({ 'model.type': experiment.model.type })
        .sort({ createdAt: -1 })
        .limit(10);
      
      const insights = await aiService.generateExperimentInsights(experiment, allExperiments);
      experiment.aiInsights = insights;
      
      // Check for anomalies
      const hasAnomalies = insights.anomalies && insights.anomalies.length > 0;
      experiment.hasAnomalies = hasAnomalies;
      
      await experiment.save();
    }

    res.status(201).json({ 
      success: true, 
      data: experiment,
      message: 'Experiment created successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating experiment',
      error: error.message 
    });
  }
});

// UPDATE experiment
app.put('/api/experiments/:id', async (req, res) => {
  try {
    const experiment = await Experiment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModified: Date.now() },
      { new: true, runValidators: true }
    );

    if (!experiment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Experiment not found' 
      });
    }

    res.json({ 
      success: true, 
      data: experiment,
      message: 'Experiment updated successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error updating experiment',
      error: error.message 
    });
  }
});

// DELETE experiment
app.delete('/api/experiments/:id', async (req, res) => {
  try {
    const experiment = await Experiment.findByIdAndDelete(req.params.id);
    
    if (!experiment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Experiment not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Experiment deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting experiment',
      error: error.message 
    });
  }
});

// ==================== AI-POWERED ROUTES ====================

// Generate insights for an experiment
app.post('/api/experiments/:id/insights', async (req, res) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Experiment not found' 
      });
    }

    const allExperiments = await Experiment.find({ 'model.type': experiment.model.type })
      .sort({ createdAt: -1 })
      .limit(10);

    const insights = await aiService.generateExperimentInsights(experiment, allExperiments);
    
    experiment.aiInsights = insights;
    experiment.hasAnomalies = insights.anomalies && insights.anomalies.length > 0;
    await experiment.save();

    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error generating insights',
      error: error.message 
    });
  }
});

// Natural language query
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query is required' 
      });
    }

    const experiments = await Experiment.find().limit(50);
    const answer = await aiService.processNaturalLanguageQuery(query, experiments);

    res.json({ success: true, data: { query, answer } });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error processing query',
      error: error.message 
    });
  }
});

// Get hyperparameter suggestions
app.post('/api/suggest-hyperparameters', async (req, res) => {
  try {
    const { modelType, dataset } = req.body;
    
    const previousExperiments = await Experiment.find({ 'model.type': modelType })
      .sort({ 'metrics.accuracy': -1 })
      .limit(10);

    const suggestions = await aiService.suggestHyperparameters(
      modelType, 
      dataset, 
      previousExperiments
    );

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error generating suggestions',
      error: error.message 
    });
  }
});

// Detect anomalies across all experiments
app.get('/api/anomalies', async (req, res) => {
  try {
    const experiments = await Experiment.find({ hasAnomalies: true })
      .sort({ createdAt: -1 })
      .limit(20);

    const anomalies = await aiService.detectAnomalies(experiments);

    res.json({ success: true, data: anomalies });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error detecting anomalies',
      error: error.message 
    });
  }
});

// Generate comparative report
app.post('/api/compare', async (req, res) => {
  try {
    const { experimentIds } = req.body;
    
    if (!experimentIds || experimentIds.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least 2 experiment IDs required' 
      });
    }

    const allExperiments = await Experiment.find();
    const report = await aiService.generateComparativeReport(experimentIds, allExperiments);

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error generating report',
      error: error.message 
    });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalExperiments = await Experiment.countDocuments();
    const completedExperiments = await Experiment.countDocuments({ status: 'completed' });
    const failedExperiments = await Experiment.countDocuments({ status: 'failed' });
    const runningExperiments = await Experiment.countDocuments({ status: 'running' });

    // Get best performing experiment
    const bestExperiment = await Experiment.findOne({ status: 'completed' })
      .sort({ 'metrics.accuracy': -1 })
      .limit(1);

    // Get experiments by model type
    const experimentsByType = await Experiment.aggregate([
      { $group: { _id: '$model.type', count: { $sum: 1 } } }
    ]);

    // Get average metrics
    const avgMetrics = await Experiment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$metrics.accuracy' },
          avgLoss: { $avg: '$metrics.loss' },
          avgF1Score: { $avg: '$metrics.f1Score' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalExperiments,
        completedExperiments,
        failedExperiments,
        runningExperiments,
        bestExperiment,
        experimentsByType,
        averageMetrics: avgMetrics[0] || {}
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
});

// Get metric trends over time
app.get('/api/trends', async (req, res) => {
  try {
    const { modelType, metric = 'accuracy', days = 30 } = req.query;
    
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    let query = { 
      createdAt: { $gte: dateFilter },
      status: 'completed'
    };
    
    if (modelType) query['model.type'] = modelType;

    const experiments = await Experiment.find(query)
      .sort({ createdAt: 1 })
      .select(`experimentName createdAt metrics.${metric} model.type`);

    res.json({ success: true, data: experiments });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching trends',
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date(),
    aiEnabled: !!process.env.GEMINI_API_KEY
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 AI Features: ${process.env.GEMINI_API_KEY ? 'ENABLED' : 'DISABLED'}`);
});