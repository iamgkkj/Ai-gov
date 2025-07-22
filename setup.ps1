# AI-Gov Project Setup Script
# This PowerShell script helps set up the AI-Gov project environment

# Function to check if a command exists
function Test-Command {
    param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try { if (Get-Command $command) { return $true } }
    catch { return $false }
    finally { $ErrorActionPreference = $oldPreference }
}

# Print welcome message
Write-Host "\n===== AI-Gov Project Setup =====\n" -ForegroundColor Cyan

# Check for required tools
Write-Host "Checking for required tools..." -ForegroundColor Yellow

$missingTools = @()

if (-not (Test-Command "python")) {
    $missingTools += "Python"
}

if (-not (Test-Command "npm")) {
    $missingTools += "Node.js/npm"
}

if (-not (Test-Command "git")) {
    $missingTools += "Git"
}

if ($missingTools.Count -gt 0) {
    Write-Host "\nThe following required tools are missing:" -ForegroundColor Red
    foreach ($tool in $missingTools) {
        Write-Host " - $tool" -ForegroundColor Red
    }
    Write-Host "\nPlease install these tools and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host "All required tools are installed." -ForegroundColor Green

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "\nCreating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env file. Please edit it with your configuration." -ForegroundColor Green
}

# Set up backend
Write-Host "\nSetting up backend..." -ForegroundColor Yellow
Set-Location -Path "backend"

# Create Python virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment and install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
# Check if virtual environment is already activated
if (-not ($env:VIRTUAL_ENV)) {
    .\venv\Scripts\Activate.ps1
}
pip install -r requirements.txt

# Install Gemini API packages
Write-Host "Installing Gemini API packages..." -ForegroundColor Yellow
pip install google-generativeai langchain-google-genai

# Return to project root
Set-Location -Path ".."

# Set up frontend
Write-Host "\nSetting up frontend..." -ForegroundColor Yellow
Set-Location -Path "frontend"

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

# Return to project root
Set-Location -Path ".."

# Set up smart contracts
Write-Host "\nSetting up smart contracts..." -ForegroundColor Yellow
Set-Location -Path "contracts"

# Check if npm is installed in contracts directory
if (-not (Test-Path "package.json")) {
    Write-Host "Initializing Hardhat project..." -ForegroundColor Yellow
    npm init -y
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    npx hardhat init
}

# Install contract dependencies
Write-Host "Installing contract dependencies..." -ForegroundColor Yellow
npm install

# Return to project root
Set-Location -Path ".."

Write-Host "\n===== Setup Complete =====" -ForegroundColor Cyan
Write-Host "\nNext steps:" -ForegroundColor Yellow
Write-Host "1. Edit the .env file with your configuration" -ForegroundColor White
Write-Host "2. Start the backend server: cd backend && .\venv\Scripts\Activate.ps1 && python run.py" -ForegroundColor White
Write-Host "3. Start the frontend server: cd frontend && node start.js" -ForegroundColor White
Write-Host "4. Deploy smart contracts: cd contracts && npx hardhat run scripts/deploy.js" -ForegroundColor White

Write-Host "\nThank you for using AI-Gov!" -ForegroundColor Green