import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import axios from 'axios';

const ProposalDetail = () => {
  const { id } = useParams();
  const { address, isConnected } = useAccount();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voteStatus, setVoteStatus] = useState(null); // null, 'for', 'against'
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Mock data for now
        // In a real app, this would be an API call like:
        // const response = await axios.get(`http://localhost:8000/proposal/${id}`);
        // setProposal(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          const mockProposal = {
            id: parseInt(id),
            title: 'Treasury Diversification',
            description: 'This proposal aims to diversify the DAO treasury by allocating funds across different assets to reduce risk and maximize potential returns.\n\nCurrently, our treasury is heavily concentrated in our native token, which exposes us to significant volatility and risk. By diversifying into stablecoins (30%), ETH (30%), and maintaining 40% in our native token, we can better weather market downturns while still maintaining significant upside exposure.\n\nThe proposed allocation is:\n- 40% Native Token\n- 30% ETH\n- 20% USDC\n- 10% DAI\n\nThis diversification will be executed gradually over 4 weeks to minimize market impact.',
            ipfsHash: 'QmT8e1fvnEMjnfHxQvAHF1mCXm1uMxgvQGiHz8qYbQVf3Z',
            summary: 'Proposal to diversify DAO treasury into stablecoins and ETH to reduce risk while maintaining upside potential.',
            category: 'Finance',
            riskScore: 3,
            votesFor: 15,
            votesAgainst: 5,
            status: 'active',
            createdAt: '2023-11-15T10:30:00Z',
            proposer: '0x1234...5678',
            aiExplanation: 'This proposal has been classified as Finance with a low risk score of 3/10. The low risk assessment is based on the conservative approach to treasury management and the gradual implementation timeline which reduces market impact risk. The diversification strategy aligns with best practices in treasury management for DAOs.',
          };
          
          setProposal(mockProposal);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching proposal:', error);
        setError('Failed to load proposal. Please try again.');
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  const handleVote = async (support) => {
    if (!isConnected) {
      setError('Please connect your wallet to vote.');
      return;
    }
    
    try {
      setIsVoting(true);
      setError('');
      
      // In a real app, this would call your smart contract
      // For now, we'll simulate the voting process
      setTimeout(() => {
        setVoteStatus(support ? 'for' : 'against');
        setVoteSuccess(true);
        setIsVoting(false);
        
        // Update the vote count in the UI
        setProposal(prev => ({
          ...prev,
          votesFor: support ? prev.votesFor + 1 : prev.votesFor,
          votesAgainst: !support ? prev.votesAgainst + 1 : prev.votesAgainst,
        }));
      }, 1500);
      
      // Actual contract interaction would look like this:
      // const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // const tx = await contract.vote(id, support);
      // await tx.wait();
      // setVoteStatus(support ? 'for' : 'against');
      // setVoteSuccess(true);
      
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to submit vote. Please try again.');
      setIsVoting(false);
    }
  };

  const getRiskBadgeClass = (score) => {
    if (score <= 3) return 'badge-risk-low';
    if (score <= 6) return 'badge-risk-medium';
    return 'badge-risk-high';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading proposal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/proposals" className="btn-primary">
          Back to Proposals
        </Link>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-400 mb-4">Proposal not found.</p>
        <Link to="/proposals" className="btn-primary">
          Back to Proposals
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/proposals" className="text-primary hover:text-primary-dark flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Proposals
        </Link>
      </div>

      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{proposal.title}</h1>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                Proposed on {new Date(proposal.createdAt).toLocaleDateString()}
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
            Risk Score: {proposal.riskScore}/10
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">AI Summary</h2>
          <div className="bg-background p-4 rounded-md border border-gray-800 mb-2">
            <p>{proposal.summary}</p>
          </div>
          <div className="bg-background p-4 rounded-md border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-1">AI Explanation</h3>
            <p className="text-sm">{proposal.aiExplanation}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Full Description</h2>
          <div className="bg-background p-4 rounded-md border border-gray-800 whitespace-pre-line">
            {proposal.description}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Voting Status</h2>
          <div className="bg-background p-4 rounded-md border border-gray-800">
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
        </div>

        {proposal.status === 'active' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Cast Your Vote</h2>
            
            {!isConnected ? (
              <div className="bg-background p-4 rounded-md border border-gray-800 text-center">
                <p className="text-gray-400 mb-4">Connect your wallet to vote on this proposal.</p>
              </div>
            ) : voteSuccess ? (
              <div className="bg-background p-4 rounded-md border border-gray-800 text-center">
                <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-1">Vote Submitted!</p>
                <p className="text-gray-400">
                  You voted {voteStatus === 'for' ? 'FOR' : 'AGAINST'} this proposal.
                </p>
              </div>
            ) : (
              <div className="bg-background p-4 rounded-md border border-gray-800">
                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200">
                    {error}
                  </div>
                )}
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleVote(true)}
                    className="btn bg-green-700 hover:bg-green-800 text-white"
                    disabled={isVoting}
                  >
                    {isVoting ? 'Submitting...' : 'Vote For'}
                  </button>
                  
                  <button
                    onClick={() => handleVote(false)}
                    className="btn bg-red-700 hover:bg-red-800 text-white"
                    disabled={isVoting}
                  >
                    {isVoting ? 'Submitting...' : 'Vote Against'}
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <Link to="/delegate" className="text-primary hover:text-primary-dark text-sm">
                    Configure AI Delegate to vote on your behalf
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">On-Chain Information</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Proposer:</span>
            <span className="font-mono">{proposal.proposer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">IPFS Hash:</span>
            <a 
              href={`https://ipfs.io/ipfs/${proposal.ipfsHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-primary hover:text-primary-dark"
            >
              {proposal.ipfsHash}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Proposal ID:</span>
            <span className="font-mono">{proposal.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;