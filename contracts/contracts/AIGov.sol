// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";

contract AIGov is Ownable {
    struct Proposal {
        uint id;
        address proposer;
        string ipfsHash; // IPFS hash of the full proposal
        string summary;
        uint riskScore;
        string category;
        uint votesFor;
        uint votesAgainst;
        bool executed;
        mapping(address => bool) voted;
    }

    mapping(uint => Proposal) public proposals;
    uint public proposalCount;
    mapping(address => address) public delegates; // User to delegate mapping

    event ProposalSubmitted(uint id, address proposer, string ipfsHash);
    event Voted(uint proposalId, address voter, bool support);
    event DelegateSet(address user, address delegate);

    constructor() Ownable(msg.sender) {}

    function submitProposal(string memory _ipfsHash, string memory _summary, uint _riskScore, string memory _category) public {
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.id = proposalCount;
        p.proposer = msg.sender;
        p.ipfsHash = _ipfsHash;
        p.summary = _summary;
        p.riskScore = _riskScore;
        p.category = _category;
        p.votesFor = 0;
        p.votesAgainst = 0;
        p.executed = false;

        emit ProposalSubmitted(proposalCount, msg.sender, _ipfsHash);
    }

    function vote(uint _proposalId, bool _support) public {
        Proposal storage p = proposals[_proposalId];
        require(!p.voted[msg.sender], "Already voted");
        require(!p.executed, "Proposal already executed");

        p.voted[msg.sender] = true;
        if (_support) {
            p.votesFor++;
        } else {
            p.votesAgainst++;
        }

        emit Voted(_proposalId, msg.sender, _support);
    }

    function setDelegate(address _delegate) public {
        delegates[msg.sender] = _delegate;
        emit DelegateSet(msg.sender, _delegate);
    }

    // Function for AI delegate to vote on behalf
    function delegateVote(uint _proposalId, bool _support, address _user) public {
        require(delegates[_user] == msg.sender, "Not authorized delegate");
        Proposal storage p = proposals[_proposalId];
        require(!p.voted[_user], "Already voted");
        require(!p.executed, "Proposal already executed");

        p.voted[_user] = true;
        if (_support) {
            p.votesFor++;
        } else {
            p.votesAgainst++;
        }

        emit Voted(_proposalId, _user, _support);
    }

    // Execute proposal if votesFor > votesAgainst (simple majority)
    function executeProposal(uint _proposalId) public onlyOwner {
        Proposal storage p = proposals[_proposalId];
        require(!p.executed, "Already executed");
        require(p.votesFor > p.votesAgainst, "Not enough votes");

        p.executed = true;
        // Add execution logic here
    }
}