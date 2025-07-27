import { useState } from 'react';
import { CSVUpload } from './components/CSVUpload';
import { PortfolioSummary } from './components/PortfolioSummary';
import { PositionsTable } from './components/PositionsTable';
import { TradeAnalytics } from './components/TradeAnalytics';
import { parseCSVData, calculateFIFOPairs, calculatePositions, calculatePortfolioSummary } from './utils/portfolio';
import { updatePositionsWithMarketData } from './utils/marketData';
import type { Trade, Position, TradePair, PortfolioSummary as PortfolioSummaryType } from './types/trade';
import { TrendingUp, RefreshCw, Upload } from 'lucide-react';

function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradePairs, setTradePairs] = useState<TradePair[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

  const handleDataLoaded = async (csvText: string) => {
    try {
      console.log('Starting to parse CSV data...');
      const parsedTrades = await parseCSVData(csvText);
      console.log('Parsed trades (after parsing):', parsedTrades);

      // Create deep copies of trades for each calculation to prevent side effects
      const tradesForFIFO = parsedTrades.map(trade => ({ ...trade }));
      const tradesForPositions = parsedTrades.map(trade => ({ ...trade }));

      console.log('Trades for FIFO (deep copy):', tradesForFIFO);
      console.log('Trades for positions (deep copy):', tradesForPositions);

      const calculatedTradePairs = calculateFIFOPairs(tradesForFIFO);
      console.log('Calculated trade pairs:', calculatedTradePairs);

      const calculatedPositions = calculatePositions(tradesForPositions);
      console.log('Calculated positions before market data:', calculatedPositions);

      const updatedPositions = await updatePositionsWithMarketData(calculatedPositions);
      console.log('Updated positions with market data:', updatedPositions);

      const calculatedSummary = calculatePortfolioSummary(updatedPositions, calculatedTradePairs, parsedTrades);
      console.log('Calculated summary:', calculatedSummary);

      setTrades(parsedTrades);
      setPositions(updatedPositions);
      setTradePairs(calculatedTradePairs);
      setSummary(calculatedSummary);
    } catch (error) {
      console.error('Error processing data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error processing your data: ${errorMessage}. Please check the file format and console for details.`);
    }
  };

  const refreshMarketData = async () => {
    if (positions.length === 0) return;

    setIsLoadingMarketData(true);
    try {
      const updatedPositions = await updatePositionsWithMarketData(positions);
      setPositions(updatedPositions);

      // Recalculate summary with updated positions
      const portfolioSummary = calculatePortfolioSummary(updatedPositions, tradePairs, trades);
      setSummary(portfolioSummary);
    } catch (error) {
      console.error('Error refreshing market data:', error);
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="header-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Portfolio Dashboard
              </h1>
            </div>

            {summary && (
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshMarketData}
                  disabled={isLoadingMarketData}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingMarketData ? 'animate-spin' : ''}`} />
                  Refresh Prices
                </button>
                <button
                  onClick={() => {
                    setTrades([]);
                    setPositions([]);
                    setTradePairs([]);
                    setSummary(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Upload className="h-4 w-4" />
                  Upload New Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!summary ? (
          <CSVUpload onDataLoaded={handleDataLoaded} />
        ) : (
          <div className="space-y-8">
            <PortfolioSummary summary={summary} />
            <PositionsTable positions={positions} />
            <TradeAnalytics tradePairs={tradePairs} positions={positions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
