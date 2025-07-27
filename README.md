# 📊 Tradescope

> **Real-time stock portfolio tracking with FIFO cost basis and comprehensive analytics**

A modern, responsive web application for tracking stock portfolio performance with advanced features like FIFO cost basis calculations, real-time market data integration, and detailed trade analytics.

## ✨ Features

- **📈 Real-time Portfolio Tracking** - Live market data integration
- **🎯 FIFO Cost Basis** - Accurate profit/loss calculations
- **📊 Trade Analytics** - Detailed buy/sell pair analysis
- **💾 CSV Import** - Support for broker export files
- **📱 Responsive Design** - Works on desktop and mobile
- **🎨 Modern UI** - Beautiful gradients and intuitive design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tradescope

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
tradescope/
├── src/
│   ├── components/          # React components
│   ├── utils/              # Business logic
│   ├── types/              # TypeScript definitions
│   └── assets/             # Static assets
├── docs/                   # Documentation
├── public/                 # Public assets
└── package.json
```

## 🔧 Core Features

### CSV Import & Processing
- Supports broker CSV exports (Robinhood, TD Ameritrade, etc.)
- Automatic transaction type detection
- FIFO cost basis calculation
- Real-time data validation

### Portfolio Analytics
- **Realized P&L** - Profit/loss from closed positions
- **Unrealized P&L** - Current position performance
- **Trade Pairs** - Buy/sell matching with holding periods
- **Position Tracking** - Current holdings with average cost

### Market Data Integration
- Real-time stock prices via Alpha Vantage API
- Automatic price updates
- Historical performance tracking

## 📊 Supported Data Formats

The dashboard processes CSV files with the following structure:

```csv
"Activity Date","Process Date","Settle Date","Instrument","Description","Trans Code","Quantity","Price","Amount"
"7/24/2025","7/24/2025","7/25/2025","DNUT","Krispy Kreme","Sell","111","$4.28","$475.33"
```

### Transaction Types
- **BUY/SELL** - Stock trades
- **CDIV** - Dividend payments
- **AFEE/GOLD** - Account fees
- **RTP** - Deposits/withdrawals
- **SOFF** - Corporate actions

## 🎯 Key Calculations

### FIFO Cost Basis
- First-in, first-out inventory method
- Accurate realized P&L calculations
- Proper tax basis tracking

### Price Calculations
- **BUY**: `cost_per = (−Amount) / Quantity`
- **SELL**: `sell_per = Amount / Quantity`
- Uses Amount as source of truth

### Portfolio Metrics
- Total invested amount
- Realized vs unrealized gains/losses
- Position-specific performance
- Trade pair analytics

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Data Processing**: Papa Parse
- **Market Data**: Alpha Vantage API
- **Charts**: Custom SVG components

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api.md)
- [Data Processing](docs/data-processing.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by professional trading platforms
- Designed for accuracy and usability

## 📄 Copyright

© 2025 Nikesh Ghimire. All rights reserved.

This software is provided "as is" without warranty of any kind, either express or implied. The author assumes no responsibility for any damages or losses that may result from the use of this software.

---

**Made with ❤️ for accurate portfolio tracking** 