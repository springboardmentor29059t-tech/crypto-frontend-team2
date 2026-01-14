import { ContractReputation } from "../types";

interface EtherscanResponse {
  status: string;
  message: string;
  result: Array<{
    ContractAddress: string;
    ContractName: string;
    CompilerVersion: string;
    OptimizationUsed: string;
    Runs: string;
    ConstructorArguments: string;
    Library: string;
    LicenseType: string;
    Proxy: string;
    Implementation: string;
    SwarmSource: string;
  }>;
}

interface CryptoScamDBResponse {
  address: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  reporter: string;
  url: string;
  reporterDetails: {
    address: string;
    username: string;
  };
}

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

export async function checkEtherscanReputation(
  address: string
): Promise<{
  verified: boolean;
  reputation: "good" | "neutral" | "suspicious" | "unknown";
}> {
  if (!ETHERSCAN_API_KEY) {
    console.warn("Etherscan API key not configured");
    return {
      verified: false,
      reputation: "unknown",
    };
  }

  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.statusText}`);
    }

    const data: EtherscanResponse = await response.json();

    if (data.status === "1" && data.result && data.result.length > 0) {
      const contract = data.result[0];
      const isVerified = contract.ContractName !== "";

      // Check for suspicious patterns
      let reputation: "good" | "neutral" | "suspicious" | "unknown" = "neutral";

      if (isVerified) {
        reputation = "good";
      } else if (contract.Proxy === "1") {
        // Proxy contracts can be risky
        reputation = "suspicious";
      }

      return {
        verified: isVerified,
        reputation,
      };
    }

    return {
      verified: false,
      reputation: "unknown",
    };
  } catch (error) {
    console.error("Error checking Etherscan reputation:", error);
    return {
      verified: false,
      reputation: "unknown",
    };
  }
}

export async function checkCryptoScamDB(
  address: string
): Promise<{
  flagged: boolean;
  reason?: string;
}> {
  try {
    const response = await fetch(
      `https://api.cryptoscamdb.org/v1/addresses/${address}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Address not found in scam database is good
        return {
          flagged: false,
        };
      }
      throw new Error(`CryptoScamDB API error: ${response.statusText}`);
    }

    const data: CryptoScamDBResponse = await response.json();

    if (data && data.address) {
      return {
        flagged: true,
        reason: `${data.category}: ${data.description || data.name}`,
      };
    }

    return {
      flagged: false,
    };
  } catch (error) {
    console.error("Error checking CryptoScamDB:", error);
    // If API fails, assume not flagged (fail-safe)
    return {
      flagged: false,
    };
  }
}

export async function checkContractReputation(
  address: string,
  symbol: string
): Promise<ContractReputation> {
  const [etherscanData, scamDBData] = await Promise.all([
    checkEtherscanReputation(address),
    checkCryptoScamDB(address),
  ]);

  // Determine overall risk level
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";

  if (scamDBData.flagged) {
    riskLevel = "critical";
  } else if (etherscanData.reputation === "suspicious") {
    riskLevel = "high";
  } else if (!etherscanData.verified) {
    riskLevel = "medium";
  }

  return {
    address,
    symbol,
    isScam: scamDBData.flagged,
    riskLevel,
    sources: {
      etherscan: {
        verified: etherscanData.verified,
        reputation: etherscanData.reputation,
      },
      cryptoScamDB: {
        flagged: scamDBData.flagged,
        reason: scamDBData.reason,
      },
    },
    lastChecked: new Date().toISOString(),
  };
}

