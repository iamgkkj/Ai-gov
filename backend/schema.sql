-- AI-Gov Database Schema

-- Users table to store user profiles and preferences
CREATE TABLE users (
    address VARCHAR(42) PRIMARY KEY,  -- Ethereum address as primary key
    username VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delegate preferences for AI voting
CREATE TABLE delegate_preferences (
    address VARCHAR(42) PRIMARY KEY REFERENCES users(address),
    is_active BOOLEAN DEFAULT FALSE,
    risk_tolerance INTEGER CHECK (risk_tolerance BETWEEN 1 AND 10),
    prioritize_financial INTEGER CHECK (prioritize_financial BETWEEN 1 AND 5),
    prioritize_community INTEGER CHECK (prioritize_community BETWEEN 1 AND 5),
    prioritize_protocol INTEGER CHECK (prioritize_protocol BETWEEN 1 AND 5),
    voting_strategy VARCHAR(50) CHECK (voting_strategy IN ('conservative', 'balanced', 'progressive')),
    custom_rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Proposals table to store metadata about proposals
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL,  -- On-chain proposal ID
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ipfs_hash VARCHAR(100) NOT NULL,  -- IPFS hash for full proposal content
    proposer VARCHAR(42) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'active', 'executed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI analysis of proposals
CREATE TABLE proposal_analysis (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER REFERENCES proposals(id),
    summary TEXT NOT NULL,  -- AI-generated TL;DR
    category VARCHAR(100) NOT NULL,  -- Finance, Community, Protocol, etc.
    risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
    ai_explanation TEXT,  -- Explanation for the risk score and category
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Votes cast by users
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER REFERENCES proposals(id),
    voter VARCHAR(42) NOT NULL,
    vote_type BOOLEAN NOT NULL,  -- TRUE for 'for', FALSE for 'against'
    is_delegate_vote BOOLEAN DEFAULT FALSE,  -- Whether this vote was cast by an AI delegate
    transaction_hash VARCHAR(66),  -- On-chain transaction hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI delegate voting history for training
CREATE TABLE delegate_voting_history (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) REFERENCES users(address),
    proposal_id INTEGER REFERENCES proposals(id),
    user_vote BOOLEAN,  -- User's actual vote (TRUE for 'for', FALSE for 'against')
    ai_recommendation BOOLEAN,  -- AI's recommended vote
    match BOOLEAN,  -- Whether the AI recommendation matched the user's vote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_proposals_proposer ON proposals(proposer);
CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_votes_voter ON votes(voter);
CREATE INDEX idx_delegate_history_address ON delegate_voting_history(address);