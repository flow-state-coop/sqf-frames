import { Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { frames } from "../frames";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { strategyAbi } from "../../lib/abi/strategy";
import { createPublicClient, formatEther, http, parseEther } from "viem";
import { calcMatchingImpactEstimate } from "../../lib/matchingImpactEstimate";
import { getPoolFlowRateConfig } from "../../lib/poolFlowRateConfig";
import { chainConfig } from "../constants";

const SECONDS_IN_MONTH = 2628000;
const handler = async (req: NextRequest) => {
  return await frames(async (ctx) => {
    const {
      address = "",
      recipientAddress = "",
      pool = "",
      chainId = "666666666",
      title = "",
      banner = "",
      logo = "",
      strategyAddress = "",
      chainName,
      allocationTokenSymbol = "",
      poolName,
      matchingTokenSymbol = "",
    } = ctx.searchParams;

    const apolloClient = new ApolloClient({
      uri: `https://subgraph-endpoints.superfluid.dev/${chainName}/protocol-v1`,
      cache: new InMemoryCache(),
    });

    const formattedStrategyAddress = strategyAddress.startsWith("0x")
      ? strategyAddress
      : `0x${strategyAddress}`;

    function getConfigByChainId(chainId: string) {
      const entry = Object.entries(chainConfig).find(
        ([_, config]) => config.chainId === chainId
      );
      if (!entry) {
        throw new Error(`Unsupported chainId: ${chainId}`);
      }
      return entry[1];
    }

    const chainConfigEntry = getConfigByChainId(chainId);
    const { rpcUrl } = chainConfigEntry;

    const publicClient = createPublicClient({
      transport: http(rpcUrl),
      batch: {
        multicall: true,
      },
    });

    const gdaPool = await publicClient.readContract({
      address: formattedStrategyAddress as `0x${string}`,
      abi: strategyAbi,
      functionName: "gdaPool",
    });

    const { data: queryRes } = await apolloClient.query({
      query: gql`
        query MatchingPool($gdaPool: String!, $recipientAddress: String!) {
          pool(id: $gdaPool) {
            flowRate
            adjustmentFlowRate
            totalUnits
            poolMembers(where: { account: $recipientAddress }) {
              units
            }
          }
        }
      `,
      variables: {
        gdaPool: gdaPool.toLowerCase(),
        recipientAddress,
      },
    });

    const matchingPool = queryRes.pool;
    const adjustedFlowRate =
      BigInt(matchingPool.flowRate) - BigInt(matchingPool.adjustmentFlowRate);
    const member = matchingPool.poolMembers[0];
    const memberFlowRate =
      BigInt(matchingPool.totalUnits) > 0
        ? (BigInt(member.units) * adjustedFlowRate) /
          BigInt(matchingPool.totalUnits)
        : BigInt(0);

    const matchingInputSteps = {
      ["ETHx"]: ["0.0004", "0.002", "0.005"],
      ["DEGENx"]: ["100", "500", "1000"],
      ["HIGHERx"]: ["100", "500", "1000"],
    };

    let matchingInputs;

    switch (allocationTokenSymbol) {
      case "ETHx":
        matchingInputs = matchingInputSteps[allocationTokenSymbol];
        break;
      case "DEGENx":
      case "HIGHERx":
        matchingInputs = matchingInputSteps[allocationTokenSymbol];
        break;
      default:
        matchingInputs = ["1", "5", "10"];
        break;
    }

    const impactMatchingEstimates = [
      calcMatchingImpactEstimate({
        totalFlowRate: BigInt(matchingPool.flowRate ?? 0),
        totalUnits: BigInt(matchingPool.totalUnits ?? 0),
        granteeUnits: BigInt(member.units),
        granteeFlowRate: memberFlowRate,
        previousFlowRate: BigInt(0),
        newFlowRate:
          parseEther(matchingInputs[0] ?? "1") / BigInt(SECONDS_IN_MONTH),
        flowRateScaling: getPoolFlowRateConfig(allocationTokenSymbol)
          .flowRateScaling,
      }),
      calcMatchingImpactEstimate({
        totalFlowRate: BigInt(matchingPool.flowRate ?? 0),
        totalUnits: BigInt(matchingPool.totalUnits ?? 0),
        granteeUnits: BigInt(member.units),
        granteeFlowRate: memberFlowRate,
        previousFlowRate: BigInt(0),
        newFlowRate:
          parseEther(matchingInputs[1] ?? "5") / BigInt(SECONDS_IN_MONTH),
        flowRateScaling: getPoolFlowRateConfig(allocationTokenSymbol)
          .flowRateScaling,
      }),
      calcMatchingImpactEstimate({
        totalFlowRate: BigInt(matchingPool.flowRate ?? 0),
        totalUnits: BigInt(matchingPool.totalUnits ?? 0),
        granteeUnits: BigInt(member.units),
        granteeFlowRate: memberFlowRate,
        previousFlowRate: BigInt(0),
        newFlowRate:
          parseEther(matchingInputs[2] ?? "10") / BigInt(SECONDS_IN_MONTH),
        flowRateScaling: getPoolFlowRateConfig(allocationTokenSymbol)
          .flowRateScaling,
      }),
    ];

    const estimates = [
      parseFloat(
        Number(
          formatEther(
            (impactMatchingEstimates[0] ?? BigInt(0)) * BigInt(SECONDS_IN_MONTH)
          )
        ).toFixed(6)
      ),
      parseFloat(
        Number(
          formatEther(
            (impactMatchingEstimates[1] ?? BigInt(0)) * BigInt(SECONDS_IN_MONTH)
          )
        ).toFixed(6)
      ),
      parseFloat(
        Number(
          formatEther(
            (impactMatchingEstimates[2] ?? BigInt(0)) * BigInt(SECONDS_IN_MONTH)
          )
        ).toFixed(6)
      ),
    ];

    const donationUrl =
      "https://flowstate.network/pool/?poolId=" +
      pool +
      "&chainId=" +
      chainId +
      "&recipientId=" +
      address;

    return {
      image: (
        <span tw="flex flex-col p-10 bg-slate-900 text-white min-h-screen min-w-screen">
          <div tw="flex justify-center text-5xl p-0 -mt-10">
            <h4>{poolName} on Flow State</h4>
          </div>
          {/* <div tw='flex justify-center -mt-5'>
            <img src={banner} alt='Banner Image' width={1000} height={200} />
          </div> */}
          <div tw="flex relative -mt-10 left-5">
            <img src={logo} alt="Logo Image" width={200} height={200} />
          </div>
          <div tw="flex text-7xl font-bold">
            <h4 tw="mt-10 mb-0">{title}</h4>
          </div>
          <p tw="mt-20">🌊💸 Real-Time QF Matching Multiplier</p>
          <div tw="flex flex-col justify-content items-center text-slate-500 border bg-black rounded-3xl px-6 py-0">
            <h3 tw="text-white">
              {matchingInputs[0]} {allocationTokenSymbol} = {estimates[0]}{" "}
              {matchingTokenSymbol}
            </h3>
            <p>
              {matchingInputs[1]} {allocationTokenSymbol} = {estimates[1]}{" "}
              {matchingTokenSymbol}
            </p>
            <p>
              {matchingInputs[2]} {allocationTokenSymbol} = {estimates[2]}{" "}
              {matchingTokenSymbol}
            </p>
          </div>
        </span>
      ),
      // textInput: "Monthly Value (Number)",
      buttons: [
        <Button
          action="post"
          target={{ pathname: `/grantee/${address}/${pool}/${chainId}` }}
        >
          Back
        </Button>,
        <Button action="link" target={donationUrl}>
          Donate
        </Button>,
        // <Button
        //   action='tx'
        //   target={{
        //     pathname: "/stream/wrapDegen",
        //     query: {
        //       chainId: chainId,
        //       isWrapperSuperToken: isPureSuperToken,
        //     },
        //   }}
        //   post_url={`/grantee/${address}/${pool}/${chainId}`}
        // >
        //   1. Wrap
        // </Button>,
        // <Button
        //   action='tx'
        //   target={{
        //     pathname: "/stream/donate",
        //     query: {
        //       address: address,
        //       pool: pool,
        //       chainId: chainId,
        //     },
        //   }}
        //   post_url={{
        //     pathname: "/stream/success",
        //     query: { address, pool, chainId, title },
        //   }}
        // >
        //   2. Stream
        // </Button>,
      ],
      state: {
        address,
        pool,
        amount: ctx.message?.inputText || "",
        chainId: chainId || "666666666",
        title,
      },
      imageOptions: {
        aspectRatio: "1:1",
      },
    };
  })(req);
};

export const POST = handler;
export const GET = handler;
