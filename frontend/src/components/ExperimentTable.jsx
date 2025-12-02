import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Eye, 
  Sparkles, 
  Filter,
  Search, 
  Download, 
  RefreshCw 
} from 'lucide-react';
// UPDATED IMPORT: Pointing to the new file name we created
import ExperimentDetails from './ExperimentDetailsModal';

export default function ExperimentTable({ 
  experiments, 
  loading, 
  onUpdate, 
  onDelete, 
  onRefresh 
}) {
  const [selectedExperiment, setSelectedExperiment] = useState(null);
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
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Model', 'Type', 'Status', 'Accuracy', 'Loss', 'Date'];
    const rows = filteredAndSortedExperiments.map(exp => [
      exp.experimentName,
      exp.model.name,
      exp.model.type,
      exp.status,
      exp.metrics?.accuracy || '', // SAFE ACCESS
      exp.metrics?.loss || '',     // SAFE ACCESS
      new Date(exp.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiments_${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Toolbar */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedExperiments.length} of {experiments.length} experiments
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
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
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => key !== 'actions' && handleSort(key)}
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {sortConfig.key === key && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedExperiments.map((exp) => (
              <tr key={exp._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">{exp.experimentName}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {exp.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{exp.model.name}</div>
                  <div className="text-xs text-gray-500">{exp.model.framework}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700 capitalize">
                    {exp.model.type.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(exp.status)}`}>
                    {exp.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {/* CRITICAL FIX: Safe access for accuracy */}
                      {exp.metrics?.accuracy 
                        ? `${(exp.metrics.accuracy * 100).toFixed(2)}%` 
                        : 'N/A'}
                    </span>
                    {exp.aiInsights && (
                      <Sparkles className="w-4 h-4 text-purple-500" title="AI Insights Available" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {/* CRITICAL FIX: Safe access for loss */}
                  {exp.metrics?.loss ? exp.metrics.loss.toFixed(4) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(exp.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedExperiment(exp)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(exp._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedExperiments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No experiments found. Create your first experiment to get started!
        </div>
      )}

      {/* Details Modal */}
      {selectedExperiment && (
        <ExperimentDetails
          experiment={selectedExperiment}
          onClose={() => setSelectedExperiment(null)}
        />
      )}
    </div>
  );
}