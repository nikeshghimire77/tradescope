import { ArrowUpRight, ArrowDownRight, Target, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import type { Position } from '../types/trade';
import { formatCurrency, formatPercent } from '../utils/portfolio';

interface PositionsTableProps {
    positions: Position[];
}

export function PositionsTable({ positions }: PositionsTableProps) {
    const totalCost = positions.reduce((sum, position) => sum + position.totalCost, 0);
    const totalUnrealizedPnL = positions.reduce((sum, position) => sum + (position.unrealizedPnL || 0), 0);
    const avgReturn = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;

    return (
        <div className="table-container">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-700">
                        <Target className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Stocks You Currently Own</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="table-header">
                                <th className="px-4 py-3 text-left text-white font-semibold">Stock</th>
                                <th className="px-4 py-3 text-left text-white font-semibold">Shares</th>
                                <th className="px-4 py-3 text-left text-white font-semibold">Average Price</th>
                                <th className="px-4 py-3 text-left text-white font-semibold">Total Cost</th>
                                <th className="px-4 py-3 text-left text-white font-semibold">Current Price</th>
                                <th className="px-4 py-3 text-left text-white font-semibold">Current Worth</th>
                                <th className="px-4 py-3 text-left text-white font-semibold">Profit/Loss</th>
                                <th className="px-4 py-3 text-left text-white font-semibold">Return %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.map((position) => (
                                <tr key={position.symbol} className="table-row">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                                                {position.symbol.charAt(0)}
                                            </div>
                                            <span className="text-white font-medium">{position.symbol}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-white">{position.quantity}</td>
                                    <td className="px-4 py-3 text-white">{formatCurrency(position.avgBuyPrice)}</td>
                                    <td className="px-4 py-3 text-white">{formatCurrency(position.totalCost)}</td>
                                    <td className="px-4 py-3 text-white">{formatCurrency(position.currentPrice || 0)}</td>
                                    <td className="px-4 py-3 text-white">{formatCurrency(position.marketValue || 0)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                                            <span className="text-emerald-400 font-medium">
                                                {formatCurrency(position.unrealizedPnL || 0)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-emerald-400 font-medium">
                                        {formatPercent(position.unrealizedPnLPercent || 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Footer */}
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-300 mb-1">Total Invested</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(totalCost)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-300 mb-1">Total Profit/Loss</p>
                            <div className="flex items-center justify-center gap-1">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                                <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalUnrealizedPnL)}</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-300 mb-1">Average Return</p>
                            <p className="text-lg font-bold text-emerald-400">{formatPercent(avgReturn)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-300 mb-1">Stocks Owned</p>
                            <p className="text-lg font-bold text-white">{positions.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 