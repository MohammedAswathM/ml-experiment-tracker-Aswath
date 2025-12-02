import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { experimentAPI, aiAPI } from '../utils/api';

export default function ExperimentForm({ onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState(initialData || {
    experimentName: '',
    description: '',
    status: 'pending',
    model: {
      name: '',
      type: 'classification',
      framework: 'tensorflow',
      version: ''
    },
    dataset: {
      name: '',
      size: '',
      trainSize: '',
      testSize: '',
      features: [],
      targetVariable: ''
    },
    hyperparameters: {},
    trainingConfig: {
      epochs: '',
      batchSize: '',
      optimizer: 'adam',
      learningRate: ''
    },
    metrics: {},
    notes: '',
    tags: []
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleHyperparameterChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      hyperparameters: {
        ...prev.hyperparameters,
        [key]: isNaN(value) ? value : parseFloat(value)
      }
    }));
  };

  const handleMetricChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [key]: parseFloat(value)
      }
    }));
  };

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.suggestHyperparameters({
        modelType: formData.model.type,
        dataset: formData.dataset
      });
      setSuggestions(response.data.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      alert('Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestions = () => {
    if (!suggestions) return;
    
    setFormData(prev => ({
      ...prev,
      trainingConfig: {
        ...prev.trainingConfig,
        epochs: suggestions.epochs || prev.trainingConfig.epochs,
        batchSize: suggestions.batchSize || prev.trainingConfig.batchSize,
        optimizer: suggestions.optimizer || prev.trainingConfig.optimizer,
        learningRate: suggestions.learningRate || prev.trainingConfig.learningRate
      }
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert hyperparameters object to Map format for MongoDB
    const dataToSubmit = {
      ...formData,
      hyperparameters: new Map(Object.entries(formData.hyperparameters)),
      dataset: {
        ...formData.dataset,
        size: parseInt(formData.dataset.size) || 0,
        trainSize: parseInt(formData.dataset.trainSize) || 0,
        testSize: parseInt(formData.dataset.testSize) || 0,
      },
      trainingConfig: {
        ...formData.trainingConfig,
        epochs: parseInt(formData.trainingConfig.epochs) || 0,
        batchSize: parseInt(formData.trainingConfig.batchSize) || 0,
        learningRate: parseFloat(formData.trainingConfig.learningRate) || 0,
      }
    };
    
    onSubmit(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Experiment' : 'New Experiment'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experiment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.experimentName}
                  onChange={(e) => setFormData({...formData, experimentName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ResNet50 Image Classification v1"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the experiment objectives and approach..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </section>

          {/* Model Configuration */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Model Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={formData.model.name}
                  onChange={(e) => handleChange('model', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ResNet50, BERT, XGBoost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Type *</label>
                <select
                  value={formData.model.type}
                  onChange={(e) => handleChange('model', 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="classification">Classification</option>
                  <option value="regression">Regression</option>
                  <option value="clustering">Clustering</option>
                  <option value="deep-learning">Deep Learning</option>
                  <option value="nlp">NLP</option>
                  <option value="computer-vision">Computer Vision</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
                <select
                  value={formData.model.framework}
                  onChange={(e) => handleChange('model', 'framework', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="tensorflow">TensorFlow</option>
                  <option value="pytorch">PyTorch</option>
                  <option value="scikit-learn">Scikit-learn</option>
                  <option value="keras">Keras</option>
                  <option value="xgboost">XGBoost</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  value={formData.model.version}
                  onChange={(e) => handleChange('model', 'version', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2.0.0"
                />
              </div>
            </div>
          </section>

          {/* Dataset Info */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Dataset Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dataset Name *</label>
                <input
                  type="text"
                  required
                  value={formData.dataset.name}
                  onChange={(e) => handleChange('dataset', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CIFAR-10, Custom Dataset"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Size</label>
                <input
                  type="number"
                  value={formData.dataset.size}
                  onChange={(e) => handleChange('dataset', 'size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of samples"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Train Size</label>
                <input
                  type="number"
                  value={formData.dataset.trainSize}
                  onChange={(e) => handleChange('dataset', 'trainSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Size</label>
                <input
                  type="number"
                  value={formData.dataset.testSize}
                  onChange={(e) => handleChange('dataset', 'testSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Training Config with AI Suggestions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Training Configuration</h3>
              <button
                type="button"
                onClick={getSuggestions}
                disabled={loading || !formData.model.type || !formData.dataset.name}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Getting AI Suggestions...' : 'Get AI Suggestions'}
              </button>
            </div>
            
            {showSuggestions && suggestions && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">AI Recommended Settings:</h4>
                <div className="text-sm space-y-1 text-purple-800">
                  <p>• Learning Rate: {suggestions.learningRate}</p>
                  <p>• Batch Size: {suggestions.batchSize}</p>
                  <p>• Epochs: {suggestions.epochs}</p>
                  <p>• Optimizer: {suggestions.optimizer}</p>
                  {suggestions.reasoning && (
                    <p className="mt-2 italic">Reasoning: {suggestions.reasoning}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={applySuggestions}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Apply Suggestions
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Epochs</label>
                <input
                  type="number"
                  value={formData.trainingConfig.epochs}
                  onChange={(e) => handleChange('trainingConfig', 'epochs', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
                <input
                  type="number"
                  value={formData.trainingConfig.batchSize}
                  onChange={(e) => handleChange('trainingConfig', 'batchSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Optimizer</label>
                <select
                  value={formData.trainingConfig.optimizer}
                  onChange={(e) => handleChange('trainingConfig', 'optimizer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                  <option value="rmsprop">RMSprop</option>
                  <option value="adagrad">Adagrad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.trainingConfig.learningRate}
                  onChange={(e) => handleChange('trainingConfig', 'learningRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 0.001"
                />
              </div>
            </div>
          </section>

          {/* Metrics */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              {['accuracy', 'precision', 'recall', 'f1Score', 'loss', 'validationLoss'].map(metric => (
                <div key={metric}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.metrics[metric] || ''}
                    onChange={(e) => handleMetricChange(metric, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Research Notes</h3>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Document observations, challenges, ideas for future experiments..."
            />
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {initialData ? 'Update Experiment' : 'Create Experiment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}