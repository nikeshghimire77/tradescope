import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Zap, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import type { PortfolioSummary } from '../types/trade';
import { formatCurrency, formatPercent } from '../utils/portfolio';

interface PortfolioSummaryProps {
    summary: PortfolioSummary;
}

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
    const metrics = [
        {
            label: 'Total Invested',
            value: formatCurrency(summary.totalCost),
            icon: DollarSign,
            color: 'from-blue-600 to-indigo-700',
            bgColor: 'bg-blue-600/10',
            borderColor: 'border-blue-600/20',
            description: 'How much you spent on stocks',
        },
        {
            label: 'Total Profit/Loss',
            value: formatCurrency(summary.totalPnL),
            percentage: formatPercent(summary.totalPnLPercent),
            icon: summary.totalPnL >= 0 ? TrendingUpIcon : TrendingDownIcon,
            color: summary.totalPnL >= 0 ? 'from-emerald-600 to-green-700' : 'from-rose-600 to-red-700',
            bgColor: summary.totalPnL >= 0 ? 'bg-emerald-600/10' : 'bg-rose-600/10',
            borderColor: summary.totalPnL >= 0 ? 'border-emerald-600/20' : 'border-rose-600/20',
            trend: summary.totalPnL >= 0 ? 'up' : 'down',
            description: summary.totalPnL >= 0 ? 'You\'re making money!' : 'You\'re losing money',
        },
        {
            label: 'Money Made from Sales',
            value: formatCurrency(summary.totalRealizedPnL),
            percentage: formatPercent(summary.totalRealizedPnLPercent),
            icon: BarChart3,
            color: summary.totalRealizedPnL >= 0 ? 'from-emerald-600 to-green-700' : 'from-orange-600 to-amber-700',
            bgColor: summary.totalRealizedPnL >= 0 ? 'bg-emerald-600/10' : 'bg-orange-600/10',
            borderColor: summary.totalRealizedPnL >= 0 ? 'border-emerald-600/20' : 'border-orange-600/20',
            description: 'Profit from stocks you sold',
        },
        {
            label: 'Money Made from Current Stocks',
            value: formatCurrency(summary.totalUnrealizedPnL),
            percentage: formatPercent(summary.totalUnrealizedPnLPercent),
            icon: Target,
            color: summary.totalUnrealizedPnL >= 0 ? 'from-indigo-600 to-purple-700' : 'from-pink-600 to-rose-700',
            bgColor: summary.totalUnrealizedPnL >= 0 ? 'bg-indigo-600/10' : 'bg-pink-600/10',
            borderColor: summary.totalUnrealizedPnL >= 0 ? 'border-indigo-600/20' : 'border-pink-600/20',
            description: 'Profit from stocks you still own',
        },
    ];

    const stats = [
        {
            label: 'Different Stocks',
            value: summary.positionCount,
            icon: Target,
            color: 'from-indigo-600 to-purple-700',
            description: 'Number of stocks you own',
        },
        {
            label: 'Total Trades',
            value: summary.tradeCount,
            icon: BarChart3,
            color: 'from-blue-600 to-indigo-700',
            description: 'Buy and sell transactions',
        },
        {
            label: 'Current Worth',
            value: formatCurrency(summary.totalMarketValue),
            icon: DollarSign,
            color: 'from-emerald-600 to-green-700',
            description: 'What your stocks are worth now',
        },
        {
            label: 'Overall Return',
            value: formatPercent(summary.totalPnLPercent),
            icon: summary.totalPnLPercent >= 0 ? TrendingUp : TrendingDown,
            color: summary.totalPnLPercent >= 0 ? 'from-emerald-600 to-green-700' : 'from-rose-600 to-red-700',
            isPercentage: true,
            description: summary.totalPnLPercent >= 0 ? 'You\'re up overall!' : 'You\'re down overall',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                    <div key={metric.label} className="metric-card group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} shadow-lg`}>
                                <metric.icon className="h-6 w-6 text-white" />
                            </div>
                            {metric.trend && (
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${metric.trend === 'up' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    }`}>
                                    {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {metric.trend === 'up' ? 'Winning!' : 'Losing'}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                            {metric.percentage && (
                                <p className={`text-lg font-semibold mb-2 ${metric.label.includes('Profit/Loss')
                                    ? (summary.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400')
                                    : 'text-gray-300'
                                    }`}>
                                    {metric.percentage}
                                </p>
                            )}
                            <p className="text-gray-200 font-medium mb-1">{metric.label}</p>
                            <p className="text-gray-300 text-sm">{metric.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Overview */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Portfolio Overview</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center group">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-200 mb-1">{stat.label}</p>
                            <p className={`text-xl font-bold ${stat.isPercentage && summary.totalPnLPercent >= 0 ? 'text-emerald-400' :
                                stat.isPercentage && summary.totalPnLPercent < 0 ? 'text-rose-400' : 'text-white'
                                }`}>
                                {stat.value}
                            </p>
                            <p className="text-xs text-gray-300 mt-1">{stat.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 