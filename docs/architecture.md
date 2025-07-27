# 🏗️ Architecture Overview

The Portfolio P&L Dashboard is built as a modern single-page application with a focus on real-time data processing and accurate financial calculations.

## System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Components]
        State[State Management]
        Utils[Business Logic]
    end
    
    subgraph "Data Processing Layer"
        CSV[CSV Parser]
        FIFO[FIFO Calculator]
        Positions[Position Calculator]
        Analytics[Trade Analytics]
    end
    
    subgraph "External Services"
        MarketAPI[Alpha Vantage API]
        FileSystem[File System]
    end
    
    subgraph "Data Flow"
        CSV --> FIFO
        CSV --> Positions
        FIFO --> Analytics
        Positions --> State
        Analytics --> State
        State --> UI
        MarketAPI --> State
        FileSystem --> CSV
    end
    
    UI --> State
    State --> Utils
    Utils --> CSV
    Utils --> FIFO
    Utils --> Positions
    Utils --> Analytics
```

## Component Architecture

```mermaid
graph LR
    subgraph "App Component"
        App[App.tsx]
        Upload[CSVUpload]
        Summary[PortfolioSummary]
        Positions[PositionsTable]
        Analytics[TradeAnalytics]
    end
    
    subgraph "State Management"
        Trades[Trade State]
        PositionsState[Positions State]
        Pairs[Trade Pairs]
        SummaryState[Summary State]
    end
    
    subgraph "Business Logic"
        Parser[CSV Parser]
        FIFO[FIFO Calculator]
        PositionsCalc[Position Calculator]
        MarketData[Market Data Service]
    end
    
    App --> Upload
    App --> Summary
    App --> Positions
    App --> Analytics
    
    Upload --> Parser
    Parser --> FIFO
    Parser --> PositionsCalc
    FIFO --> Pairs
    PositionsCalc --> PositionsState
    MarketData --> PositionsState
    
    Summary --> SummaryState
    Positions --> PositionsState
    Analytics --> Pairs
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant CSVUpload
    participant Parser
    participant FIFO
    participant Positions
    participant MarketData
    participant UI
    
    User->>CSVUpload: Upload CSV File
    CSVUpload->>Parser: Parse CSV Data
    Parser->>FIFO: Calculate Trade Pairs
    Parser->>Positions: Calculate Positions
    FIFO->>UI: Trade Pairs Data
    Positions->>MarketData: Get Current Prices
    MarketData->>Positions: Market Data
    Positions->>UI: Updated Positions
    UI->>User: Display Dashboard
```

## Data Processing Pipeline

```mermaid
flowchart TD
    A[CSV File Upload] --> B[Parse CSV Data]
    B --> C[Validate Transaction Types]
    C --> D[Calculate Prices from Amount]
    D --> E[Sort by Symbol, Date, BUY before SELL]
    E --> F[Apply FIFO Cost Basis]
    F --> G[Calculate Trade Pairs]
    F --> H[Calculate Current Positions]
    G --> I[Realized P&L]
    H --> J[Unrealized P&L]
    I --> K[Portfolio Summary]
    J --> K
    K --> L[Dashboard Display]
```

## Key Design Principles

### 1. **Data Accuracy First**
- Uses Amount as source of truth
- FIFO cost basis for accurate tax calculations
- Proper handling of transaction types

### 2. **Real-time Processing**
- Client-side data processing for immediate feedback
- Market data integration for live prices
- Responsive UI updates

### 3. **Modular Architecture**
- Separation of concerns between UI and business logic
- Reusable components
- Type-safe data handling

### 4. **Performance Optimization**
- Efficient CSV parsing with Papa Parse
- Optimized FIFO calculations
- Minimal re-renders with React

## Technology Decisions

### **Frontend Framework: React + TypeScript**
- **Why**: Type safety, component reusability, large ecosystem
- **Benefits**: Better developer experience, fewer runtime errors

### **Build Tool: Vite**
- **Why**: Fast development server, optimized builds
- **Benefits**: Hot module replacement, quick iteration

### **Styling: Tailwind CSS**
- **Why**: Utility-first approach, consistent design system
- **Benefits**: Rapid development, responsive design

### **Data Processing: Custom Utils**
- **Why**: Specific financial calculations require custom logic
- **Benefits**: Full control over accuracy and performance

## Scalability Considerations

### **Current Architecture**
- Single-page application
- Client-side processing
- Real-time market data

### **Future Enhancements**
- Backend API for data persistence
- Database for historical data
- WebSocket for real-time updates
- Multi-user support

## Security Considerations

### **Data Privacy**
- All processing happens client-side
- No data sent to external servers (except market data)
- CSV files processed locally

### **API Security**
- Alpha Vantage API key management
- Rate limiting for market data requests
- Secure HTTPS connections

## Performance Metrics

### **Target Performance**
- CSV processing: < 2 seconds for 1000+ trades
- Dashboard rendering: < 500ms
- Market data updates: < 1 second

### **Optimization Strategies**
- Efficient FIFO algorithms
- Memoized calculations
- Lazy loading of components
- Optimized re-renders

## Monitoring & Debugging

### **Development Tools**
- React Developer Tools
- TypeScript strict mode
- Console logging for data flow
- Error boundaries for graceful failures

### **Production Monitoring**
- Error tracking (future)
- Performance monitoring (future)
- User analytics (future) 