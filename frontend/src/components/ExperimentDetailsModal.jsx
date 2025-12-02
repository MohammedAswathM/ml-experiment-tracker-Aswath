import { useState } from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, Copy, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ExperimentDetails({ experiment, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'config', label: 'Configuration' },
    { id: 'insights', label: 'AI Insights' },
    { id: 'trends', label: 'Training Trends' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{experiment.experimentName}</h2>
              <p className="text-blue-100 text-sm">{experiment.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  {experiment.model.name}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full capitalize">
                  {experiment.model.type.replace('-', ' ')}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full capitalize">
                  {experiment.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex gap-1 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.id === 'insights' && experiment.aiInsights && (
                  <Sparkles className="inline w-4 h-4 ml-1 text-purple-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-1">Accuracy</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {experiment.metrics.accuracy 
                      ? `${(experiment.metrics.accuracy * 100).toFixed(2)}%`
                      : 'N/A'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-1">Loss</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {experiment.metrics.loss?.toFixed(4) || 'N/A'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium mb-1">F1 Score</div>
                  <div className="text-2xl font-bold text-green-900">
                    {experiment.metrics.f1Score?.toFixed(4) || 'N/A'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium mb-1">Epochs</div>
                  <div className="text-2xl font-bold text-orange-900">
                    {experiment.trainingConfig?.epochs || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Dataset Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Dataset Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Dataset:</span>
                    <span className="ml-2 font-medium text-gray-900">{experiment.dataset.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Size:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {experiment.dataset.size?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {experiment.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Research Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{experiment.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="text-center py-12 text-gray-500">
              Metrics view - Display all metrics here
            </div>
          )}

          {activeTab === 'config' && (
            <div className="text-center py-12 text-gray-500">
              Configuration view - Display config here
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {experiment.aiInsights ? (
                <>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">AI Summary</h3>
                    </div>
                    <p className="text-gray-700">{experiment.aiInsights.summary}</p>
                  </div>

                  {experiment.aiInsights.recommendations?.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Recommendations</h3>
                      </div>
                      <ul className="space-y-2">
                        {experiment.aiInsights.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-600 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No AI insights generated yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="text-center py-12 text-gray-500">
              Training trends - Display charts here
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Created: {new Date(experiment.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}