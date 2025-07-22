import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

const DelegateSetup = () => {
  const { address, isConnected } = useAccount();
  
  const [delegateActive, setDelegateActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Delegate preferences
  const [preferences, setPreferences] = useState({
    riskTolerance: 5,
    prioritizeFinancial: 3,
    prioritizeCommunity: 3,
    prioritizeProtocol: 3,
    votingStrategy: 'balanced',
    customRules: '',
  });
  
  // Voting history for training
  const [votingHistory, setVotingHistory] = useState([]);
  
  useEffect(() => {
    const fetchDelegateData = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Mock data for now
        // In a real app, this would be API calls like:
        // const prefsResponse = await axios.get(`http://localhost:8000/delegate/preferences/${address}`);
        // const historyResponse = await axios.get(`http://localhost:8000/delegate/voting-history/${address}`);
        
        // Simulate API delay
        setTimeout(() => {
          // Mock delegate status and preferences
          setDelegateActive(Math.random() > 0.5);
          setPreferences({
            riskTolerance: Math.floor(Math.random() * 10) + 1,
            prioritizeFinancial: Math.floor(Math.random() * 5) + 1,
            prioritizeCommunity: Math.floor(Math.random() * 5) + 1,
            prioritizeProtocol: Math.floor(Math.random() * 5) + 1,
            votingStrategy: ['conservative', 'balanced', 'progressive'][Math.floor(Math.random() * 3)],
            customRules: '',
          });
          
          // Mock voting history
          const mockHistory = [
            {
              id: 1,
              title: 'Treasury Diversification',
              category: 'Finance',
              riskScore: 3,
              userVote: 'for',
              aiRecommendation: 'for',
              match: true,
            },
            {
              id: 2,
              title: 'Community Grants Program',
              category: 'Community',
              riskScore: 4,
              userVote: 'for',
              aiRecommendation: 'for',
              match: true,
            },
            {
              id: 3,
              title: 'Protocol Fee Increase',
              category: 'Protocol',
              riskScore: 6,
              userVote: 'against',
              aiRecommendation: 'against',
              match: true,
            },
            {
              id: 4,
              title: 'New Governance Structure',
              category: 'Governance',
              riskScore: 7,
              userVote: 'against',
              aiRecommendation: 'for',
              match: false,
            },
          ];
          
          setVotingHistory(mockHistory);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching delegate data:', error);
        setError('Failed to load delegate data. Please try again.');
        setLoading(false);
      }
    };

    fetchDelegateData();
  }, [isConnected, address]);

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStrategyChange = (strategy) => {
    setPreferences(prev => ({
      ...prev,
      votingStrategy: strategy
    }));
  };

  const handleToggleDelegate = () => {
    setDelegateActive(!delegateActive);
  };

  const handleSavePreferences = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to save preferences.');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess(false);
      
      // In a real app, this would be an API call like:
      // await axios.post('http://localhost:8000/delegate/preferences', {
      //   address,
      //   active: delegateActive,
      //   preferences
      // });
      
      // Simulate API delay
      setTimeout(() => {
        setSaving(false);
        setSuccess(true);
        
        // Reset success message after a delay
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Please try again.');
      setSaving(false);
    }
  };

  const getMatchRate = () => {
    if (votingHistory.length === 0) return 0;
    const matches = votingHistory.filter(vote => vote.match).length;
    return Math.round((matches / votingHistory.length) * 100);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading delegate settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI Delegate Setup</h1>
      
      {!isConnected ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 mb-4">Connect your wallet to configure your AI delegate.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-900/30 border border-green-700 rounded-md text-green-300">
              Delegate preferences saved successfully!
            </div>
          )}
          
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Delegate Status</h2>
              
              <div className="flex items-center">
                <span className="mr-2">AI Delegate:</span>
                <button 
                  onClick={handleToggleDelegate}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${delegateActive ? 'bg-primary' : 'bg-gray-700'}`}
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${delegateActive ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
            
            <div className="bg-background-light p-4 rounded-md mb-4">
              <p className="text-sm">
                When activated, your AI delegate will vote on your behalf according to your preferences and voting history. 
                You can always override your delegate's vote by manually voting on any proposal.
              </p>
            </div>
            
            {votingHistory.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary-dark/30 border border-primary-dark rounded-md">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <span className="text-primary font-bold">{getMatchRate()}%</span>
                  </div>
                  <div>
                    <h3 className="font-medium">AI Accuracy Rate</h3>
                    <p className="text-xs text-gray-400">Based on your voting history</p>
                  </div>
                </div>
                <button 
                  className="text-xs text-primary hover:text-primary-dark"
                  onClick={() => document.getElementById('voting-history').scrollIntoView({ behavior: 'smooth' })}
                >
                  View History
                </button>
              </div>
            )}
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Delegate Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">Risk Tolerance</label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-400 mr-3">Conservative</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    name="riskTolerance"
                    value={preferences.riskTolerance} 
                    onChange={handlePreferenceChange}
                    className="w-full h-2 bg-background-light rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-400 ml-3">Aggressive</span>
                </div>
                <div className="text-center mt-1 text-sm">
                  {preferences.riskTolerance}/10
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Category Priorities</label>
                <p className="text-sm text-gray-400 mb-3">Rate the importance of each category (1-5)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 text-sm">Financial Proposals</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      name="prioritizeFinancial"
                      value={preferences.prioritizeFinancial} 
                      onChange={handlePreferenceChange}
                      className="w-full h-2 bg-background-light rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center mt-1 text-xs">
                      {preferences.prioritizeFinancial}/5
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm">Community Proposals</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      name="prioritizeCommunity"
                      value={preferences.prioritizeCommunity} 
                      onChange={handlePreferenceChange}
                      className="w-full h-2 bg-background-light rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center mt-1 text-xs">
                      {preferences.prioritizeCommunity}/5
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm">Protocol Proposals</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      name="prioritizeProtocol"
                      value={preferences.prioritizeProtocol} 
                      onChange={handlePreferenceChange}
                      className="w-full h-2 bg-background-light rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center mt-1 text-xs">
                      {preferences.prioritizeProtocol}/5
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Voting Strategy</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleStrategyChange('conservative')}
                    className={`p-3 rounded-md border ${preferences.votingStrategy === 'conservative' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-background-light'}`}
                  >
                    <h3 className="font-medium mb-1">Conservative</h3>
                    <p className="text-xs text-gray-400">Prioritizes stability and minimal risk. Tends to vote against proposals with high risk scores.</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleStrategyChange('balanced')}
                    className={`p-3 rounded-md border ${preferences.votingStrategy === 'balanced' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-background-light'}`}
                  >
                    <h3 className="font-medium mb-1">Balanced</h3>
                    <p className="text-xs text-gray-400">Weighs risks and benefits equally. Considers multiple factors before voting.</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleStrategyChange('progressive')}
                    className={`p-3 rounded-md border ${preferences.votingStrategy === 'progressive' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-background-light'}`}
                  >
                    <h3 className="font-medium mb-1">Progressive</h3>
                    <p className="text-xs text-gray-400">Favors innovation and growth. More likely to support higher-risk proposals with potential upside.</p>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Custom Rules (Optional)</label>
                <textarea
                  name="customRules"
                  value={preferences.customRules}
                  onChange={handlePreferenceChange}
                  placeholder="Add custom rules for your AI delegate, e.g., 'Always vote against fee increases' or 'Support community initiatives under 100k budget'"
                  className="w-full p-3 bg-background-light border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
          
          {votingHistory.length > 0 && (
            <div id="voting-history" className="card">
              <h2 className="text-xl font-semibold mb-6">Voting History</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left bg-background-light">
                    <tr>
                      <th className="p-3 rounded-tl-md">Proposal</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Risk</th>
                      <th className="p-3">Your Vote</th>
                      <th className="p-3 rounded-tr-md">AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {votingHistory.map(vote => (
                      <tr key={vote.id}>
                        <td className="p-3">{vote.title}</td>
                        <td className="p-3">{vote.category}</td>
                        <td className="p-3">{vote.riskScore}/10</td>
                        <td className="p-3">
                          <span className={vote.userVote === 'for' ? 'text-green-500' : 'text-red-500'}>
                            {vote.userVote.charAt(0).toUpperCase() + vote.userVote.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className={vote.aiRecommendation === 'for' ? 'text-green-500' : 'text-red-500'}>
                              {vote.aiRecommendation.charAt(0).toUpperCase() + vote.aiRecommendation.slice(1)}
                            </span>
                            
                            {vote.match ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-400">
                Your voting history helps train your AI delegate to better match your preferences.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DelegateSetup;