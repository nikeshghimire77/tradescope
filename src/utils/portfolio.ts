import { differenceInDays, parseISO } from 'date-fns';
import type { Trade, Position, TradePair, PortfolioSummary } from '../types/trade';
import Papa from 'papaparse';

// Helper function to parse dates in different formats
function parseDate(dateString: string): Date {
    // Handle "M/D/YYYY" format
    if (dateString.includes('/')) {
        const [month, day, year] = dateString.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Handle ISO format
    return parseISO(dateString);
}

export function parseCSVData(csvText: string): Promise<Trade[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                try {
                    const trades: Trade[] = [];
                    console.log('CSV parsing results:', results);

                    if (!results.data || results.data.length === 0) {
                        throw new Error('No data found in CSV file');
                    }

                    results.data.forEach((row: any, index: number) => {
                        console.log('Processing row:', index, 'Raw row data:', row);

                        // Skip non-trade rows (like fees, transfers, empty rows)
                        if (!row.Instrument || !row['Trans Code'] || row.Instrument.trim() === '') {
                            console.log('Skipping row - missing instrument or trans code:', row);
                            return;
                        }

                        // Skip rows with empty instrument (like subscription fees, transfers)
                        if (row.Instrument.trim() === '') {
                            console.log('Skipping row - empty instrument:', row);
                            return;
                        }

                        const transCode = row['Trans Code'].toUpperCase();

                        // Map transaction codes to sides
                        let side: 'BUY' | 'SELL' | 'DIVIDEND' | 'FEE' | 'DEPOSIT' | 'CORP_ACTION' | null = null;

                        switch (transCode) {
                            case 'BUY':
                                side = 'BUY';
                                break;
                            case 'SELL':
                                side = 'SELL';
                                break;
                            case 'CDIV':
                                side = 'DIVIDEND';
                                break;
                            case 'AFEE':
                            case 'GOLD':
                                side = 'FEE';
                                break;
                            case 'RTP':
                                side = 'DEPOSIT';
                                break;
                            case 'SOFF':
                                side = 'CORP_ACTION';
                                break;
                            default:
                                console.log('Skipping row - unsupported trans code:', transCode);
                                return;
                        }

                        // Skip non-trade transactions for now (we'll handle them separately)
                        if (side !== 'BUY' && side !== 'SELL') {
                            console.log('Skipping non-trade transaction:', side);
                            return;
                        }

                        console.log('Processing trade for:', row.Instrument, 'Type:', transCode);

                        // Parse quantity - handle empty or invalid values
                        const quantityStr = row.Quantity || '0';
                        console.log('Raw quantity string:', quantityStr, 'for row:', row);

                        // Remove any quotes and trim whitespace
                        const cleanQuantityStr = quantityStr.toString().replace(/"/g, '').trim();
                        const quantity = parseFloat(cleanQuantityStr);

                        console.log('Parsed quantity:', quantity, 'from:', cleanQuantityStr);

                        if (isNaN(quantity) || quantity <= 0) {
                            console.log('Skipping row - invalid quantity:', quantityStr);
                            return;
                        }

                        // Parse amount - handle empty or invalid values
                        const amountStr = row.Amount || '0';
                        let amount = 0;
                        if (amountStr && amountStr.trim() !== '') {
                            amount = parseFloat(amountStr.replace(/[$,()]/g, ''));
                        }

                        // Calculate price based on Amount as truth
                        let calculatedPrice = 0;
                        if (amount !== 0 && quantity > 0) {
                            if (side === 'BUY') {
                                calculatedPrice = Math.abs(amount) / quantity; // cost_per = (−Amount)/Quantity
                            } else if (side === 'SELL') {
                                calculatedPrice = amount / quantity; // sell_per = Amount/Quantity
                            }
                        } else {
                            console.log('Skipping row - cannot calculate price:', { amount, quantity, side });
                            return;
                        }

                        if (isNaN(calculatedPrice) || calculatedPrice <= 0) {
                            console.log('Skipping row - invalid price calculation:', { amount, quantity, side });
                            return;
                        }

                        // Validate date
                        if (!row['Activity Date'] || row['Activity Date'].trim() === '') {
                            console.log('Skipping row - missing activity date');
                            return;
                        }

                        const trade: Trade = {
                            id: `${row.Instrument}-${index}`,
                            symbol: row.Instrument.trim(),
                            side: side,
                            quantity: Math.abs(quantity),
                            price: calculatedPrice,
                            date: row['Activity Date'],
                            fees: 0,
                        };

                        console.log('Created trade:', trade);
                        trades.push(trade);
                    });

                    console.log('Total trades parsed:', trades.length);

                    if (trades.length === 0) {
                        throw new Error('No valid trades found in CSV file. Please check the format.');
                    }

                    resolve(trades);
                } catch (error) {
                    console.error('Error processing CSV data:', error);
                    reject(error);
                }
            },
            error: (error: any) => {
                console.error('Papa Parse error:', error);
                reject(new Error(`CSV parsing failed: ${error.message}`));
            }
        });
    });
}

export function calculateFIFOPairs(trades: Trade[]): TradePair[] {
    const pairs: TradePair[] = [];
    const buyTrades: Trade[] = [];
    const sellTrades: Trade[] = [];

    // Sort trades by (Symbol, Activity Date, BUY before SELL)
    const sortedTrades = [...trades].sort((a, b) => {
        // First by symbol
        if (a.symbol !== b.symbol) {
            return a.symbol.localeCompare(b.symbol);
        }
        // Then by date
        const dateA = parseDate(a.date).getTime();
        const dateB = parseDate(b.date).getTime();
        if (dateA !== dateB) {
            return dateA - dateB;
        }
        // Finally, BUY before SELL on same day
        if (a.side === 'BUY' && b.side === 'SELL') return -1;
        if (a.side === 'SELL' && b.side === 'BUY') return 1;
        return 0;
    });

    // Separate buy and sell trades
    sortedTrades.forEach(trade => {
        if (trade.side === 'BUY') {
            buyTrades.push(trade);
        } else {
            sellTrades.push(trade);
        }
    });

    // Match sells with buys using FIFO
    sellTrades.forEach(sellTrade => {
        let remainingQuantity = sellTrade.quantity;
        let matchedBuys: { trade: Trade; quantity: number }[] = [];

        // Find matching buy trades (FIFO)
        for (let i = 0; i < buyTrades.length && remainingQuantity > 0; i++) {
            const buyTrade = buyTrades[i];
            if (buyTrade.symbol === sellTrade.symbol && buyTrade.quantity > 0) {
                const matchQuantity = Math.min(remainingQuantity, buyTrade.quantity);
                matchedBuys.push({ trade: buyTrade, quantity: matchQuantity });
                remainingQuantity -= matchQuantity;
                buyTrade.quantity -= matchQuantity; // Mark as used
            }
        }

        // If we have a complete match, create trade pair
        if (remainingQuantity === 0 && matchedBuys.length > 0) {
            // Calculate weighted average buy price
            const totalBuyValue = matchedBuys.reduce((sum, match) =>
                sum + (match.trade.price * match.quantity), 0);
            const totalBuyQuantity = matchedBuys.reduce((sum, match) => sum + match.quantity, 0);
            const avgBuyPrice = totalBuyValue / totalBuyQuantity;

            const realizedPnL = (sellTrade.price - avgBuyPrice) * sellTrade.quantity;
            const realizedPnLPercent = avgBuyPrice > 0 ? (realizedPnL / (avgBuyPrice * sellTrade.quantity)) * 100 : 0;
            const holdingPeriod = differenceInDays(parseDate(sellTrade.date), parseDate(matchedBuys[0].trade.date));

            pairs.push({
                buyTrade: {
                    ...matchedBuys[0].trade,
                    quantity: sellTrade.quantity,
                    price: avgBuyPrice,
                },
                sellTrade,
                realizedPnL,
                realizedPnLPercent,
                holdingPeriod,
            });
        }
    });

    return pairs;
}

export function calculatePositions(trades: Trade[]): Position[] {
    const positions = new Map<string, Position>();

    // Sort trades by (Symbol, Activity Date, BUY before SELL) for consistent processing
    const sortedTrades = [...trades].sort((a, b) => {
        // First by symbol
        if (a.symbol !== b.symbol) {
            return a.symbol.localeCompare(b.symbol);
        }
        // Then by date
        const dateA = parseDate(a.date).getTime();
        const dateB = parseDate(b.date).getTime();
        if (dateA !== dateB) {
            return dateA - dateB;
        }
        // Finally, BUY before SELL on same day
        if (a.side === 'BUY' && b.side === 'SELL') return -1;
        if (a.side === 'SELL' && b.side === 'BUY') return 1;
        return 0;
    });

    console.log('Processing trades for positions:', sortedTrades.length);

    sortedTrades.forEach((trade, index) => {
        const symbol = trade.symbol;

        if (!positions.has(symbol)) {
            positions.set(symbol, {
                symbol,
                quantity: 0,
                avgBuyPrice: 0,
                totalCost: 0,
                currentPrice: 0,
                marketValue: 0,
                unrealizedPnL: 0,
                unrealizedPnLPercent: 0,
            });
        }

        const position = positions.get(symbol)!;
        const beforeQuantity = position.quantity;
        const beforeCost = position.totalCost;

        if (trade.side === 'BUY') {
            // Calculate new average price using weighted average
            const newTotalCost = position.totalCost + (trade.price * trade.quantity);
            const newQuantity = position.quantity + trade.quantity;
            position.avgBuyPrice = newQuantity > 0 ? newTotalCost / newQuantity : 0;
            position.totalCost = newTotalCost;
            position.quantity = newQuantity;

            console.log(`BUY ${symbol}: +${trade.quantity} @ $${trade.price} = $${trade.price * trade.quantity}`);
        } else if (trade.side === 'SELL') {
            // Reduce position - only sell what we actually own
            const sellQuantity = Math.min(trade.quantity, position.quantity);

            if (sellQuantity > 0) {
                // Calculate the cost basis of shares being sold
                const soldCost = position.avgBuyPrice * sellQuantity;

                // Reduce position
                position.quantity -= sellQuantity;
                position.totalCost -= soldCost;

                // Recalculate average price if still have shares
                if (position.quantity > 0) {
                    position.avgBuyPrice = position.totalCost / position.quantity;
                } else {
                    // Position is completely sold
                    position.avgBuyPrice = 0;
                    position.totalCost = 0;
                }

                console.log(`SELL ${symbol}: -${sellQuantity} @ $${trade.price} (cost: $${soldCost})`);
            } else {
                console.log(`SELL ${symbol}: Skipping - no shares to sell (have: ${position.quantity}, trying to sell: ${trade.quantity})`);
            }
        }

        console.log(`${symbol} position: ${beforeQuantity} -> ${position.quantity}, $${beforeCost.toFixed(2)} -> $${position.totalCost.toFixed(2)}`);
    });

    const finalPositions = Array.from(positions.values()).filter(pos => pos.quantity > 0);
    console.log('Final positions:', finalPositions);

    return finalPositions;
}

export function calculatePortfolioSummary(
    positions: Position[],
    tradePairs: TradePair[],
    allTrades: Trade[]
): PortfolioSummary {
    const totalCost = positions.reduce((sum, pos) => sum + pos.totalCost, 0);
    const totalMarketValue = positions.reduce((sum, pos) => sum + (pos.marketValue || 0), 0);
    const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + (pos.unrealizedPnL || 0), 0);
    const totalRealizedPnL = tradePairs.reduce((sum, pair) => sum + pair.realizedPnL, 0);

    const totalPnL = totalRealizedPnL + totalUnrealizedPnL;

    const totalUnrealizedPnLPercent = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;
    const totalRealizedPnLPercent = totalCost > 0 ? (totalRealizedPnL / totalCost) * 100 : 0;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    return {
        totalCost,
        totalMarketValue,
        totalUnrealizedPnL,
        totalUnrealizedPnLPercent,
        totalRealizedPnL,
        totalRealizedPnLPercent,
        totalPnL,
        totalPnLPercent,
        positionCount: positions.length,
        tradeCount: allTrades.length,
    };
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatPercent(percentage: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(percentage / 100);
} 