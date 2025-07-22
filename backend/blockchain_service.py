import os
import json
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get blockchain configuration from environment
RPC_URL = os.getenv("RPC_URL", "http://localhost:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
CONTRACT_ABI_PATH = os.getenv("CONTRACT_ABI_PATH", "../contracts/artifacts/contracts/AIGov.sol/AIGov.json")

class BlockchainService:
    def __init__(self):
        self.w3 = None
        self.contract = None
        self.connected = False
    
    def connect(self):
        """Connect to blockchain and initialize contract"""
        try:
            # Connect to Ethereum node
            self.w3 = Web3(Web3.HTTPProvider(RPC_URL))
            
            # Check connection
            if not self.w3.is_connected():
                print("Failed to connect to Ethereum node")
                return False
            
            # Load contract ABI
            if not CONTRACT_ADDRESS:
                print("Contract address not set")
                return False
            
            try:
                with open(CONTRACT_ABI_PATH, 'r') as f:
                    contract_json = json.load(f)
                    contract_abi = contract_json['abi']
            except Exception as e:
                print(f"Error loading contract ABI: {str(e)}")
                return False
            
            # Initialize contract
            self.contract = self.w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)
            self.connected = True
            return True
        except Exception as e:
            print(f"Error connecting to blockchain: {str(e)}")
            self.connected = False
            return False
    
    async def get_proposal_count(self):
        """Get the total number of proposals"""
        if not self.connected and not self.connect():
            return 0
        
        try:
            return self.contract.functions.proposalCount().call()
        except Exception as e:
            print(f"Error getting proposal count: {str(e)}")
            return 0
    
    async def get_proposal(self, proposal_id):
        """Get proposal details from the smart contract"""
        if not self.connected and not self.connect():
            return None
        
        try:
            proposal = self.contract.functions.proposals(proposal_id).call()
            
            # Format proposal data
            return {
                "id": proposal_id,
                "title": proposal[0],  # Assuming title is the first field
                "proposer": proposal[1],  # Assuming proposer is the second field
                "votesFor": proposal[2],  # Assuming votesFor is the third field
                "votesAgainst": proposal[3],  # Assuming votesAgainst is the fourth field
                "executed": proposal[4],  # Assuming executed is the fifth field
                # Add other fields as needed
            }
        except Exception as e:
            print(f"Error getting proposal {proposal_id}: {str(e)}")
            return None
    
    async def get_vote(self, proposal_id, voter):
        """Get a voter's vote on a proposal"""
        if not self.connected and not self.connect():
            return None
        
        try:
            # Assuming there's a function to get a vote
            vote = self.contract.functions.getVote(proposal_id, voter).call()
            return vote
        except Exception as e:
            print(f"Error getting vote for proposal {proposal_id} by {voter}: {str(e)}")
            return None
    
    async def is_delegate_active(self, user):
        """Check if a user has an active delegate"""
        if not self.connected and not self.connect():
            return False
        
        try:
            # Assuming there's a function to check delegate status
            return self.contract.functions.delegates(user).call() != '0x0000000000000000000000000000000000000000'
        except Exception as e:
            print(f"Error checking delegate status for {user}: {str(e)}")
            return False

# Create a singleton instance
blockchain_service = BlockchainService()

# Mock implementation for development without blockchain
class MockBlockchainService:
    def __init__(self):
        self.proposals = {}
        self.votes = {}
        self.delegates = {}
        self.proposal_count = 0
    
    async def get_proposal_count(self):
        """Mock getting the total number of proposals"""
        return self.proposal_count
    
    async def get_proposal(self, proposal_id):
        """Mock getting proposal details"""
        if proposal_id in self.proposals:
            return self.proposals[proposal_id]
        
        # Return mock data for testing
        mock_proposal = {
            "id": proposal_id,
            "title": f"Mock Proposal {proposal_id}",
            "proposer": "0x1234567890123456789012345678901234567890",
            "votesFor": 10,
            "votesAgainst": 5,
            "executed": False,
        }
        
        self.proposals[proposal_id] = mock_proposal
        return mock_proposal
    
    async def get_vote(self, proposal_id, voter):
        """Mock getting a voter's vote on a proposal"""
        key = f"{proposal_id}:{voter}"
        if key in self.votes:
            return self.votes[key]
        
        # Return None to indicate no vote
        return None
    
    async def is_delegate_active(self, user):
        """Mock checking if a user has an active delegate"""
        return user in self.delegates and self.delegates[user]
    
    def add_mock_proposal(self, proposal_id, proposal_data):
        """Add a mock proposal for testing"""
        self.proposals[proposal_id] = proposal_data
        self.proposal_count = max(self.proposal_count, proposal_id + 1)
    
    def add_mock_vote(self, proposal_id, voter, vote_type):
        """Add a mock vote for testing"""
        key = f"{proposal_id}:{voter}"
        self.votes[key] = vote_type
        
        # Update proposal vote counts
        if proposal_id in self.proposals:
            if vote_type:
                self.proposals[proposal_id]["votesFor"] += 1
            else:
                self.proposals[proposal_id]["votesAgainst"] += 1
    
    def set_mock_delegate(self, user, is_active):
        """Set a mock delegate status for testing"""
        self.delegates[user] = is_active

# Create a mock instance for development
mock_blockchain_service = MockBlockchainService()

# Add some mock data for testing
mock_blockchain_service.add_mock_proposal(1, {
    "id": 1,
    "title": "Treasury Diversification",
    "proposer": "0x1234567890123456789012345678901234567890",
    "votesFor": 15,
    "votesAgainst": 5,
    "executed": False,
})

mock_blockchain_service.add_mock_proposal(2, {
    "id": 2,
    "title": "Community Grants Program",
    "proposer": "0x2345678901234567890123456789012345678901",
    "votesFor": 22,
    "votesAgainst": 8,
    "executed": False,
})

# Function to get the appropriate blockchain service
def get_blockchain_service():
    """Get the appropriate blockchain service based on environment"""
    # Use mock service for development
    if os.getenv("ENVIRONMENT", "development") == "development":
        return mock_blockchain_service
    # Use real service for production
    return blockchain_service