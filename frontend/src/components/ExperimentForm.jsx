import { useState } from 'react';
import { X, Sparkles, Brain, Zap, Rocket, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ExperimentForm({ onClose, onSubmit, initialData = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState(initialData ? {
    ...initialData,
    metrics: {
      accuracy: initialData.metrics?.accuracy?.toString() || '',
      loss: initialData.metrics?.loss?.toString() || '',
      precision: initialData.metrics?.precision?.toString() || '',
      recall: initialData.metrics?.recall?.toString() || '',
      f1Score: initialData.metrics?.f1Score?.toString() || '',
      validationLoss: initialData.metrics?.validationLoss?.toString() || ''
    }
  } : {
    experimentName: '',
    description: '',
    status: 'pending',
    model: { name: '', type: 'classification', framework: 'tensorflow', version: '' },
    dataset: { name: '', size: '', trainSize: '', testSize: '', features: [], targetVariable: '' },
    hyperparameters: {},
    trainingConfig: { epochs: '', batchSize: '', optimizer: 'adam', learningRate: '' },
    metrics: { accuracy: '', precision: '', recall: '', f1Score: '', loss: '', validationLoss: '' },
    notes: '',
    tags: []
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const steps = [
    { number: 1, title: 'Basic Info', icon: Brain },
    { number: 2, title: 'Model & Dataset', icon: Zap },
    { number: 3, title: 'Training Config', icon: Rocket },
    { number: 4, title: 'Metrics & Notes', icon: Sparkles }
  ];

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleNumberInput = (section, field, value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    }
  };

  const getSuggestions = async () => {
    setAiLoading(true);
    try {
      const response = await fetch(`${API_URL}/suggest-hyperparameters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelType: formData.model.type, dataset: formData.dataset })
      });
      const data = await response.json();
      setSuggestions(data.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestions = () => {
    if (!suggestions) return;
    setFormData(prev => ({
      ...prev,
      trainingConfig: {
        ...prev.trainingConfig,
        epochs: suggestions.epochs?.toString(),
        batchSize: suggestions.batchSize?.toString(),
        optimizer: suggestions.optimizer,
        learningRate: suggestions.learningRate?.toString()
      }
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    
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
      },
      metrics: {
        accuracy: parseFloat(formData.metrics.accuracy) || 0,
        loss: parseFloat(formData.metrics.loss) || 0,
        precision: parseFloat(formData.metrics.precision) || 0,
        recall: parseFloat(formData.metrics.recall) || 0,
        f1Score: parseFloat(formData.metrics.f1Score) || 0,
        validationLoss: parseFloat(formData.metrics.validationLoss) || 0,
      }
    };
    
    await onSubmit(dataToSubmit);
    setSubmitting(false);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.experimentName.trim()) return "Experiment Name is required";
        if (!formData.description.trim()) return "Description is required";
        return true;
      case 2:
        if (!formData.model.name.trim()) return "Model Name is required";
        if (!formData.dataset.name.trim()) return "Dataset Name is required";
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    const isValid = validateStep(currentStep);
    if (isValid === true) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      alert(isValid);
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-modal-fade-in">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {submitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-bold text-purple-900 animate-pulse">Creating Experiment & Generating Insights...</p>
          </div>
        )}

        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-6 py-5 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
              <Brain className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {initialData ? 'Edit Experiment' : 'Create New Experiment'}
              </h2>
              <p className="text-purple-100 text-sm font-medium">
                Step {currentStep} of 4 • {steps[currentStep - 1].title}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all transform hover:scale-110">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 pb-24">
          
          {currentStep === 1 && (
            <div className="space-y-6 animate-slide-in-right">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Experiment Name *</label>
                    <input
                      type="text"
                      value={formData.experimentName}
                      onChange={(e) => setFormData({...formData, experimentName: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                      placeholder="e.g., ResNet50 Image Classification v1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium resize-none"
                      placeholder="Briefly describe the goal of this experiment..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    >
                      <option value="pending">🟡 Pending</option>
                      <option value="running">🔵 Running</option>
                      <option value="completed">🟢 Completed</option>
                      <option value="failed">🔴 Failed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-slide-in-right">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Model Name *</label>
                    <input 
                      type="text" 
                      value={formData.model.name} 
                      onChange={(e) => handleChange('model', 'name', e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-medium"
                      placeholder="e.g. YOLOv8" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Model Type *</label>
                    <select value={formData.model.type} onChange={(e) => handleChange('model', 'type', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-medium">
                      <option value="classification">Classification</option>
                      <option value="regression">Regression</option>
                      <option value="clustering">Clustering</option>
                      <option value="nlp">NLP</option>
                      <option value="computer-vision">Computer Vision</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Framework</label>
                    <select value={formData.model.framework} onChange={(e) => handleChange('model', 'framework', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-medium">
                      <option value="tensorflow">TensorFlow</option>
                      <option value="pytorch">PyTorch</option>
                      <option value="scikit-learn">Scikit-learn</option>
                      <option value="keras">Keras</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Version</label>
                    <input 
                      type="text" 
                      value={formData.model.version} 
                      onChange={(e) => handleChange('model', 'version', e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-medium"
                      placeholder="e.g. 1.2.0" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Dataset Section - Fixed Layout & Added Test Size */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Dataset Name *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.dataset.name} 
                      onChange={(e) => handleChange('dataset', 'name', e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 bg-white font-medium"
                      placeholder="e.g. COCO 2017" 
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Total Size</label>
                      <input 
                        type="text" 
                        value={formData.dataset.size} 
                        onChange={(e) => handleNumberInput('dataset', 'size', e.target.value)} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 bg-white font-medium"
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Train Size</label>
                      <input 
                        type="text" 
                        value={formData.dataset.trainSize} 
                        onChange={(e) => handleNumberInput('dataset', 'trainSize', e.target.value)} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 bg-white font-medium"
                        placeholder="8000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Test Size</label>
                      <input 
                        type="text" 
                        value={formData.dataset.testSize} 
                        onChange={(e) => handleNumberInput('dataset', 'testSize', e.target.value)} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 bg-white font-medium"
                        placeholder="2000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-slide-in-right">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Training Configuration</h3>
                  <button type="button" onClick={getSuggestions} disabled={aiLoading || !formData.model.type} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm">
                    <Sparkles className="w-4 h-4" /> {aiLoading ? 'Thinking...' : 'AI Suggest'}
                  </button>
                </div>
                
                {showSuggestions && suggestions && (
                  <div className="mb-6 p-4 bg-white rounded-xl border border-purple-200 shadow-md animate-slide-in-left">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-purple-800">AI Recommendation</h4>
                      <button type="button" onClick={applySuggestions} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold hover:bg-purple-200">Apply All</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>LR: <span className="font-bold">{suggestions.learningRate}</span></div>
                      <div>Batch: <span className="font-bold">{suggestions.batchSize}</span></div>
                      <div>Optimizer: <span className="font-bold">{suggestions.optimizer}</span></div>
                      <div>Epochs: <span className="font-bold">{suggestions.epochs}</span></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Epochs</label>
                    <input 
                      type="text" 
                      value={formData.trainingConfig.epochs} 
                      onChange={(e) => handleNumberInput('trainingConfig', 'epochs', e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white font-medium" 
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Batch Size</label>
                    <input 
                      type="text" 
                      value={formData.trainingConfig.batchSize} 
                      onChange={(e) => handleNumberInput('trainingConfig', 'batchSize', e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white font-medium" 
                      placeholder="e.g. 32"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Optimizer</label>
                    <select value={formData.trainingConfig.optimizer} onChange={(e) => handleChange('trainingConfig', 'optimizer', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white font-medium">
                      <option value="adam">Adam</option>
                      <option value="sgd">SGD</option>
                      <option value="rmsprop">RMSprop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Learning Rate</label>
                    <input 
                      type="text" 
                      value={formData.trainingConfig.learningRate} 
                      onChange={(e) => handleNumberInput('trainingConfig', 'learningRate', e.target.value)} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white font-medium" 
                      placeholder="0.001" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-slide-in-right">
              {/* Metrics & Notes */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['accuracy', 'precision', 'recall', 'f1Score', 'loss', 'validationLoss'].map(metric => (
                    <div key={metric}>
                      <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <input 
                        type="text"
                        value={formData.metrics[metric]} 
                        onChange={(e) => handleNumberInput('metrics', metric, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Research Notes</label>
                <textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  rows={4} 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white font-medium resize-none" 
                  placeholder="Any observations?"
                />
              </div>
            </div>
          )}
        </form>

        <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 p-4 flex justify-between z-20 shrink-0">
          <button type="button" onClick={currentStep === 1 ? onClose : prevStep} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50">
            {currentStep === 1 ? 'Cancel' : '← Back'}
          </button>
          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">
              Next Step →
            </button>
          ) : (
            <button type="submit" onClick={handleSubmit} disabled={submitting} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center gap-2">
              {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {initialData ? 'Update' : 'Create Experiment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}