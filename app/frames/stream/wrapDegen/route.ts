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

  if (!frameMessage) {
    throw new Error("No frame message");
  }

  const chain = chainConfig[chainId];
  if (!chain) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  const wrapCalldata = encodeFunctionData({
    abi: superTokenAbi,
    functionName: "upgradeByETH",
  });

  return NextResponse.json({
    chainId: "eip155:" + chainId,
    method: "eth_sendTransaction",
    params: {
      abi: superTokenAbi as Abi,
      to: chain.addressX,
      data: wrapCalldata,
      value: parseEther(amount).toString(),
    },
  });
}
