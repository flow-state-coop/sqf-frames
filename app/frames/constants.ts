export const chainConfig: Record<
  `0x${string}`,
  {
    cfaForwarderAddress: `0x${string}`;
    chainId: string;
    name: string;
    chainName: string;
    rpcUrl?: string;
  }
> = {
  "0xda58FA9bfc3D3960df33ddD8D4d762Cf8Fa6F7ad": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    chainId: "666666666",
    name: "DEGEN",
    chainName: "degenchain",
    rpcUrl: "https://rpc.degen.tips",
  },
  "0x671425Ae1f272Bc6F79beC3ed5C4b00e9c628240": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    chainId: "42220",
    name: "CELO",
    chainName: "Celo",
    rpcUrl: "https://forno.celo.org",
  },
  "0xFc55F2854e74b4f42D01a6d3DAAC4c52D9dfdcFf": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    chainId: "42161",
    name: "Arbitrum USDCx",
    chainName: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
  },
  "0xe6C8d111337D0052b9D88BF5d7D55B7f8385ACd3": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    chainId: "42161",
    name: "Arbitrum ETHx",
    chainName: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
  },
  "0xefbE11336b0008dCE3797C515E6457cC4841645c": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    chainId: "31337",
    name: "Base",
    chainName: "base-mainnet",
    rpcUrl: "https://mainnet.base.org",
  },
  "0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    chainId: "11155420",
    name: "Optimism Sepolia",
    chainName: "optimism-sepolia",
    rpcUrl: "https://sepolia.optimism.io",
  },
};
