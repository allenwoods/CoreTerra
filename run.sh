#!/bin/bash

################################################################################
# CoreTerra Development Server Runner
#
# This script starts both the FastAPI backend and React frontend development
# servers concurrently. It handles dependency installation, server startup,
# and graceful shutdown.
#
# Usage: ./run.sh
################################################################################

set -e  # Exit immediately if a command exits with a non-zero status

# Color codes for better output readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Store process IDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""

################################################################################
# Function: Print colored status messages
################################################################################
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

################################################################################
# Function: Cleanup background processes on script exit
################################################################################
cleanup() {
    print_status "Shutting down servers..."

    # Kill backend process if running
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi

    # Kill frontend process if running
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    print_success "All servers stopped. Goodbye!"
}

# Register cleanup function to run on script exit (Ctrl+C, errors, etc.)
trap cleanup EXIT INT TERM

################################################################################
# Step 1: Check prerequisites
################################################################################
print_status "Checking prerequisites..."

# Check if uv is installed (for Python package management)
if ! command -v uv &> /dev/null; then
    print_error "uv is not installed. Please install it first:"
    print_error "  curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Check if node is installed (for frontend)
if ! command -v node &> /dev/null; then
    print_error "node is not installed. Please install Node.js first:"
    print_error "  https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. It should come with Node.js."
    exit 1
fi

print_success "All prerequisites satisfied"
print_status "  - uv: $(uv --version)"
print_status "  - node: $(node --version)"
print_status "  - npm: $(npm --version)"
echo ""

################################################################################
# Step 2: Load environment configuration
################################################################################
print_status "Loading environment configuration..."

# Run load_env.py to generate frontend/.env and export shell variables
# The script uses defaults if ~/.coreterra/config.json doesn't exist
eval $(uv run python backend/scripts/load_env.py)

if [ -f "$HOME/.coreterra/config.json" ]; then
    print_success "Environment loaded from ~/.coreterra/config.json"
else
    print_warning "No config file found at ~/.coreterra/config.json, using defaults"
fi

print_status "  - VITE_API_URL: $VITE_API_URL"
print_status "  - CORETERRA_USER_ID: $CORETERRA_USER_ID"
print_status "  - Generated frontend/.env for Vite"

echo ""

################################################################################
# Step 3: Install backend dependencies
################################################################################
print_status "Setting up backend dependencies..."
cd backend

# Use uv sync to install dependencies and create/update virtual environment
# uv sync automatically:
# - Creates a .venv directory if it doesn't exist
# - Installs all dependencies from pyproject.toml
# - Keeps dependencies in sync with the lock file
print_status "Running uv sync to install/update Python dependencies..."
uv sync

print_success "Backend dependencies installed/synced"

cd ..
echo ""

################################################################################
# Step 4: Install frontend dependencies
################################################################################
print_status "Setting up frontend dependencies..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing Node.js dependencies with npm..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_status "Frontend dependencies already installed, skipping..."
fi

cd ..
echo ""

################################################################################
# Step 5: Start backend server (FastAPI)
################################################################################
print_status "Starting FastAPI backend server on http://localhost:8000..."

cd backend

# Start uvicorn in the background
# --reload: Enable auto-reload on code changes
# --host 0.0.0.0: Listen on all network interfaces
# --port 8000: Use port 8000
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &

# Store the process ID for cleanup
BACKEND_PID=$!

cd ..

# Wait a moment for the backend to start
sleep 2

# Check if backend is still running
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend server started (PID: $BACKEND_PID)"
    print_status "  - API: http://localhost:8000"
    print_status "  - Docs: http://localhost:8000/docs"
    print_status "  - Logs: backend.log"
else
    print_error "Backend server failed to start. Check backend.log for details."
    exit 1
fi

echo ""

################################################################################
# Step 6: Start frontend server (React + Vite)
################################################################################
print_status "Starting React frontend server..."

cd frontend

# Start Vite dev server in the background
# Vite will automatically use port 5173 (default) or next available port
npm run dev > ../frontend.log 2>&1 &

# Store the process ID for cleanup
FRONTEND_PID=$!

cd ..

# Wait a moment for the frontend to start
sleep 3

# Check if frontend is still running
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend server started (PID: $FRONTEND_PID)"
    print_status "  - URL: http://localhost:5173"
    print_status "  - Logs: frontend.log"
else
    print_error "Frontend server failed to start. Check frontend.log for details."
    exit 1
fi

echo ""

################################################################################
# Step 7: Display final status and keep script running
################################################################################
print_success "============================================"
print_success "  CoreTerra Development Environment Ready!"
print_success "============================================"
echo ""
print_status "Backend API:  http://localhost:8000"
print_status "API Docs:     http://localhost:8000/docs"
print_status "Frontend:     http://localhost:5173"
echo ""
print_warning "Press Ctrl+C to stop all servers"
echo ""

# Keep the script running and wait for Ctrl+C
# This allows both background processes to continue running
wait
