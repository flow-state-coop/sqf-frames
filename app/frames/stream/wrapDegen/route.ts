import { TransactionTargetResponse, getFrameMessage } from "frames.js";
import { NextRequest, NextResponse } from "next/server";
import { Abi, encodeFunctionData, parseEther } from "viem";
import { superTokenAbi } from "../../../lib/abi/superToken";
import { chainConfig } from "../../constants";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);
  const amount = frameMessage?.inputText ?? "1";
  const { searchParams } = new URL(req.url);
  const chainId = searchParams.get("chainId") ?? "666666666";
  const isWrapperSuperToken = searchParams.get("isWrapperSuperToken");

  if (!frameMessage) {
    throw new Error("No frame message");
  }

  function getConfigAndAddressXByChainId(
    chainId: string
  ): [(typeof chainConfig)[keyof typeof chainConfig], `0x${string}`] {
    const entry = Object.entries(chainConfig).find(
      ([_, config]) => config.chainId === chainId
    );
    if (!entry) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }
    return [entry[1], entry[0] as `0x${string}`];
  }

  const [chainConfigEntry, addressX] = getConfigAndAddressXByChainId(chainId);

  let wrapCalldata = encodeFunctionData({
    abi: superTokenAbi,
    functionName: "upgrade",
    args: [parseEther(amount)],
  });

  if (isWrapperSuperToken) {
    wrapCalldata = encodeFunctionData({
      abi: superTokenAbi,
      functionName: "upgradeByETH",
    });
  } else {
    wrapCalldata = encodeFunctionData({
      abi: superTokenAbi,
      functionName: "upgrade",
      args: [parseEther(amount)],
    });
  }

  return NextResponse.json({
    chainId: "eip155:" + chainId,
    method: "eth_sendTransaction",
    params: {
      abi: superTokenAbi as Abi,
      to: addressX,
      data: wrapCalldata,
      value: parseEther(amount).toString(),
    },
  });
}
