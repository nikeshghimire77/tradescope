import type { Position } from '../types/trade';

// Cache for market prices to avoid repeated API calls
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCurrentPrice(symbol: string): Promise<number | null> {
    const now = Date.now();
    const cached = priceCache.get(symbol);

    // Return cached price if it's still valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return cached.price;
    }

    try {
        // Using Alpha Vantage API (free tier)
        const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch price');
        }

        const data = await response.json();

        if (data['Global Quote'] && data['Global Quote']['05. price']) {
            const price = parseFloat(data['Global Quote']['05. price']);

            // Cache the price
            priceCache.set(symbol, { price, timestamp: now });

            return price;
        }

        return null;
    } catch (error) {
        console.warn(`Failed to fetch price for ${symbol}:`, error);
        return null;
    }
}

export async function updatePositionsWithMarketData(positions: Position[]): Promise<Position[]> {
    const updatedPositions = await Promise.all(
        positions.map(async (position) => {
            // Try real API first, fallback to mock data
            let currentPrice = await getCurrentPrice(position.symbol);

            // If real API fails, use mock data
            if (!currentPrice) {
                currentPrice = await getMockPrice(position.symbol);
            }

            if (currentPrice) {
                const marketValue = position.quantity * currentPrice;
                const unrealizedPnL = marketValue - position.totalCost;
                const unrealizedPnLPercent = (unrealizedPnL / position.totalCost) * 100;

                return {
                    ...position,
                    currentPrice,
                    marketValue,
                    unrealizedPnL,
                    unrealizedPnLPercent,
                };
            }

            // If no price available, return position with zero values
            return {
                ...position,
                currentPrice: 0,
                marketValue: 0,
                unrealizedPnL: 0,
                unrealizedPnLPercent: 0,
            };
        })
    );

    return updatedPositions;
}

// Mock data for demo purposes when API fails
const mockPrices: Record<string, number> = {
    'AIRE': 0.45,
    'RKT': 15.80,
    'DNUT': 4.85,
    'DFLI': 0.52,
    'NVTS': 8.95,
    'OPEN': 2.75,
    'GTI': 0.12,
    'XAGE': 6.45,
    'SQFT': 17.50,
    'PLUG': 1.65,
    'BBAI': 7.20,
    'MRSN': 0.38,
    'SKYE': 3.25,
    'ARTL': 2.10,
};

export async function getMockPrice(symbol: string): Promise<number | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const price = mockPrices[symbol];
    if (price) {
        priceCache.set(symbol, { price, timestamp: Date.now() });
        return price;
    }

    return null;
}

export async function updatePositionsWithMockData(positions: Position[]): Promise<Position[]> {
    const updatedPositions = await Promise.all(
        positions.map(async (position) => {
            const currentPrice = await getMockPrice(position.symbol);

            if (currentPrice) {
                const marketValue = position.quantity * currentPrice;
                const unrealizedPnL = marketValue - position.totalCost;
                const unrealizedPnLPercent = (unrealizedPnL / position.totalCost) * 100;

                return {
                    ...position,
                    currentPrice,
                    marketValue,
                    unrealizedPnL,
                    unrealizedPnLPercent,
                };
            }

            return position;
        })
    );

    return updatedPositions;
} 