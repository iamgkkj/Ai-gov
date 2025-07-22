import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProposalFeed = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, executed
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all'); // all, low, medium, high

  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchProposals = async () => {
      try {
        setLoading(true);
        // Mock data for now
        const mockProposals = [
          {
            id: 1,
            title: 'Treasury Diversification',
            summary: 'Proposal to diversify DAO treasury into stablecoins and ETH.',
            category: 'Finance',
            riskScore: 3,
            votesFor: 15,
            votesAgainst: 5,
            status: 'active',
            createdAt: '2023-11-15T10:30:00Z',
          },
          {
            id: 2,
            title: 'Community Grants Program',
            summary: 'Establish a grants program to fund community-led initiatives.',
            category: 'Governance',
            riskScore: 2,
            votesFor: 25,
            votesAgainst: 2,
            status: 'active',
            createdAt: '2023-11-10T14:20:00Z',
          },
          {
            id: 3,
            title: 'Protocol Upgrade v2.5',
            summary: 'Implement new features and security improvements.',
            category: 'Technical',
            riskScore: 7,
            votesFor: 18,
            votesAgainst: 12,
            status: 'active',
            createdAt: '2023-11-05T09:15:00Z',
          },
          {
            id: 4,
            title: 'Marketing Budget Allocation',
            summary: 'Allocate funds for Q1 2024 marketing initiatives.',
            category: 'Finance',
            riskScore: 4,
            votesFor: 30,
            votesAgainst: 10,
            status: 'executed',
            createdAt: '2023-10-28T11:45:00Z',
          },
          {
            id: 5,
            title: 'Governance Process Improvement',
            summary: 'Streamline the proposal submission and voting process.',
            category: 'Governance',
            riskScore: 1,
            votesFor: 40,
            votesAgainst: 5,
            status: 'executed',
            createdAt: '2023-10-20T16:30:00Z',
          },
          {
            id: 6,
            title: 'Partnership with DeFi Protocol',
            summary: 'Establish strategic partnership with leading DeFi protocol.',
            category: 'Partnerships',
            riskScore: 6,
            votesFor: 22,
            votesAgainst: 18,
            status: 'active',
            createdAt: '2023-11-18T08:00:00Z',
          },
        ];

        setProposals(mockProposals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const getRiskBadgeClass = (score) => {
    if (score <= 3) return 'badge-risk-low';
    if (score <= 6) return 'badge-risk-medium';
    return 'badge-risk-high';
  };

  const getRiskLevel = (score) => {
    if (score <= 3) return 'low';
    if (score <= 6) return 'medium';
    return 'high';
  };

  const filteredProposals = proposals.filter((proposal) => {
    // Status filter
    if (filter !== 'all' && proposal.status !== filter) return false;
    
    // Category filter
    if (categoryFilter !== 'all' && proposal.category !== categoryFilter) return false;
    
    // Risk filter
    if (riskFilter !== 'all' && getRiskLevel(proposal.riskScore) !== riskFilter) return false;
    
    return true;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(proposals.map(p => p.category))];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Proposals</h1>
        <Link to="/submit" className="btn-primary">
          Submit New Proposal
        </Link>
      </div>

      <div className="card mb-8">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-400 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input bg-background-light text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="executed">Executed</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-400 mb-1">
              Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input bg-background-light text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="risk-filter" className="block text-sm font-medium text-gray-400 mb-1">
              Risk Level
            </label>
            <select
              id="risk-filter"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="input bg-background-light text-white"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk (1-3)</option>
              <option value="medium">Medium Risk (4-6)</option>
              <option value="high">High Risk (7-10)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Loading proposals...</p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400">No proposals found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="card hover:border hover:border-primary/30 transition-all">
              <Link to={`/proposal/${proposal.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl">{proposal.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-400">
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </span>
                      <span className="badge bg-background text-gray-300 border border-gray-700">
                        {proposal.category}
                      </span>
                      <span className={`badge ${proposal.status === 'active' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'}`}>
                        {proposal.status === 'active' ? 'Active' : 'Executed'}
                      </span>
                    </div>
                  </div>
                  <span className={getRiskBadgeClass(proposal.riskScore)}>
                    Risk: {proposal.riskScore}/10
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{proposal.summary}</p>
                <div className="flex justify-between items-center">
                  <div className="w-full max-w-xs bg-background-light rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-2.5" 
                      style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                    ></div>
                  </div>
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
  );
};

export default ProposalFeed;