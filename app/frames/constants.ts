// constants.ts

export const chainConfig: Record<
  string,
  {
    cfaForwarderAddress: `0x${string}`;
    addressX: `0x${string}`;
    name: string;
    chainName: string;
    rpcUrl?: string;
  }
> = {
  // degenx
  "666666666": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    addressX: "0xda58FA9bfc3D3960df33ddD8D4d762Cf8Fa6F7ad",
    name: "DEGEN",
    chainName: "degenchain",
    rpcUrl: "https://rpc.degen.tips",
  },
  // celox
  "42220": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    addressX: "0x671425Ae1f272Bc6F79beC3ed5C4b00e9c628240",
    name: "CELO",
    chainName: "Celo",
    rpcUrl: "https://forno.celo.org",
  },
  // arbitrum usdcx
  "42161": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    addressX: "0xFc55F2854e74b4f42D01a6d3DAAC4c52D9dfdcFf",
    name: "Arbitrum USDC",
    chainName: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
  },
  // base
  "31337": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    addressX: "0xefbE11336b0008dCE3797C515E6457cC4841645c",
    name: "Base",
    chainName: "base-mainnet",
    rpcUrl: "https://mainnet.base.org",
  },
  // optimism sepolia
  "11155420": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    addressX: "0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7",
    name: "Optimism Sepolia",
    chainName: "optimism-sepolia",
    rpcUrl: "https://sepolia.optimism.io",
  },
};
