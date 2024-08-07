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
  const monthlyFlowRate = parseEther(amount);
  const flowRate = monthlyFlowRate / SECONDS_IN_MONTH;

  const createFlowCalldata = encodeFunctionData({
    abi: cfaForwarderAbi,
    functionName: "updateFlow",
    args: [addressX, frameMessage.connectedAddress, address, flowRate, "0x"],
  });

  return NextResponse.json({
    chainId: "eip155:" + chainId,
    method: "eth_sendTransaction",
    params: {
      abi: cfaForwarderAbi as Abi,
      to: chainConfigEntry.cfaForwarderAddress as `0x${string}`,
      data: createFlowCalldata,
      value: "0",
    },
  });
}
