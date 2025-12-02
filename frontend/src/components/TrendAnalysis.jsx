import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Filter } from 'lucide-react';

export default function TrendAnalysis({ experiments }) {
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [selectedModelType, setSelectedModelType] = useState('all');
  const [timeRange, setTimeRange] = useState(30); // days

  // Filter experiments
  const filteredExperiments = experiments
    .filter(exp => exp.status === 'completed')
    .filter(exp => {
      if (selectedModelType === 'all') return true;
      return exp.model.type === selectedModelType;
    })
    .filter(exp => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - timeRange);
      return new Date(exp.createdAt) >= daysAgo;
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Prepare trend data
  const trendData = filteredExperiments.map(exp => ({
    date: new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    name: exp.experimentName.substring(0, 20),
    accuracy: exp.metrics.accuracy ? (exp.metrics.accuracy * 100).toFixed(2) : null,
    loss: exp.metrics.loss?.toFixed(4),
    f1Score: exp.metrics.f1Score ? (exp.metrics.f1Score * 100).toFixed(2) : null,
    precision: exp.metrics.precision ? (exp.metrics.precision * 100).toFixed(2) : null,
    recall: exp.metrics.recall ? (exp.metrics.recall * 100).toFixed(2) : null
  }));

  // Scatter plot data for hyperparameter analysis
  const scatterData = filteredExperiments
    .filter(exp => exp.trainingConfig?.learningRate && exp.metrics.accuracy)
    .map(exp => ({
      learningRate: exp.trainingConfig.learningRate,
      accuracy: (exp.metrics.accuracy * 100).toFixed(2),
      batchSize: exp.trainingConfig.batchSize,
      name: exp.experimentName
    }));

  // Get unique model types
  const modelTypes = ['all', ...new Set(experiments.map(exp => exp.model.type))];

  // Calculate statistics
  const stats = {
    avgAccuracy: filteredExperiments.reduce((sum, exp) => sum + (exp.metrics.accuracy || 0), 0) / filteredExperiments.length || 0,
    bestAccuracy: Math.max(...filteredExperiments.map(exp => exp.metrics.accuracy || 0)),
    worstAccuracy: Math.min(...filteredExperiments.filter(exp => exp.metrics.accuracy).map(exp => exp.metrics.accuracy)),
    improvementRate: 0
  };

  // Calculate improvement rate
  if (filteredExperiments.length >= 2) {
    const firstHalf = filteredExperiments.slice(0, Math.floor(filteredExperiments.length / 2));
    const secondHalf = filteredExperiments.slice(Math.floor(filteredExperiments.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, exp) => sum + (exp.metrics.accuracy || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, exp) => sum + (exp.metrics.accuracy || 0), 0) / secondHalf.length;
    
    stats.improvementRate = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(2);
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="accuracy">Accuracy</option>
              <option value="loss">Loss</option>
              <option value="f1Score">F1 Score</option>
              <option value="precision">Precision</option>
              <option value="recall">Recall</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
            <select
              value={selectedModelType}
              onChange={(e) => setSelectedModelType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {modelTypes.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type === 'all' ? 'All Types' : type.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="text-sm text-blue-600 font-medium mb-1">Average {selectedMetric}</div>
          <div className="text-3xl font-bold text-blue-900">
            {selectedMetric === 'loss' 
              ? (filteredExperiments.reduce((sum, exp) => sum + (exp.metrics.loss || 0), 0) / filteredExperiments.length || 0).toFixed(4)
              : `${(stats.avgAccuracy * 100).toFixed(2)}%`}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
          <div className="text-sm text-green-600 font-medium mb-1">Best Performance</div>
          <div className="text-3xl font-bold text-green-900">
            {selectedMetric === 'loss'
              ? Math.min(...filteredExperiments.filter(exp => exp.metrics.loss).map(exp => exp.metrics.loss)).toFixed(4)
              : `${(stats.bestAccuracy * 100).toFixed(2)}%`}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
          <div className="text-sm text-orange-600 font-medium mb-1">Worst Performance</div>
          <div className="text-3xl font-bold text-orange-900">
            {selectedMetric === 'loss'
              ? Math.max(...filteredExperiments.filter(exp => exp.metrics.loss).map(exp => exp.metrics.loss)).toFixed(4)
              : `${(stats.worstAccuracy * 100).toFixed(2)}%`}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="text-sm text-purple-600 font-medium mb-1">Improvement Rate</div>
          <div className="text-3xl font-bold text-purple-900 flex items-center gap-2">
            {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}%
            {stats.improvementRate > 0 && <TrendingUp className="w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Over Time
        </h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis label={{ value: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1), angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow">
                        <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
                        <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
                        <p className="text-blue-600 font-medium">
                          {selectedMetric}: {payload[0].value}
                          {selectedMetric !== 'loss' && '%'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            No data available for the selected filters
          </div>
        )}
      </div>

      {/* Hyperparameter Correlation */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Learning Rate vs Accuracy
        </h3>
        {scatterData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="learningRate" 
                name="Learning Rate"
                label={{ value: 'Learning Rate', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="accuracy" 
                name="Accuracy"
                label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow">
                        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.name}</p>
                        <p className="text-sm text-gray-600">LR: {payload[0].payload.learningRate}</p>
                        <p className="text-sm text-gray-600">Acc: {payload[0].payload.accuracy}%</p>
                        <p className="text-sm text-gray-600">Batch: {payload[0].payload.batchSize}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                name="Experiments" 
                data={scatterData} 
                fill="#8b5cf6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            Not enough data to show correlation
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Trend Insights
        </h3>
        <div className="space-y-2 text-gray-700">
          <p>• Analyzed {filteredExperiments.length} experiments over the last {timeRange} days</p>
          {stats.improvementRate > 0 ? (
            <p className="text-green-700 font-medium">
              • ✓ Positive improvement trend: {stats.improvementRate}% increase in average performance
            </p>
          ) : stats.improvementRate < 0 ? (
            <p className="text-orange-700 font-medium">
              • ⚠ Performance decline: {Math.abs(stats.improvementRate)}% decrease - review recent changes
            </p>
          ) : (
            <p>• Performance has remained stable</p>
          )}
          {scatterData.length > 0 && (
            <p>• Optimal learning rate range: {Math.min(...scatterData.map(d => d.learningRate)).toFixed(4)} - {Math.max(...scatterData.map(d => d.learningRate)).toFixed(4)}</p>
          )}
        </div>
      </div>
    </div>
  );
}