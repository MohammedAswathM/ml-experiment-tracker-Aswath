import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, AlertCircle, Clock } from 'lucide-react';

export default function Dashboard({ stats, experiments }) {
  // 1. Loading State
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Prepare data for Model Types Pie Chart
  const modelTypeData = stats.experimentsByType?.map(item => ({
    name: item._id?.replace('-', ' ').toUpperCase() || 'Unknown',
    value: item.count
  })) || [];

  // 3. Prepare Recent Experiments (Safe Sort)
  const recentExperiments = experiments
    .filter(exp => exp.status === 'completed')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .reverse();

  // 4. CRITICAL FIX: Trend Data
  // We filter out experiments that don't have accuracy to prevent "toFixed" crashes
  const accuracyTrendData = recentExperiments
    .filter(exp => exp.metrics?.accuracy !== undefined) // Only show if accuracy exists
    .map(exp => ({
      name: exp.experimentName.substring(0, 15) + '...',
      accuracy: (exp.metrics.accuracy * 100).toFixed(2),
      loss: exp.metrics.loss?.toFixed(4) || 0
    }));

  // 5. Status Data for Pie Chart
  const statusData = [
    { name: 'Completed', value: stats.completedExperiments, color: '#10b981' },
    { name: 'Running', value: stats.runningExperiments, color: '#3b82f6' },
    { name: 'Failed', value: stats.failedExperiments, color: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.totalExperiments}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Experiments</h3>
          <p className="text-xs mt-1 opacity-75">All time</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">
              {/* Safe Access for Best Accuracy */}
              {stats.bestExperiment?.metrics?.accuracy 
                ? `${(stats.bestExperiment.metrics.accuracy * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Best Accuracy</h3>
          <p className="text-xs mt-1 opacity-75 truncate">
            {stats.bestExperiment?.experimentName || 'No data'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">
               {/* Safe Access for Average Accuracy */}
              {stats.averageMetrics?.avgAccuracy 
                ? `${(stats.averageMetrics.avgAccuracy * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Avg Accuracy</h3>
          <p className="text-xs mt-1 opacity-75">Across all models</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.failedExperiments}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Failed Experiments</h3>
          <p className="text-xs mt-1 opacity-75">Need attention</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experiments by Type */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiments by Model Type</h3>
          {modelTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modelTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modelTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiment Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Accuracy Trend */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Experiment Performance</h3>
        {accuracyTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={accuracyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy (%)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No completed experiments with accuracy data yet
          </div>
        )}
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Performing Experiments</h3>
        <div className="space-y-3">
          {experiments
            // CRITICAL FIX: Safe filtering to prevent crash on missing metrics
            .filter(exp => exp.status === 'completed' && exp.metrics?.accuracy !== undefined)
            .sort((a, b) => (b.metrics?.accuracy || 0) - (a.metrics?.accuracy || 0))
            .slice(0, 5)
            .map((exp, idx) => (
              <div key={exp._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{exp.experimentName}</div>
                    <div className="text-sm text-gray-500">{exp.model.name} • {exp.model.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                     {/* Double check for safety, though filter handled it */}
                    {exp.metrics?.accuracy ? (exp.metrics.accuracy * 100).toFixed(2) : '0'}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(exp.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          {experiments.filter(exp => exp.status === 'completed' && exp.metrics?.accuracy).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No completed experiments available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}