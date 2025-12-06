import { useState } from 'react';
import { 
  AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Filter, TrendingUp, TrendingDown, Minus, Activity, Target } from 'lucide-react';

export default function TrendAnalysis({ experiments }) {
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [timeRange, setTimeRange] = useState(30);

  // 1. DATA PREPARATION (Safe Filtering)
  const validExperiments = experiments
    .filter(exp => exp.status === 'completed')
    .filter(exp => exp.metrics && typeof exp.metrics[selectedMetric] === 'number')
    .filter(exp => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - timeRange);
      return new Date(exp.createdAt) >= daysAgo;
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Chart 1 Data: Time Series
  const timeChartData = validExperiments.map(exp => ({
    name: exp.experimentName.substring(0, 15),
    date: new Date(exp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: selectedMetric === 'loss' ? exp.metrics[selectedMetric] : (exp.metrics[selectedMetric] * 100)
  }));

  // Chart 2 Data: Scatter Plot (Learning Rate vs Metric)
  const scatterData = validExperiments
    .filter(exp => exp.trainingConfig?.learningRate)
    .map(exp => ({
      x: exp.trainingConfig.learningRate,
      y: selectedMetric === 'loss' ? exp.metrics[selectedMetric] : (exp.metrics[selectedMetric] * 100),
      name: exp.experimentName
    }));

  // 2. CALCULATE STATS
  const calculateStats = () => {
    if (validExperiments.length === 0) return { avg: 0, best: 0, trend: 0 };

    const values = validExperiments.map(e => e.metrics[selectedMetric]);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const best = selectedMetric === 'loss' ? Math.min(...values) : Math.max(...values);

    let trend = 0;
    if (values.length >= 2) {
      const mid = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, mid);
      const secondHalf = values.slice(mid);
      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (avg1 !== 0) trend = ((avg2 - avg1) / avg1) * 100;
    }

    const isPercentage = selectedMetric !== 'loss';
    return {
      avg: isPercentage ? (avg * 100).toFixed(2) + '%' : avg.toFixed(4),
      best: isPercentage ? (best * 100).toFixed(2) + '%' : best.toFixed(4),
      trend: trend.toFixed(1)
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6 pb-12">
      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-purple-700">
          <Filter className="w-5 h-5" />
          <h3 className="font-bold">Trend Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">METRIC</label>
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="accuracy">Accuracy</option>
              <option value="loss">Loss</option>
              <option value="f1Score">F1 Score</option>
              <option value="precision">Precision</option>
              <option value="recall">Recall</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">TIME RANGE</label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 3 Months</option>
              <option value={365}>All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Average</div>
          <div className="text-3xl font-black text-gray-800 mt-1">{stats.avg}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Best Recorded</div>
          <div className="text-3xl font-black text-green-600 mt-1">{stats.best}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Trend</div>
          <div className={`text-3xl font-black mt-1 flex items-center gap-2 ${
            (selectedMetric === 'loss' ? Number(stats.trend) < 0 : Number(stats.trend) > 0) 
              ? 'text-green-600' : 'text-orange-500'
          }`}>
            {Number(stats.trend) !== 0 && <TrendingUp className={`w-6 h-6 ${Number(stats.trend) < 0 ? 'rotate-180' : ''}`} />}
            {Math.abs(stats.trend)}%
          </div>
        </div>
      </div>

      {/* CHART 1: Performance History */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Performance History
        </h3>
        <div className="h-[350px] w-full">
          {timeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeChartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip contentStyle={{borderRadius: '12px'}} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* CHART 2: Scatter Plot (Learning Rate) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-pink-600" />
          Correlation: Learning Rate vs {selectedMetric}
        </h3>
        <div className="h-[350px] w-full">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Learning Rate" 
                  label={{ value: 'Learning Rate', position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Metric" 
                  label={{ value: selectedMetric, angle: -90, position: 'insideLeft' }} 
                  domain={['auto', 'auto']}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Experiments" data={scatterData} fill="#db2777" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No experiments with Learning Rate data found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}