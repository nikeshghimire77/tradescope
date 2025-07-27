import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Calendar, DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, AlertTriangle, Lightbulb, Target, Clock, CheckCircle } from 'lucide-react';
import type { TradePair, Position } from '../types/trade';
import { formatCurrency, formatPercent } from '../utils/portfolio';

interface TradeAnalyticsProps {
    tradePairs: TradePair[];
    positions: Position[];
}

export function TradeAnalytics({ tradePairs, positions }: TradeAnalyticsProps) {
    const [activeTab, setActiveTab] = useState<'realized' | 'performance' | 'overview' | 'analysis'>('realized');

    // Calculate performance by symbol - include both realized and unrealized P&L
    const performanceBySymbol = positions.map(position => {
        // Get realized P&L from trade pairs
        const symbolTrades = tradePairs.filter(pair =>
            pair.buyTrade.symbol === position.symbol || pair.sellTrade.symbol === position.symbol
        );
        const realizedPnL = symbolTrades.reduce((sum, pair) => sum + pair.realizedPnL, 0);

        // Get unrealized P&L from current position
        const unrealizedPnL = position.unrealizedPnL || 0;

        // Total P&L is realized + unrealized
        const totalPnL = realizedPnL + unrealizedPnL;
        const totalCost = position.totalCost;

        return {
            symbol: position.symbol,
            totalPnL,
            realizedPnL,
            unrealizedPnL,
            totalPnLPercent: totalCost > 0 ? (totalPnL / totalCost) * 100 : 0,
            tradeCount: symbolTrades.length,
        };
    }).sort((a, b) => Math.abs(b.totalPnL) - Math.abs(a.totalPnL));

    // Prepare chart data for realized P&L
    const realizedPnLData = tradePairs
        .sort((a, b) => new Date(a.sellTrade.date).getTime() - new Date(b.sellTrade.date).getTime())
        .map((pair, index) => ({
            date: new Date(pair.sellTrade.date).toLocaleDateString(),
            realizedPnL: pair.realizedPnL,
            cumulativePnL: tradePairs
                .slice(0, index + 1)
                .reduce((sum, p) => sum + p.realizedPnL, 0),
        }));

    const topTrades = [...tradePairs]
        .sort((a, b) => Math.abs(b.realizedPnL) - Math.abs(a.realizedPnL))
        .slice(0, 10);

    // Overview data
    const overviewData = [
        { name: 'Winning Trades', value: tradePairs.filter(p => p.realizedPnL > 0).length, color: '#10b981' },
        { name: 'Losing Trades', value: tradePairs.filter(p => p.realizedPnL < 0).length, color: '#ef4444' },
    ];

    const avgHoldingPeriod = tradePairs.length > 0
        ? tradePairs.reduce((sum, pair) => sum + pair.holdingPeriod, 0) / tradePairs.length
        : 0;

    const totalVolume = tradePairs.reduce((sum, pair) => sum + (pair.buyTrade.quantity * pair.buyTrade.price), 0);

    // Analysis data
    const analysis = {
        totalTrades: tradePairs.length,
        winningTrades: tradePairs.filter(p => p.realizedPnL > 0).length,
        losingTrades: tradePairs.filter(p => p.realizedPnL < 0).length,
        winRate: tradePairs.length > 0 ? (tradePairs.filter(p => p.realizedPnL > 0).length / tradePairs.length) * 100 : 0,
        avgHoldingPeriod,
        totalVolume,
        biggestWin: tradePairs.length > 0 ? Math.max(...tradePairs.map(p => p.realizedPnL)) : 0,
        biggestLoss: tradePairs.length > 0 ? Math.min(...tradePairs.map(p => p.realizedPnL)) : 0,
        avgWin: tradePairs.filter(p => p.realizedPnL > 0).length > 0
            ? tradePairs.filter(p => p.realizedPnL > 0).reduce((sum, p) => sum + p.realizedPnL, 0) / tradePairs.filter(p => p.realizedPnL > 0).length
            : 0,
        avgLoss: tradePairs.filter(p => p.realizedPnL < 0).length > 0
            ? tradePairs.filter(p => p.realizedPnL < 0).reduce((sum, p) => sum + p.realizedPnL, 0) / tradePairs.filter(p => p.realizedPnL < 0).length
            : 0,
    };

    // Generate insights
    const insights = [];

    if (analysis.winRate < 50) {
        insights.push({
            type: 'warning',
            title: 'Low Win Rate',
            message: `Your win rate is ${analysis.winRate.toFixed(1)}%. Consider improving your entry/exit strategy.`,
            icon: AlertTriangle,
        });
    }

    if (analysis.avgHoldingPeriod < 1) {
        insights.push({
            type: 'info',
            title: 'Day Trading Pattern',
            message: 'You\'re primarily day trading with average holding period under 1 day.',
            icon: Clock,
        });
    }

    if (analysis.avgLoss > Math.abs(analysis.avgWin)) {
        insights.push({
            type: 'warning',
            title: 'Risk Management Issue',
            message: 'Your average loss is larger than your average win. Consider setting tighter stop losses.',
            icon: AlertTriangle,
        });
    }

    if (analysis.totalTrades > 50) {
        insights.push({
            type: 'info',
            title: 'High Trading Frequency',
            message: `You've made ${analysis.totalTrades} trades. High frequency can lead to increased fees and emotional trading.`,
            icon: Target,
        });
    }

    if (analysis.biggestLoss < -100) {
        insights.push({
            type: 'warning',
            title: 'Large Losses',
            message: `Your biggest loss was ${formatCurrency(analysis.biggestLoss)}. Consider position sizing to limit risk.`,
            icon: AlertTriangle,
        });
    }

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-gray-800/50 backdrop-blur-sm p-2 rounded-2xl">
                <button
                    onClick={() => setActiveTab('realized')}
                    className={`tab-button flex-1 flex items-center justify-center gap-2 ${activeTab === 'realized' ? 'active' : 'inactive'
                        }`}
                >
                    <BarChart3 className="h-4 w-4" />
                    Money from Sales
                </button>
                <button
                    onClick={() => setActiveTab('performance')}
                    className={`tab-button flex-1 flex items-center justify-center gap-2 ${activeTab === 'performance' ? 'active' : 'inactive'
                        }`}
                >
                    <TrendingUp className="h-4 w-4" />
                    Stock Performance
                </button>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`tab-button flex-1 flex items-center justify-center gap-2 ${activeTab === 'overview' ? 'active' : 'inactive'
                        }`}
                >
                    <PieChartIcon className="h-4 w-4" />
                    Trading Summary
                </button>
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`tab-button flex-1 flex items-center justify-center gap-2 ${activeTab === 'analysis' ? 'active' : 'inactive'
                        }`}
                >
                    <Lightbulb className="h-4 w-4" />
                    Analysis
                </button>
            </div>

            {activeTab === 'realized' && (
                <div className="space-y-6">
                    {/* Chart */}
                    <div className="chart-container">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Money Made from Sales Over Time</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={realizedPnLData}>
                                    <defs>
                                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), 'Money Made']}
                                        labelFormatter={(label) => `Date: ${label}`}
                                        contentStyle={{
                                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                            border: '1px solid #475569',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cumulativePnL"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fill="url(#colorPnL)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Trades */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Best and Worst Trades</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="table-header">
                                        <th className="text-left py-4 px-6 font-semibold text-gray-300">Stock</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-300">Buy Date</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-300">Sell Date</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Shares</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Buy Price</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Sell Price</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Profit/Loss</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Return %</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Days Held</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topTrades.map((pair, index) => (
                                        <tr key={index} className={`table-row group ${index % 2 === 0 ? 'bg-gray-700/30' : ''}`}>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">{pair.buyTrade.symbol.charAt(0)}</span>
                                                    </div>
                                                    <span className="font-semibold text-white">{pair.buyTrade.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-gray-300">{new Date(pair.buyTrade.date).toLocaleDateString()}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-gray-300">{new Date(pair.sellTrade.date).toLocaleDateString()}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="font-medium text-white">{pair.buyTrade.quantity.toLocaleString()}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="font-medium text-white">{formatCurrency(pair.buyTrade.price)}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="font-medium text-white">{formatCurrency(pair.sellTrade.price)}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {pair.realizedPnL >= 0 ? (
                                                        <div className="p-1 bg-green-500/20 rounded-full">
                                                            <ArrowUpRight className="h-4 w-4 text-green-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-1 bg-red-500/20 rounded-full">
                                                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                                                        </div>
                                                    )}
                                                    <span className={`font-semibold ${pair.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {formatCurrency(pair.realizedPnL)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-semibold ${pair.realizedPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {formatPercent(pair.realizedPnLPercent)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-gray-300">{pair.holdingPeriod} days</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'performance' && (
                <div className="space-y-6">
                    {/* Performance Chart */}
                    <div className="chart-container">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">How Each Stock is Performing</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceBySymbol.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis dataKey="symbol" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), 'Total Profit/Loss']}
                                        labelFormatter={(label) => `Stock: ${label}`}
                                        contentStyle={{
                                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                            border: '1px solid #475569',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="totalPnL"
                                        fill="url(#gradient)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Performance Table */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Detailed Stock Performance</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="table-header">
                                        <th className="text-left py-4 px-6 font-semibold text-gray-300">Stock</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Total Profit/Loss</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">From Sales</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">From Current</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Return %</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-300">Trades</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {performanceBySymbol.map((performance) => (
                                        <tr key={performance.symbol} className={`table-row group`}>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">{performance.symbol.charAt(0)}</span>
                                                    </div>
                                                    <span className="font-semibold text-white">{performance.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {performance.totalPnL >= 0 ? (
                                                        <div className="p-1 bg-green-500/20 rounded-full">
                                                            <ArrowUpRight className="h-4 w-4 text-green-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-1 bg-red-500/20 rounded-full">
                                                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                                                        </div>
                                                    )}
                                                    <span className={`font-semibold ${performance.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {formatCurrency(performance.totalPnL)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-semibold ${performance.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {formatCurrency(performance.realizedPnL)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-semibold ${performance.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {formatCurrency(performance.unrealizedPnL)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-semibold ${performance.totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {formatPercent(performance.totalPnLPercent)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-gray-300">{performance.tradeCount}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="metric-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                                    <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total Trades</p>
                                    <p className="text-2xl font-bold text-white">{analysis.totalTrades}</p>
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Win Rate</p>
                                    <p className="text-2xl font-bold text-white">{analysis.winRate.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Avg Days Held</p>
                                    <p className="text-2xl font-bold text-white">{Math.round(analysis.avgHoldingPeriod)} days</p>
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total Volume</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(analysis.totalVolume)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="chart-container">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                                <PieChartIcon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Winning vs Losing Trades</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={overviewData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {overviewData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [value, 'Trades']}
                                        contentStyle={{
                                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                            border: '1px solid #475569',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="metric-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Average Win</p>
                                    <p className="text-2xl font-bold text-green-400">{formatCurrency(analysis.avgWin)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
                                    <TrendingDown className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Average Loss</p>
                                    <p className="text-2xl font-bold text-red-400">{formatCurrency(analysis.avgLoss)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Risk/Reward Ratio</p>
                                    <p className="text-2xl font-bold text-white">
                                        {analysis.avgLoss !== 0 ? (Math.abs(analysis.avgWin) / Math.abs(analysis.avgLoss)).toFixed(2) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600">
                                <Lightbulb className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Trading Insights</h3>
                        </div>

                        <div className="space-y-4">
                            {insights.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-white" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-white mb-2">Great Trading!</h4>
                                    <p className="text-gray-400">Your trading patterns look healthy. Keep up the good work!</p>
                                </div>
                            ) : (
                                insights.map((insight, index) => (
                                    <div key={index} className={`p-4 rounded-xl border ${insight.type === 'warning'
                                        ? 'bg-red-500/10 border-red-500/20'
                                        : 'bg-blue-500/10 border-blue-500/20'
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${insight.type === 'warning'
                                                ? 'bg-red-500/20'
                                                : 'bg-blue-500/20'
                                                }`}>
                                                <insight.icon className={`h-5 w-5 ${insight.type === 'warning' ? 'text-red-400' : 'text-blue-400'
                                                    }`} />
                                            </div>
                                            <div>
                                                <h4 className={`font-semibold mb-1 ${insight.type === 'warning' ? 'text-red-400' : 'text-blue-400'
                                                    }`}>
                                                    {insight.title}
                                                </h4>
                                                <p className="text-gray-300 text-sm">{insight.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 