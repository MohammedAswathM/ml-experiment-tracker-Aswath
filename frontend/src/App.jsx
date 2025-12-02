import { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare,
  BarChart3,
  Sparkles
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
        alert('Experiment created successfully! AI insights are being generated...');
      } else {
        alert('Failed to create experiment: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating experiment:', error);
      alert('Failed to create experiment. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ML Experiment Tracker</h1>
                <p className="text-sm text-gray-600">AI-Powered Research & Development Platform</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              New Experiment
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'experiments', label: 'Experiments', icon: FlaskConical },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'ai-chat', label: 'AI Assistant', icon: MessageSquare, badge: true }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition relative ${
                    activeView === tab.id
                      ? 'border-blue-600 text-blue-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Experiments</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalExperiments}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="text-lg font-bold text-gray-900">{stats.completedExperiments}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Best Accuracy</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.bestExperiment?.metrics?.accuracy 
                      ? `${(stats.bestExperiment.metrics.accuracy * 100).toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Failed</p>
                  <p className="text-lg font-bold text-gray-900">{stats.failedExperiments}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeView === 'experiments' && (
          <ExperimentTable
            experiments={experiments}
            loading={loading}
            onUpdate={handleUpdateExperiment}
            onDelete={handleDeleteExperiment}
            onRefresh={fetchExperiments}
          />
        )}
        
        {activeView === 'dashboard' && (
          <Dashboard stats={stats} experiments={experiments} />
        )}
        
        {activeView === 'trends' && (
          <TrendAnalysis experiments={experiments} />
        )}
        
        {activeView === 'ai-chat' && (
          <AIChat experiments={experiments} />
        )}
      </main>

      {/* Experiment Form Modal */}
      {showForm && (
        <ExperimentForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateExperiment}
        />
      )}
    </div>
  );
}

export default App;