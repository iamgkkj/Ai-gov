import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, polygon, hardhat } from 'wagmi/chains';
import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { publicProvider } from 'wagmi/providers/public';
import '@rainbow-me/rainbowkit/styles.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Dashboard from './pages/Dashboard';
import SubmitProposal from './pages/SubmitProposal';
import ProposalFeed from './pages/ProposalFeed';
import ProposalDetail from './pages/ProposalDetail';
import VotingPanel from './pages/VotingPanel';
import DelegateSetup from './pages/DelegateSetup';

// Configure wagmi & rainbowkit
const { chains, publicClient } = configureChains(
  [mainnet, polygon, hardhat],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'AI-Gov',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/submit" element={<SubmitProposal />} />
                <Route path="/proposals" element={<ProposalFeed />} />
                <Route path="/proposal/:id" element={<ProposalDetail />} />
                <Route path="/vote" element={<VotingPanel />} />
                <Route path="/delegate" element={<DelegateSetup />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;