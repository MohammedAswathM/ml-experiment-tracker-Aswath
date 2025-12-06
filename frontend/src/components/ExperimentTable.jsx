import { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Trash2, Eye, Sparkles, Filter, Search, Download, RefreshCw, TrendingUp, Brain 
} from 'lucide-react';
import ExperimentDetailsModal from './ExperimentDetailsModal'; // Ensure this matches your file name

export default function ExperimentTable({ 
  experiments, loading, onUpdate, onDelete, onRefresh 
}) {
  const [viewExperiment, setViewExperiment] = useState(null); // State for the View Modal
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredAndSortedExperiments = experiments
    .filter(exp => {
      if (filterStatus !== 'all' && exp.status !== filterStatus) return false;
      if (searchQuery && !exp.experimentName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = sortConfig.key.includes('.') 
        ? sortConfig.key.split('.').reduce((obj, key) => obj?.[key], a)
        : a[sortConfig.key];
      const bVal = sortConfig.key.includes('.') 
        ? sortConfig.key.split('.').reduce((obj, key) => obj?.[key], b)
        : b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusBadge = (status) => {
    const styles = {
      completed: { bg: 'from-green-500 to-emerald-500', text: 'text-white', icon: '✓' },
      running: { bg: 'from-blue-500 to-cyan-500', text: 'text-white', icon: '⚡' },
      failed: { bg: 'from-red-500 to-pink-500', text: 'text-white', icon: '✗' },
      pending: { bg: 'from-yellow-500 to-orange-500', text: 'text-white', icon: '◷' }
    };
    return styles[status] || styles.pending;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Model', 'Type', 'Status', 'Accuracy', 'Loss', 'Date'];
    const rows = filteredAndSortedExperiments.map(exp => [
      exp.experimentName,
      exp.model?.name || '',
      exp.model?.type || '',
      exp.status,
      exp.metrics?.accuracy || '',
      exp.metrics?.loss || '',
      new Date(exp.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiments_${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-xl p-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Brain className="absolute inset-0 m-auto w-10 h-10 text-purple-600 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading experiments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-xl">
      {/* Toolbar */}
      <div className="p-6 border-b border-gray-200/50 space-y-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-5 h-5 transition-colors" />
              <input
                type="text"
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-80 transition-all font-medium"
              />
            </div>
            
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 w-5 h-5 transition-colors" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none cursor-pointer transition-all font-medium"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="p-3 text-gray-600 hover:text-purple-600 bg-white/80 backdrop-blur-sm rounded-xl transition-all hover:shadow-lg transform hover:scale-105 group" title="Refresh">
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-5 py-3 text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all hover:shadow-lg transform hover:scale-105 font-medium">
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
            <tr>
              {[
                { key: 'experimentName', label: 'Experiment Name' },
                { key: 'model.name', label: 'Model' },
                { key: 'model.type', label: 'Type' },
                { key: 'status', label: 'Status' },
                { key: 'metrics.accuracy', label: 'Accuracy' },
                { key: 'metrics.loss', label: 'Loss' },
                { key: 'createdAt', label: 'Date' },
                { key: 'actions', label: 'Actions' }
              ].map(({ key, label }) => (
                <th key={key} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-colors group" onClick={() => key !== 'actions' && handleSort(key)}>
                  <div className="flex items-center gap-2">
                    {label}
                    {sortConfig.key === key && key !== 'actions' && (
                      <span className="text-purple-600">
                        {sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
            {filteredAndSortedExperiments.map((exp, idx) => {
              const statusStyle = getStatusBadge(exp.status);
              return (
                <tr key={exp._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{exp.experimentName}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs mt-1">{exp.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exp.model?.name || '-'}</div>
                        <div className="text-xs text-gray-500 capitalize">{exp.model?.framework || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 capitalize">
                      {exp.model?.type?.replace('-', ' ') || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${statusStyle.bg} ${statusStyle.text} shadow-md`}>
                      <span>{statusStyle.icon}</span>
                      <span className="capitalize">{exp.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {exp.metrics?.accuracy ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-bold text-gray-900">{(exp.metrics.accuracy * 100).toFixed(2)}%</span>
                        </>
                      ) : (<span className="text-sm text-gray-400">N/A</span>)}
                      {exp.aiInsights && <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{exp.metrics?.loss ? exp.metrics.loss.toFixed(4) : 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{new Date(exp.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* FIX: Set viewExperiment on click */}
                      <button onClick={() => setViewExperiment(exp)} className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all transform hover:scale-110" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Note: Edit button logic handles updating via parent */}
                      <button onClick={() => onDelete(exp._id)} className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all transform hover:scale-110" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {viewExperiment && (
        <ExperimentDetailsModal 
          experiment={viewExperiment} 
          onClose={() => setViewExperiment(null)} 
        />
      )}
    </div>
  );
}