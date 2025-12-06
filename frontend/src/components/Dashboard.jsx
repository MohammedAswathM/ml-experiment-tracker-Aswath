import { useState } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Award, AlertCircle, Clock, Zap, Target, Brain, Rocket, Filter } from 'lucide-react';

export default function Dashboard({ stats, experiments }) {
  // NEW: State to toggle between "Last 10" and "All Time"
  const [showAllTrends, setShowAllTrends] = useState(false);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const modelTypeData = stats.experimentsByType?.map(item => ({
    name: item._id?.replace('-', ' ').toUpperCase() || 'Unknown',
    value: item.count
  })) || [];

  // --- UPDATED LOGIC FOR TRENDS ---
  // 1. Filter completed experiments
  const completedExperiments = experiments
    .filter(exp => exp.status === 'completed')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

  // 2. Decide how many to show based on state
  const experimentsToDisplay = showAllTrends 
    ? completedExperiments 
    : completedExperiments.slice(0, 10);

  // 3. Reverse for chart (Oldest -> Newest on graph) and Map Data
  const accuracyTrendData = [...experimentsToDisplay].reverse().map(exp => ({
    name: exp.experimentName.substring(0, 15) + '...',
    // FIX: If accuracy is missing (like LSTM), use 0 instead of NaN to prevent graph errors
    accuracy: exp.metrics?.accuracy ? (exp.metrics.accuracy * 100).toFixed(2) : 0,
    loss: exp.metrics?.loss?.toFixed(4)
  }));

  const statusData = [
    { name: 'Completed', value: stats.completedExperiments, color: '#10b981' },
    { name: 'Running', value: stats.runningExperiments, color: '#3b82f6' },
    { name: 'Failed', value: stats.failedExperiments, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const CHART_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-purple-200 rounded-xl p-4 shadow-2xl">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-animation">
        {[
          { 
            icon: Rocket, 
            label: 'Total Experiments', 
            value: stats.totalExperiments,
            gradient: 'from-blue-500 via-blue-600 to-cyan-600',
            iconBg: 'from-blue-400 to-cyan-500',
            trend: '+12%',
            trendUp: true
          },
          { 
            icon: Award, 
            label: 'Best Accuracy', 
            value: stats.bestExperiment?.metrics?.accuracy 
              ? `${(stats.bestExperiment.metrics.accuracy * 100).toFixed(1)}%`
              : 'N/A',
            gradient: 'from-yellow-500 via-orange-500 to-red-500',
            iconBg: 'from-yellow-400 to-orange-500',
            subtitle: stats.bestExperiment?.experimentName?.substring(0, 20) || 'No data',
            trend: '+5.2%',
            trendUp: true
          },
          { 
            icon: Target, 
            label: 'Avg Accuracy', 
            value: stats.averageMetrics?.avgAccuracy 
              ? `${(stats.averageMetrics.avgAccuracy * 100).toFixed(1)}%`
              : 'N/A',
            gradient: 'from-purple-500 via-pink-500 to-rose-500',
            iconBg: 'from-purple-400 to-pink-500',
            trend: '+3.1%',
            trendUp: true
          },
          { 
            icon: AlertCircle, 
            label: 'Failed', 
            value: stats.failedExperiments,
            gradient: 'from-red-500 via-pink-500 to-rose-500',
            iconBg: 'from-red-400 to-pink-500',
            trend: '-2%',
            trendUp: false
          }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div 
              key={idx}
              className="group relative overflow-hidden rounded-3xl p-0.5 hover-card"
            >
              {/* Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-75 group-hover:opacity-100 transition-opacity blur-sm`}></div>
              
              {/* Card Content */}
              <div className="relative bg-white rounded-3xl p-6 h-full">
                {/* Icon with Animated Background */}
                <div className="relative mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-r ${metric.iconBg} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-r ${metric.iconBg} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Value */}
                <div className={`text-4xl font-black bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent mb-2 transform group-hover:scale-105 transition-transform`}>
                  {metric.value}
                </div>

                {/* Label */}
                <div className="text-sm font-semibold text-gray-600 mb-1">{metric.label}</div>
                
                {/* Subtitle or Trend */}
                {metric.subtitle && (
                  <div className="text-xs text-gray-500 truncate">{metric.subtitle}</div>
                )}
                {metric.trend && (
                  <div className={`text-xs font-semibold flex items-center gap-1 ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-3 h-3 ${!metric.trendUp && 'rotate-180'}`} />
                    {metric.trend} from last month
                  </div>
                )}

                {/* Decorative Element */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${metric.gradient} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Type Distribution */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-xl p-6 hover-card">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                Experiments by Model Type
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-semibold rounded-full">
                {modelTypeData.length} types
              </span>
            </div>
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
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {modelTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-xl p-6 hover-card">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Experiment Status
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-sm font-semibold rounded-full">
                Live
              </span>
            </div>
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
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-xl p-6 hover-card">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              Recent Experiment Performance
            </h3>
            
            {/* NEW TOGGLE BUTTON */}
            <button 
              onClick={() => setShowAllTrends(!showAllTrends)}
              className="flex items-center gap-2 px-4 py-1.5 bg-white border border-orange-200 text-orange-700 text-sm font-semibold rounded-full hover:bg-orange-50 transition-colors"
            >
              <Filter className="w-3 h-3" />
              {showAllTrends ? 'Show Last 10' : 'Show All Time'}
            </button>
          </div>
          
          {accuracyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={accuracyTrendData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }} 
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="accuracy" 
                  fill="url(#barGradient)" 
                  name="Accuracy (%)" 
                  radius={[8, 8, 0, 0]}
                  animationBegin={0}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No completed experiments yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Performers with Enhanced Design */}
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-xl p-6 hover-card">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-600" />
              Top 5 Performing Experiments
            </h3>
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 text-sm font-semibold rounded-full flex items-center gap-1">
              <Rocket className="w-4 h-4" />
              Hall of Fame
            </span>
          </div>
          <div className="space-y-3">
            {experiments
              // CRITICAL FIX: Safe filtering to prevent crash on missing metrics
              .filter(exp => exp.status === 'completed' && exp.metrics?.accuracy !== undefined)
              .sort((a, b) => (b.metrics?.accuracy || 0) - (a.metrics?.accuracy || 0))
              .slice(0, 5)
              .map((exp, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                const gradients = [
                  'from-yellow-400 to-orange-500',
                  'from-gray-300 to-gray-400',
                  'from-orange-400 to-red-500',
                  'from-blue-400 to-purple-500',
                  'from-purple-400 to-pink-500'
                ];
                
                return (
                  <div 
                    key={exp._id} 
                    className="group/item relative overflow-hidden flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`relative w-14 h-14 bg-gradient-to-br ${gradients[idx]} rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg transform group-hover/item:scale-110 group-hover/item:rotate-12 transition-all duration-300`}>
                        {idx < 3 ? (
                          <span className="text-3xl">{medals[idx]}</span>
                        ) : (
                          <span>#{idx + 1}</span>
                        )}
                      </div>
                      
                      {/* Experiment Info */}
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-1 group-hover/item:text-purple-600 transition-colors">
                          {exp.experimentName}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Brain className="w-4 h-4" />
                            {exp.model.name}
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="capitalize">{exp.model.type}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="text-right">
                      <div className={`text-3xl font-black bg-gradient-to-r ${gradients[idx]} bg-clip-text text-transparent mb-1 group-hover/item:scale-110 transition-transform`}>
                        {(exp.metrics.accuracy * 100).toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradients[idx]} opacity-0 group-hover/item:opacity-10 transition-opacity rounded-2xl`}></div>
                  </div>
                );
              })}
            {experiments.filter(exp => exp.status === 'completed' && exp.metrics?.accuracy).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No completed experiments yet</p>
                <p className="text-sm mt-2">Start your first experiment to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}