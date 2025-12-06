import { useState } from 'react';
import { 
  X, Sparkles, TrendingUp, AlertTriangle, Brain, Rocket, Clock, Calendar, Activity
} from 'lucide-react';

export default function ExperimentDetailsModal({ experiment, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'insights', label: 'AI Insights', icon: Sparkles }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-modal-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-8 py-6 flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative flex items-start justify-between z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
                  {experiment.model?.type || 'Unknown'}
                </span>
              </div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">{experiment.experimentName}</h2>
              <p className="text-purple-100 text-lg opacity-90 max-w-2xl">{experiment.description}</p>
              
              <div className="flex items-center gap-4 mt-4 text-sm font-medium text-purple-100">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  {experiment.model?.name} v{experiment.model?.version || '1.0'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(experiment.createdAt).toLocaleDateString()}
                </div>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white text-purple-600 shadow-sm capitalize">
                  {experiment.status}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 bg-white px-8 pt-4 flex-shrink-0">
          <div className="flex gap-4">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200 transform scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 scroll-smooth">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Accuracy', value: experiment.metrics?.accuracy, format: v => `${(v * 100).toFixed(2)}%`, color: 'blue' },
                  { label: 'Loss', value: experiment.metrics?.loss, format: v => v.toFixed(4), color: 'purple' },
                  { label: 'F1 Score', value: experiment.metrics?.f1Score, format: v => v.toFixed(4), color: 'green' },
                  { label: 'Epochs', value: experiment.trainingConfig?.epochs, format: v => v, color: 'orange' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className={`text-sm font-semibold text-${stat.color}-600 mb-1 uppercase tracking-wider`}>{stat.label}</div>
                    <div className="text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform origin-left">
                      {stat.value ? stat.format(stat.value) : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dataset & Tech Stack */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" /> Dataset Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600">Name</span>
                      <span className="font-bold text-gray-900">{experiment.dataset?.name || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl text-center">
                        <div className="text-xs text-gray-500 uppercase">Total</div>
                        <div className="font-bold text-gray-900">{experiment.dataset?.size?.toLocaleString() || '-'}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl text-center">
                        <div className="text-xs text-gray-500 uppercase">Train</div>
                        <div className="font-bold text-gray-900">{experiment.dataset?.trainSize?.toLocaleString() || '-'}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl text-center">
                        <div className="text-xs text-gray-500 uppercase">Test</div>
                        <div className="font-bold text-gray-900">{experiment.dataset?.testSize?.toLocaleString() || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-pink-600" /> Framework & Tools
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="text-sm text-blue-600 font-bold mb-1">Framework</div>
                      <div className="text-lg font-black text-gray-900 capitalize">{experiment.model?.framework || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="text-sm text-purple-600 font-bold mb-1">Optimizer</div>
                      <div className="text-lg font-black text-gray-900 capitalize">{experiment.trainingConfig?.optimizer || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {experiment.notes && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                  <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Research Notes
                  </h3>
                  <p className="text-yellow-900/80 leading-relaxed font-medium">
                    {experiment.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6 animate-slide-in-right">
              {experiment.aiInsights ? (
                <>
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                          <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold">AI Analysis Summary</h3>
                      </div>
                      <p className="text-purple-50 text-lg leading-relaxed font-medium">
                        {experiment.aiInsights.summary}
                      </p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {experiment.aiInsights.recommendations?.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" /> Key Recommendations
                        </h3>
                        <ul className="space-y-3">
                          {experiment.aiInsights.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex gap-3 text-green-800">
                              <span className="w-6 h-6 rounded-full bg-green-200 text-green-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-medium">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {experiment.aiInsights.anomalies?.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" /> Detected Anomalies
                        </h3>
                        <ul className="space-y-3">
                          {experiment.aiInsights.anomalies.map((anomaly, idx) => (
                            <li key={idx} className="flex gap-3 text-red-800 bg-red-100/50 p-3 rounded-xl">
                              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                              <span className="font-medium">{anomaly}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                  <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No AI insights generated yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}