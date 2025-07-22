import os
import json
import ipfshttpclient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get IPFS API URL from environment or use default
IPFS_API_URL = os.getenv("IPFS_API_URL", "/ip4/127.0.0.1/tcp/5001")

class IPFSService:
    def __init__(self):
        self.client = None
        self.connected = False
    
    def connect(self):
        """Connect to IPFS daemon"""
        try:
            self.client = ipfshttpclient.connect(IPFS_API_URL)
            self.connected = True
            return True
        except Exception as e:
            print(f"Error connecting to IPFS: {str(e)}")
            self.connected = False
            return False
    
    def disconnect(self):
        """Disconnect from IPFS daemon"""
        if self.client:
            try:
                self.client.close()
                self.connected = False
            except Exception as e:
                print(f"Error disconnecting from IPFS: {str(e)}")
    
    async def add_proposal(self, proposal_data):
        """Add proposal data to IPFS"""
        if not self.connected and not self.connect():
            return None
        
        try:
            # Convert proposal data to JSON string
            json_data = json.dumps(proposal_data)
            
            # Add to IPFS
            result = self.client.add_str(json_data)
            
            # Return the IPFS hash
            return result
        except Exception as e:
            print(f"Error adding proposal to IPFS: {str(e)}")
            return None
        finally:
            # Disconnect after operation
            self.disconnect()
    
    async def get_proposal(self, ipfs_hash):
        """Get proposal data from IPFS"""
        if not self.connected and not self.connect():
            return None
        
        try:
            # Get data from IPFS
            data = self.client.cat(ipfs_hash)
            
            # Parse JSON data
            proposal_data = json.loads(data)
            
            return proposal_data
        except Exception as e:
            print(f"Error getting proposal from IPFS: {str(e)}")
            return None
        finally:
            # Disconnect after operation
            self.disconnect()

# Create a singleton instance
ipfs_service = IPFSService()

# Function to get IPFS gateway URL for a hash
def get_ipfs_gateway_url(ipfs_hash):
    """Get a public gateway URL for an IPFS hash"""
    # Use environment variable or default to a public gateway
    gateway = os.getenv("IPFS_GATEWAY", "https://ipfs.io/ipfs/")
    return f"{gateway}{ipfs_hash}"

# Mock implementation for development without IPFS daemon
class MockIPFSService:
    def __init__(self):
        self.storage = {}
    
    async def add_proposal(self, proposal_data):
        """Mock adding proposal data to IPFS"""
        try:
            # Generate a fake IPFS hash (for development only)
            import hashlib
            json_data = json.dumps(proposal_data)
            fake_hash = "Qm" + hashlib.sha256(json_data.encode()).hexdigest()[:44]
            
            # Store in memory
            self.storage[fake_hash] = proposal_data
            
            return fake_hash
        except Exception as e:
            print(f"Error in mock IPFS add: {str(e)}")
            return None
    
    async def get_proposal(self, ipfs_hash):
        """Mock getting proposal data from IPFS"""
        try:
            # Retrieve from memory
            if ipfs_hash in self.storage:
                return self.storage[ipfs_hash]
            return None
        except Exception as e:
            print(f"Error in mock IPFS get: {str(e)}")
            return None

# Create a mock instance for development
mock_ipfs_service = MockIPFSService()

# Function to get the appropriate IPFS service
def get_ipfs_service():
    """Get the appropriate IPFS service based on environment"""
    # Use mock service for development
    if os.getenv("ENVIRONMENT", "development") == "development":
        return mock_ipfs_service
    # Use real service for production
    return ipfs_service