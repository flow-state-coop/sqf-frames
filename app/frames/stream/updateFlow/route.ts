import { TransactionTargetResponse, getFrameMessage } from "frames.js";

import { Abi, encodeFunctionData, parseEther } from "viem";
import { cfaForwarderAbi } from "../../../lib/abi/cfaForwarder";
import { NextRequest, NextResponse } from "next/server";
import { chainConfig } from "../../constants";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const json = await req.json();

  const frameMessage = await getFrameMessage(json);
  const { searchParams } = new URL(req.url);

  const address = searchParams.get("address");
  const pool = searchParams.get("pool");
  const amount = frameMessage?.inputText ?? "1";
  const SECONDS_IN_MONTH = BigInt(2628000);
  const chainId = searchParams.get("chainId") ?? "666666666";

  const chain = chainConfig[chainId];
  if (!chain) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  const monthlyFlowRate = parseEther(amount);
  const flowRate = monthlyFlowRate / SECONDS_IN_MONTH;

  const createFlowCalldata = encodeFunctionData({
    abi: cfaForwarderAbi,
    functionName: "updateFlow",
    args: [
      chain.addressX,
      frameMessage.connectedAddress,
      address,
      flowRate,
      "0x",
    ],
  });

  return NextResponse.json({
    chainId: "eip155:" + chainId,
    method: "eth_sendTransaction",
    params: {
      abi: cfaForwarderAbi as Abi,
      to: chain.cfaForwarderAddress as `0x${string}`,
      data: createFlowCalldata,
      value: "0",
    },
  });
}
