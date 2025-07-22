// AI-Gov Smart Contract Deployment Script

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying AI-Gov smart contract...");

  // Get the contract factory
  const AIGov = await hre.ethers.getContractFactory("AIGov");
  
  // Deploy the contract
  const aiGov = await AIGov.deploy();
  await aiGov.deployed();

  console.log(`AIGov contract deployed to: ${aiGov.address}`);

  // Save the contract address and ABI to a file for easy access
  const contractsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save address
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ AIGov: aiGov.address }, null, 2)
  );

  // Save ABI
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "AIGov.sol",
    "AIGov.json"
  );
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath));
    fs.writeFileSync(
      path.join(contractsDir, "AIGov.json"),
      JSON.stringify(artifact, null, 2)
    );
  }

  console.log("Contract address and ABI saved to the deployments directory");

  // Update .env file with contract address if it exists
  const envPath = path.join(__dirname, "..", "..", ".env");
  if (fs.existsSync(envPath)) {
    console.log("Updating .env file with contract address...");
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Replace or add CONTRACT_ADDRESS
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${aiGov.address}`
      );
    } else {
      envContent += `\nCONTRACT_ADDRESS=${aiGov.address}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(".env file updated with contract address");
  }

  console.log("Deployment complete!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });