import { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare,
  BarChart3,
  Sparkles,
  Zap,
  Brain,
  Rocket
} from 'lucide-react';
import ExperimentTable from './components/ExperimentTable';
import ExperimentForm from './components/ExperimentForm';
import Dashboard from './components/Dashboard';
import TrendAnalysis from './components/TrendAnalysis';
import AIChat from './components/AIChat';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [experiments, setExperiments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('experiments');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchExperiments();
    fetchStats();
  }, []);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/experiments`);
      const data = await response.json();
      if (data.success) {
        setExperiments(data.data);
      }
    } catch (error) {
      console.error('Error fetching experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateExperiment = async (experimentData) => {
    try {
      const response = await fetch(`${API_URL}/experiments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experimentData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchExperiments();
        await fetchStats();
        setShowForm(false);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in-right';
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <div class="font-bold">Success!</div>
              <div class="text-sm opacity-90">Experiment created with AI insights</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
      }
    } catch (error) {
      console.error('Error creating experiment:', error);
    }
  };

  const handleUpdateExperiment = async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/experiments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        await fetchExperiments();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error updating experiment:', error);
    }
  };

  const handleDeleteExperiment = async (id) => {
    if (!confirm('Are you sure you want to delete this experiment?')) return;
    
    try {
      const response = await fetch(`${API_URL}/experiments/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchExperiments();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error deleting experiment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Glass Effect */}
      <header className="relative backdrop-blur-md bg-white/70 shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
                <div className="relative p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl transform group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-7 h-7 text-white animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  ML Experiment Tracker
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Brain className="w-4 h-4 text-purple-500" />
                    AI-Powered Research Platform
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full animate-pulse">
                    Live
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Experiment
                <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs with Modern Design */}
      <nav className="relative backdrop-blur-md bg-white/60 border-b border-white/20 sticky top-[88px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'experiments', label: 'Experiments', icon: FlaskConical, color: 'from-blue-500 to-cyan-500' },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
              { id: 'trends', label: 'Trends', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
              { id: 'ai-chat', label: 'AI Assistant', icon: MessageSquare, color: 'from-green-500 to-emerald-500', badge: true }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`relative group flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <span className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-t-2xl shadow-lg`}></span>
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`} />
                    {tab.label}
                    {tab.badge && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    )}
                  </span>
                  {!isActive && (
                    <span className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${tab.color} group-hover:w-full transition-all duration-300`}></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Animated Stats Bar */}
      {stats && (
        <div className="relative backdrop-blur-md bg-white/60 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              {[
                { 
                  icon: FlaskConical, 
                  label: 'Total Experiments', 
                  value: stats.totalExperiments, 
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50'
                },
                { 
                  icon: TrendingUp, 
                  label: 'Completed', 
                  value: stats.completedExperiments, 
                  color: 'from-green-500 to-emerald-500',
                  bgColor: 'from-green-50 to-emerald-50'
                },
                { 
                  icon: Sparkles, 
                  label: 'Best Accuracy', 
                  value: stats.bestExperiment?.metrics?.accuracy 
                    ? `${(stats.bestExperiment.metrics.accuracy * 100).toFixed(1)}%`
                    : 'N/A',
                  color: 'from-yellow-500 to-orange-500',
                  bgColor: 'from-yellow-50 to-orange-50'
                },
                { 
                  icon: AlertTriangle, 
                  label: 'Failed', 
                  value: stats.failedExperiments, 
                  color: 'from-red-500 to-pink-500',
                  bgColor: 'from-red-50 to-pink-50'
                }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-xl shadow-md transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    </div>
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Smooth Transitions */}
      <main className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {activeView === 'experiments' && (
            <div className="transform transition-all duration-500">
              <ExperimentTable
                experiments={experiments}
                loading={loading}
                onUpdate={handleUpdateExperiment}
                onDelete={handleDeleteExperiment}
                onRefresh={fetchExperiments}
              />
            </div>
          )}
          
          {activeView === 'dashboard' && (
            <div className="transform transition-all duration-500">
              <Dashboard stats={stats} experiments={experiments} />
            </div>
          )}
          
          {activeView === 'trends' && (
            <div className="transform transition-all duration-500">
              <TrendAnalysis experiments={experiments} />
            </div>
          )}
          
          {activeView === 'ai-chat' && (
            <div className="transform transition-all duration-500">
              <AIChat experiments={experiments} />
            </div>
          )}
        </div>
      </main>

      {/* Experiment Form Modal with Enhanced Animation */}
      {showForm && (
        <div className="animate-modal-fade-in">
          <ExperimentForm
            onClose={() => setShowForm(false)}
            onSubmit={handleCreateExperiment}
          />
        </div>
      )}

      {/* Floating Action Button for Quick Add */}
      <button
        onClick={() => setActiveView('ai-chat')}
        className="fixed bottom-8 right-8 group p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-pink-500/50 transform hover:scale-110 transition-all duration-300 z-30"
      >
        <Rocket className="w-6 h-6 text-white group-hover:animate-bounce" />
        <span className="absolute -top-2 -right-2 flex h-6 w-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-6 w-6 bg-pink-500 items-center justify-center text-xs text-white font-bold">
            AI
          </span>
        </span>
      </button>
    </div>
  );
}

export default App;