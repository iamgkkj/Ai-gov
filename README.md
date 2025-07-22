# AI-Gov: AI-Powered DAO Governance Tool

AI-Gov is a decentralized governance platform that combines Smart Contracts and AI to enhance the DAO proposal and voting process. The platform allows users to submit proposals, have them analyzed by AI (generating summaries, risk scores, and classifications), and enables AI-powered delegates to vote on behalf of users based on their preferences.

## Features

- **Smart Contract-based Governance**: Submit proposals and vote on-chain
- **AI Analysis**: Automatic TL;DR, risk scoring, and categorization of proposals
- **AI Delegates**: Configure AI to vote on your behalf based on your preferences
- **IPFS Storage**: Store full proposal content on IPFS for decentralization
- **Modern UI**: React frontend with TailwindCSS, Wagmi, and RainbowKit

## Tech Stack

### Frontend
- React
- TailwindCSS
- Wagmi (Ethereum interactions)
- RainbowKit (Wallet connection)

### Backend
- FastAPI (Python)
- LangChain
- Google Gemini API
- PostgreSQL

### Blockchain
- Solidity Smart Contracts
- Hardhat
- IPFS

## Project Structure

```
ai-gov/
├── contracts/            # Solidity smart contracts
│   └── AIGov.sol         # Main governance contract
├── backend/              # FastAPI backend
│   ├── main.py           # API endpoints and business logic
│   └── requirements.txt  # Python dependencies
├── frontend/            # React frontend
│   ├── src/              # React source code
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── App.js        # Main application component
│   │   └── index.js      # Entry point
│   ├── package.json      # Node dependencies
│   └── tailwind.config.js # TailwindCSS configuration
└── README.md            # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js and npm
- Python 3.8+
- PostgreSQL
- IPFS node (optional for development)

### Automated Setup (Windows)

We provide a PowerShell script to automate the setup process:

```powershell
.\setup.ps1
```

This script will:
1. Check for required tools
2. Create a `.env` file from `.env.example` if it doesn't exist
3. Set up the backend (create virtual environment, install dependencies)
4. Set up the frontend (install dependencies)
5. Set up the smart contracts (initialize Hardhat project if needed)

### Manual Setup

#### Smart Contract Setup
1. Navigate to the contracts directory
   ```
   cd contracts
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Compile contracts
   ```
   npx hardhat compile
   ```
4. Deploy to local network
   ```
   npx hardhat run scripts/deploy.js --network localhost
   ```

#### Backend Setup
1. Navigate to the backend directory
   ```
   cd backend
   ```
2. Create a virtual environment
   ```
   python -m venv venv
   ```
3. Activate the virtual environment
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies
   ```
   pip install -r requirements.txt
   ```
5. Copy `.env.example` to `.env` and update with your configuration:
   ```
   DATABASE_URL=postgresql://user:password@localhost/aigov
   OPENAI_API_KEY=your_gemini_api_key  # Despite the name, this is used for Gemini API
   CONTRACT_ADDRESS=your_deployed_contract_address
   ```

#### Gemini API Setup
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add your API key to the `.env` file in the `OPENAI_API_KEY` field (we use this variable name for compatibility)
3. Make sure your API key is valid and has access to the Gemini Pro model

#### Database Setup
1. The application is configured to use PostgreSQL by default
2. If PostgreSQL is not available, the application will automatically fall back to an in-memory SQLite database for development
3. For production, make sure to set up a PostgreSQL database and update the `DATABASE_URL` in your `.env` file
6. Run the backend server using the provided script
   ```
   python run.py
   ```

### Python Virtual Environment Usage

To ensure all Python dependencies are isolated and managed correctly, we use a virtual environment. The `setup.ps1` script automatically creates and activates this environment during setup.

- **Activating the Virtual Environment (Windows):**
  ```powershell
  .\backend\venv\Scripts\Activate.ps1
  ```

- **Deactivating the Virtual Environment:**
  ```powershell
  deactivate
  ```

Always activate the virtual environment before running any backend Python commands (e.g., `python run.py` or `pip install`).

#### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd frontend
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Run the frontend development server using the provided script
   ```
   node start.js
   ```

## Running the Application

1. Start a local blockchain node (if testing locally)
   ```
   npx hardhat node
   ```

2. Deploy the smart contract
   ```
   cd contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. Start the backend server
   ```
   cd backend
   python run.py
   ```

4. Start the frontend development server
   ```
   cd frontend
   node start.js
   ```

5. Open your browser and navigate to http://localhost:3000
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd frontend
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
   ```
4. Start the development server
   ```
   npm start
   ```

## Usage

1. Connect your wallet using the RainbowKit connect button
2. Submit a proposal through the submission form
3. View the AI-generated summary, risk score, and category
4. Vote on proposals or configure an AI delegate to vote on your behalf

## License

MIT