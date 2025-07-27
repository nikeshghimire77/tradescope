# 🚀 Deployment Guide

This guide covers deploying the Portfolio P&L Dashboard to various environments, from local development to production.

## 📋 Prerequisites

### Development Environment
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: For version control

### Production Environment
- **Web Server**: Nginx, Apache, or CDN
- **SSL Certificate**: For HTTPS
- **Domain**: Custom domain (optional)

## 🛠️ Local Development

### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd portfolio-pnl-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Scripts
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Variables
Create a `.env.local` file for local development:

```bash
# Alpha Vantage API (optional for development)
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here

# Development settings
VITE_DEV_MODE=true
VITE_ENABLE_LOGGING=true
```

## 🌐 Production Deployment

### Option 1: Static Hosting (Recommended)

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Follow the prompts to configure your project
```

**Configuration:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

**Configuration:**
- Build Command: `npm run build`
- Publish Directory: `dist`
- Node Version: 18

#### GitHub Pages
```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Option 2: Traditional Web Server

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/portfolio-dashboard;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/portfolio-dashboard

    <Directory /var/www/portfolio-dashboard>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Handle client-side routing
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [QSA,L]
</VirtualHost>
```

### Option 3: Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  portfolio-dashboard:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
```

#### Build and Deploy
```bash
# Build Docker image
docker build -t portfolio-dashboard .

# Run container
docker run -p 80:80 portfolio-dashboard

# Or with Docker Compose
docker-compose up -d
```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# Required for market data
VITE_ALPHA_VANTAGE_API_KEY=your_production_api_key

# Optional settings
VITE_APP_NAME=Portfolio Dashboard
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['papaparse', 'date-fns']
        }
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
```

## 🔒 Security Considerations

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://www.alphavantage.co;">
```

### Security Headers
```nginx
# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

### API Key Management
```typescript
// Store API keys securely
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

if (!API_KEY) {
  console.warn('Alpha Vantage API key not configured');
}
```

## 📊 Performance Optimization

### Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Enable compression
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['papaparse', 'date-fns']
        }
      }
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### Caching Strategy
```nginx
# Nginx caching configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

### CDN Configuration
```typescript
// Use CDN for static assets
const CDN_URL = 'https://your-cdn.com';

// Configure asset loading
const assetUrl = (path: string) => {
  return process.env.NODE_ENV === 'production' 
    ? `${CDN_URL}${path}` 
    : path;
};
```

## 🔍 Monitoring & Analytics

### Error Tracking
```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send to error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

### Performance Monitoring
```typescript
// Performance metrics
const reportPerformance = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart);
  }
};
```

### User Analytics
```typescript
// Google Analytics (optional)
const trackEvent = (eventName: string, parameters: object) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
};
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Issue 1: Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Build with verbose output
npm run build --verbose
```

#### Issue 2: Routing Problems
```nginx
# Ensure client-side routing works
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Issue 3: API Key Issues
```typescript
// Check API key configuration
if (!import.meta.env.VITE_ALPHA_VANTAGE_API_KEY) {
  console.error('API key not configured');
  // Disable market data features
}
```

### Performance Issues

#### Slow Loading
- Enable gzip compression
- Optimize bundle size
- Use CDN for static assets
- Implement lazy loading

#### Memory Leaks
- Check for event listener cleanup
- Monitor component unmounting
- Use React DevTools profiler

## 📈 Scaling Considerations

### Current Architecture
- Single-page application
- Client-side processing
- Static file hosting

### Future Scaling Options
- Backend API for data persistence
- Database for historical data
- WebSocket for real-time updates
- Microservices architecture

### Load Testing
```bash
# Install load testing tool
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://your-domain.com
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Environment-Specific Deployments
```bash
# Staging deployment
npm run build:staging
npm run deploy:staging

# Production deployment
npm run build:production
npm run deploy:production
```

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#production-build)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/) 