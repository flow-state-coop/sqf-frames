// constants.ts

export const chainConfig: Record<
  string,
  { cfaForwarderAddress: `0x${string}`; addressX: `0x${string}`; name: string }
> = {
  // degenx
  "666666666": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    addressX: "0xda58FA9bfc3D3960df33ddD8D4d762Cf8Fa6F7ad",
    name: "DEGEN",
  },
  // celox
  "42220": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    addressX: "0x671425Ae1f272Bc6F79beC3ed5C4b00e9c628240",
    name: "CELO",
  },
  // arbitrum usdcx
  "42161": {
    cfaForwarderAddress: "0xcfA132E353cB4E398080B9700609bb008eceB125",
    addressX: "0xFc55F2854e74b4f42D01a6d3DAAC4c52D9dfdcFf",
    name: "Arbitrum USDC",
  },
};
