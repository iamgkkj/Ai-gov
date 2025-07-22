import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import axios from 'axios';

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    yourProposals: 0,
    yourVotes: 0,
  });
  const [recentProposals, setRecentProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Mock data for now
        setStats({
          totalProposals: 12,
          activeProposals: 5,
          yourProposals: isConnected ? 2 : 0,
          yourVotes: isConnected ? 8 : 0,
        });

        setRecentProposals([
          {
            id: 1,
            title: 'Treasury Diversification',
            summary: 'Proposal to diversify DAO treasury into stablecoins and ETH.',
            category: 'Finance',
            riskScore: 3,
            votesFor: 15,
            votesAgainst: 5,
          },
          {
            id: 2,
            title: 'Community Grants Program',
            summary: 'Establish a grants program to fund community-led initiatives.',
            category: 'Governance',
            riskScore: 2,
            votesFor: 25,
            votesAgainst: 2,
          },
          {
            id: 3,
            title: 'Protocol Upgrade v2.5',
            summary: 'Implement new features and security improvements.',
            category: 'Technical',
            riskScore: 7,
            votesFor: 18,
            votesAgainst: 12,
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isConnected]);

  const getRiskBadgeClass = (score) => {
    if (score <= 3) return 'badge-risk-low';
    if (score <= 6) return 'badge-risk-medium';
    return 'badge-risk-high';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Dashboard</h1>
        <Link to="/submit" className="btn-primary">
          Submit New Proposal
        </Link>
      </div>

      {!isConnected ? (
        <div className="card mb-8 border border-primary/30 bg-primary/5">
          <div className="text-center py-4">
            <h3 className="text-xl mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 mb-4">
              Connect your wallet to submit proposals and vote on governance decisions.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-400 text-sm mb-1">Total Proposals</h3>
          <p className="text-3xl font-bold">{stats.totalProposals}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-sm mb-1">Active Proposals</h3>
          <p className="text-3xl font-bold">{stats.activeProposals}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-sm mb-1">Your Proposals</h3>
          <p className="text-3xl font-bold">{stats.yourProposals}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-400 text-sm mb-1">Your Votes</h3>
          <p className="text-3xl font-bold">{stats.yourVotes}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2>Recent Proposals</h2>
          <Link to="/proposals" className="text-primary hover:text-primary-dark">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProposals.map((proposal) => (
              <div key={proposal.id} className="card hover:border hover:border-primary/30 transition-all">
                <Link to={`/proposal/${proposal.id}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl">{proposal.title}</h3>
                    <span className={getRiskBadgeClass(proposal.riskScore)}>
                      Risk: {proposal.riskScore}/10
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4">{proposal.summary}</p>
                  <div className="flex justify-between items-center">
                    <span className="badge bg-background text-gray-300 border border-gray-700">
                      {proposal.category}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-green-500">
                        {proposal.votesFor} For
                      </span>
                      <span className="text-red-500">
                        {proposal.votesAgainst} Against
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2>AI Delegate Status</h2>
          <Link to="/delegate" className="text-primary hover:text-primary-dark">
            Configure
          </Link>
        </div>

        <div className="card">
          {isConnected ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">Your AI Delegate</h3>
                  <p className="text-gray-400">
                    Your AI delegate is configured to vote based on your preferences.
                  </p>
                </div>
                <div className="badge bg-green-900 text-green-200">Active</div>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm text-gray-400 mb-1">Voting Preferences</h4>
                  <div className="flex space-x-2">
                    <span className="badge bg-background text-gray-300 border border-gray-700">Conservative</span>
                    <span className="badge bg-background text-gray-300 border border-gray-700">Technical</span>
                    <span className="badge bg-background text-gray-300 border border-gray-700">Community-focused</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400 mb-1">Recent Activity</h4>
                  <p className="text-sm">Voted on 3 proposals in the last 7 days</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">
                Connect your wallet to view and configure your AI delegate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;