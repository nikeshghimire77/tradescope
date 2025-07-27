export interface Trade {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL' | 'DIVIDEND' | 'FEE' | 'DEPOSIT' | 'CORP_ACTION';
    quantity: number;
    price: number;
    date: string;
    fees?: number;
}

export interface Position {
    symbol: string;
    quantity: number;
    avgBuyPrice: number;
    totalCost: number;
    currentPrice?: number;
    marketValue?: number;
    unrealizedPnL?: number;
    unrealizedPnLPercent?: number;
}

export interface TradePair {
    buyTrade: Trade;
    sellTrade: Trade;
    realizedPnL: number;
    realizedPnLPercent: number;
    holdingPeriod: number; // in days
}

export interface PortfolioSummary {
    totalCost: number;
    totalMarketValue: number;
    totalUnrealizedPnL: number;
    totalUnrealizedPnLPercent: number;
    totalRealizedPnL: number;
    totalRealizedPnLPercent: number;
    totalPnL: number;
    totalPnLPercent: number;
    positionCount: number;
    tradeCount: number;
}

export interface AnalyticsData {
    dailyPnL: Array<{
        date: string;
        unrealizedPnL: number;
        realizedPnL: number;
        totalPnL: number;
    }>;
    topPositions: Position[];
    topTrades: TradePair[];
    performanceBySymbol: Array<{
        symbol: string;
        totalPnL: number;
        totalPnLPercent: number;
        tradeCount: number;
    }>;
} 