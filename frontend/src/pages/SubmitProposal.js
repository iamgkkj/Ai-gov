import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import axios from 'axios';

const SubmitProposal = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [step, setStep] = useState(1); // 1: Form, 2: AI Analysis, 3: Confirmation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet to submit a proposal.');
      return;
    }
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // In a real app, this would call your backend API
      // For now, we'll simulate the AI analysis
      setTimeout(() => {
        setAiAnalysis({
          summary: 'This proposal aims to improve community engagement through regular events and workshops.',
          riskScore: 2,
          category: 'Community',
          explanation: 'The proposal has a low risk score because it focuses on community building without significant financial implications. The main category is Community based on the focus on engagement and events.',
        });
        setStep(2);
        setIsSubmitting(false);
      }, 2000);
      
      // Actual API call would look like this:
      // const response = await axios.post('http://localhost:8000/submit_proposal', formData);
      // setAiAnalysis(response.data);
      // setStep(2);
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setError('Failed to submit proposal. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmission = async () => {
    try {
      setIsSubmitting(true);
      
      // In a real app, this would submit to the blockchain via your backend
      // For now, we'll simulate the submission
      setTimeout(() => {
        setStep(3);
        setIsSubmitting(false);
      }, 2000);
      
      // Actual submission would look like this:
      // const response = await axios.post('http://localhost:8000/confirm_proposal', {
      //   ...formData,
      //   aiAnalysis,
      //   walletAddress: address,
      // });
      
    } catch (error) {
      console.error('Error confirming proposal:', error);
      setError('Failed to confirm proposal. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getRiskBadgeClass = (score) => {
    if (score <= 3) return 'badge-risk-low';
    if (score <= 6) return 'badge-risk-medium';
    return 'badge-risk-high';
  };

  return (
    <div>
      <h1>Submit Proposal</h1>
      
      {!isConnected ? (
        <div className="card mb-8 border border-primary/30 bg-primary/5">
          <div className="text-center py-4">
            <h3 className="text-xl mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 mb-4">
              You need to connect your wallet to submit a proposal.
            </p>
          </div>
        </div>
      ) : null}
      
      {step === 1 && (
        <div className="card max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Proposal Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter a clear, concise title"
                disabled={!isConnected || isSubmitting}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Proposal Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input w-full h-64"
                placeholder="Describe your proposal in detail. Include the problem, solution, and expected outcomes."
                disabled={!isConnected || isSubmitting}
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={!isConnected || isSubmitting}
              >
                {isSubmitting ? 'Analyzing...' : 'Submit for AI Analysis'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {step === 2 && aiAnalysis && (
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4">AI Analysis Results</h2>
          
          <div className="mb-6 space-y-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Proposal Title</h3>
              <p className="text-lg font-medium">{formData.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-400 mb-1">AI Summary (TL;DR)</h3>
              <p>{aiAnalysis.summary}</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Risk Score</h3>
                <span className={`${getRiskBadgeClass(aiAnalysis.riskScore)} text-sm px-3 py-1`}>
                  {aiAnalysis.riskScore}/10
                </span>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Category</h3>
                <span className="badge bg-background text-gray-300 border border-gray-700">
                  {aiAnalysis.category}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-400 mb-1">AI Explanation</h3>
              <div className="bg-background p-3 rounded-md border border-gray-800">
                <p className="text-sm">{aiAnalysis.explanation}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="btn-outline"
              disabled={isSubmitting}
            >
              Edit Proposal
            </button>
            
            <button
              onClick={handleConfirmSubmission}
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm & Submit to Blockchain'}
            </button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="card max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Proposal Submitted Successfully!</h2>
            <p className="text-gray-400 mb-4">
              Your proposal has been submitted to the blockchain and is now available for voting.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/proposals')}
              className="btn-primary"
            >
              View All Proposals
            </button>
            
            <button
              onClick={() => {
                setFormData({ title: '', description: '' });
                setAiAnalysis(null);
                setStep(1);
              }}
              className="btn-outline"
            >
              Submit Another Proposal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitProposal;