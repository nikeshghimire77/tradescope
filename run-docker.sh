#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    print_status "Visit https://docs.docker.com/get-docker/ for installation instructions."
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

IMAGE_NAME="portfolio-pnl-dashboard"
CONTAINER_NAME="portfolio-pnl-dashboard"
PORT=3000

print_status "Building Docker image..."
docker build -t $IMAGE_NAME .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully!"
else
    print_error "Failed to build Docker image."
    exit 1
fi

print_status "Checking for existing container..."
if docker ps -a --format "table {{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    print_warning "Found existing container. Stopping and removing it..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
fi

print_status "Starting the application..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:80 \
    --restart unless-stopped \
    $IMAGE_NAME

if [ $? -eq 0 ]; then
    print_success "Application started successfully!"
    echo ""
    print_status "Your Portfolio PnL Dashboard is now running at:"
    echo -e "${GREEN}http://localhost:$PORT${NC}"
    echo ""
    print_status "To stop the application, run:"
    echo -e "${YELLOW}docker stop $CONTAINER_NAME${NC}"
    echo ""
    print_status "To view logs, run:"
    echo -e "${YELLOW}docker logs $CONTAINER_NAME${NC}"
    echo ""
    print_status "To remove the container, run:"
    echo -e "${YELLOW}docker rm $CONTAINER_NAME${NC}"
else
    print_error "Failed to start the application."
    exit 1
fi 