import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';

const VotingPanel = () => {
  const { address, isConnected } = useAccount();
  
  const [activeProposals, setActiveProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [delegateActive, setDelegateActive] = useState(false);
  const [delegateStatus, setDelegateStatus] = useState('idle'); // idle, loading, success, error
  const [delegateToggling, setDelegateToggling] = useState(false);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Mock data for now
        // In a real app, this would be an API call like:
        // const response = await axios.get('http://localhost:8000/proposals/active');
        // setActiveProposals(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          const mockProposals = [
            {
              id: 1,
              title: 'Treasury Diversification',
              summary: 'Proposal to diversify DAO treasury into stablecoins and ETH to reduce risk while maintaining upside potential.',
              category: 'Finance',
              riskScore: 3,
              votesFor: 15,
              votesAgainst: 5,
              status: 'active',
              createdAt: '2023-11-15T10:30:00Z',
              aiRecommendation: 'For',
              aiConfidence: 85,
              aiReasoning: 'The diversification strategy is well-balanced and follows treasury management best practices. The gradual implementation reduces market impact risk.'
            },
            {
              id: 2,
              title: 'Community Grants Program',
              summary: 'Establish a grants program to fund community-led initiatives that benefit the ecosystem.',
              category: 'Community',
              riskScore: 4,
              votesFor: 22,
              votesAgainst: 8,
              status: 'active',
              createdAt: '2023-11-12T14:45:00Z',
              aiRecommendation: 'For',
              aiConfidence: 72,
              aiReasoning: 'The grants program has clear guidelines and a reasonable budget. It could drive ecosystem growth and community engagement.'
            },
            {
              id: 3,
              title: 'Protocol Fee Increase',
              summary: 'Increase protocol fees from 0.05% to 0.1% to fund development and marketing initiatives.',
              category: 'Protocol',
              riskScore: 6,
              votesFor: 10,
              votesAgainst: 12,
              status: 'active',
              createdAt: '2023-11-10T09:15:00Z',
              aiRecommendation: 'Against',
              aiConfidence: 65,
              aiReasoning: 'The fee increase could negatively impact user adoption and competitiveness. The proposal lacks detailed analysis of potential volume impact.'
            },
          ];
          
          setActiveProposals(mockProposals);
          setLoading(false);
          
          // Simulate delegate status
          if (isConnected) {
            setDelegateActive(Math.random() > 0.5);
          }
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setError('Failed to load active proposals. Please try again.');
        setLoading(false);
      }
    };

    fetchProposals();
  }, [isConnected]);

  const handleVote = async (proposalId, support) => {
    if (!isConnected) {
      setError('Please connect your wallet to vote.');
      return;
    }
    
    try {
      // In a real app, this would call your smart contract
      // For now, we'll simulate the voting process
      
      // Update the UI optimistically
      setActiveProposals(prev => 
        prev.map(proposal => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              votesFor: support ? proposal.votesFor + 1 : proposal.votesFor,
              votesAgainst: !support ? proposal.votesAgainst + 1 : proposal.votesAgainst,
              userVoted: true,
              userVotedFor: support
            };
          }
          return proposal;
        })
      );
      
      // Actual contract interaction would look like this:
      // const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // const tx = await contract.vote(proposalId, support);
      // await tx.wait();
      
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to submit vote. Please try again.');
    }
  };

  const toggleDelegate = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to configure delegate.');
      return;
    }
    
    try {
      setDelegateToggling(true);
      setDelegateStatus('loading');
      
      // Simulate API delay
      setTimeout(() => {
        setDelegateActive(!delegateActive);
        setDelegateStatus('success');
        setDelegateToggling(false);
        
        // Reset status after a delay
        setTimeout(() => {
          setDelegateStatus('idle');
        }, 3000);
      }, 1500);
      
      // Actual contract interaction would look like this:
      // const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // const tx = await contract.setDelegate(delegateAddress, !delegateActive);
      // await tx.wait();
      // setDelegateActive(!delegateActive);
      
    } catch (error) {
      console.error('Error toggling delegate:', error);
      setDelegateStatus('error');
      setDelegateToggling(false);
      
      // Reset status after a delay
      setTimeout(() => {
        setDelegateStatus('idle');
      }, 3000);
    }
  };

  const getRiskBadgeClass = (score) => {
    if (score <= 3) return 'badge-risk-low';
    if (score <= 6) return 'badge-risk-medium';
    return 'badge-risk-high';
  };

  const getConfidenceBadgeClass = (confidence) => {
    if (confidence >= 80) return 'bg-green-900/30 text-green-400 border-green-700';
    if (confidence >= 60) return 'bg-yellow-900/30 text-yellow-400 border-yellow-700';
    return 'bg-red-900/30 text-red-400 border-red-700';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading voting panel...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Voting Panel</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-2">AI Delegate:</span>
            <button 
              onClick={toggleDelegate}
              disabled={delegateToggling || !isConnected}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${delegateActive ? 'bg-primary' : 'bg-gray-700'}`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${delegateActive ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          <Link to="/delegate" className="btn-secondary text-sm">
            Configure Delegate
          </Link>
        </div>
      </div>
      
      {delegateStatus === 'loading' && (
        <div className="mb-6 p-3 bg-blue-900/30 border border-blue-700 rounded-md text-blue-300">
          Updating delegate status...
        </div>
      )}
      
      {delegateStatus === 'success' && (
        <div className="mb-6 p-3 bg-green-900/30 border border-green-700 rounded-md text-green-300">
          AI Delegate {delegateActive ? 'activated' : 'deactivated'} successfully!
        </div>
      )}
      
      {delegateStatus === 'error' && (
        <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300">
          Failed to update delegate status. Please try again.
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300">
          {error}
        </div>
      )}
      
      {!isConnected ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 mb-4">Connect your wallet to view and vote on active proposals.</p>
        </div>
      ) : activeProposals.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 mb-4">No active proposals found.</p>
          <Link to="/submit" className="btn-primary">
            Submit a Proposal
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {delegateActive && (
            <div className="card bg-primary-dark border-primary mb-6">
              <div className="flex items-start">
                <div className="bg-primary/20 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-1">AI Delegate Active</h2>
                  <p className="text-sm text-gray-300">
                    Your AI delegate is currently active and will vote on your behalf according to your preferences. 
                    You can still manually vote on any proposal to override your delegate's vote.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeProposals.map(proposal => (
            <div key={proposal.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link to={`/proposal/${proposal.id}`} className="text-xl font-semibold hover:text-primary">
                    {proposal.title}
                  </Link>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="badge bg-background text-gray-300 border border-gray-700">
                      {proposal.category}
                    </span>
                    <span className={getRiskBadgeClass(proposal.riskScore)}>
                      Risk: {proposal.riskScore}/10
                    </span>
                  </div>
                </div>
                
                {proposal.userVoted && (
                  <div className="badge bg-blue-900/50 text-blue-300 border-blue-700">
                    You voted {proposal.userVotedFor ? 'For' : 'Against'}
                  </div>
                )}
              </div>
              
              <p className="mb-4">{proposal.summary}</p>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Current Results</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-500">
                      {proposal.votesFor} For ({Math.round((proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100)}%)
                    </span>
                    <span className="text-red-500">
                      {proposal.votesAgainst} Against ({Math.round((proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-background-light rounded-full h-2.5 mb-4 overflow-hidden">
                  <div 
                    className="bg-primary h-2.5" 
                    style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {delegateActive && (
                <div className="mb-4 p-3 bg-background-light rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium mb-1">AI Delegate Recommendation</h3>
                      <div className="flex items-center">
                        <span className={`mr-2 ${proposal.aiRecommendation === 'For' ? 'text-green-500' : 'text-red-500'}`}>
                          Vote {proposal.aiRecommendation}
                        </span>
                        <span className={`badge text-xs ${getConfidenceBadgeClass(proposal.aiConfidence)}`}>
                          {proposal.aiConfidence}% confidence
                        </span>
                      </div>
                    </div>
                    <button 
                      className="text-xs text-primary hover:text-primary-dark"
                      onClick={() => document.getElementById(`ai-reasoning-${proposal.id}`).classList.toggle('hidden')}
                    >
                      Show reasoning
                    </button>
                  </div>
                  <div id={`ai-reasoning-${proposal.id}`} className="hidden mt-2 text-sm text-gray-400">
                    {proposal.aiReasoning}
                  </div>
                </div>
              )}
              
              {!proposal.userVoted && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleVote(proposal.id, true)}
                    className="btn bg-green-700 hover:bg-green-800 text-white flex-1"
                  >
                    Vote For
                  </button>
                  
                  <button
                    onClick={() => handleVote(proposal.id, false)}
                    className="btn bg-red-700 hover:bg-red-800 text-white flex-1"
                  >
                    Vote Against
                  </button>
                  
                  <Link to={`/proposal/${proposal.id}`} className="btn-secondary">
                    Details
                  </Link>
                </div>
              )}
              
              {proposal.userVoted && (
                <div className="flex justify-end">
                  <Link to={`/proposal/${proposal.id}`} className="btn-secondary">
                    View Details
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VotingPanel;