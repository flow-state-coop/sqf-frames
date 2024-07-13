import { Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { frames } from "../frames";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { strategyAbi } from "../../lib/abi/strategy";
import { createPublicClient, formatEther, http, parseEther } from "viem";
import { calcMatchingImpactEstimate } from "../../lib/matchingImpactEstimate";

const SECONDS_IN_MONTH = 2628000;
const handler = async (req: NextRequest) => {
  return await frames(async (ctx) => {
    const {
      address = "",
      pool = "",
      chainId = "666666666",
      title = "",
      banner = "",
      logo = "",
      isPureSuperToken = false,
      strategyAddress = "",
      chainName,
      name,
      tokenName,
    } = ctx.searchParams;

    const apolloClient = new ApolloClient({
      uri: `https://subgraph-endpoints.superfluid.dev/${chainName}/protocol-v1`,
      cache: new InMemoryCache(),
    });

    const formattedStrategyAddress = strategyAddress.startsWith("0x")
      ? strategyAddress
      : `0x${strategyAddress}`;

    const publicClient = createPublicClient({
      transport: http("https://rpc.degen.tips"),
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
        query MatchingPool($gdaPool: String!, $address: String!) {
          pool(id: $gdaPool) {
            flowRate
            adjustmentFlowRate
            totalUnits
            poolMembers(where: { account: $address }) {
              units
            }
          }
        }
      `,
      variables: {
        gdaPool: gdaPool.toLowerCase(),
        address,
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

    const impactMatchingEstimate = calcMatchingImpactEstimate({
      totalFlowRate: BigInt(matchingPool.flowRate ?? 0),
      totalUnits: BigInt(matchingPool.totalUnits ?? 0),
      granteeUnits: BigInt(member.units),
      granteeFlowRate: memberFlowRate,
      previousFlowRate: BigInt(0),
      newFlowRate: parseEther("1") / BigInt(SECONDS_IN_MONTH),
      //newFlowRate: parseEther("5") / BigInt(SECONDS_IN_MONTH),
      //newFlowRate: parseEther("100") / BigInt(SECONDS_IN_MONTH),
    });

    const estimate = formatEther(impactMatchingEstimate * BigInt(2628000));

    return {
      image: (
        <span tw='flex flex-col p-10 bg-slate-900 text-white min-h-screen min-w-screen'>
          <div tw='flex justify-center p-0 m-0'>
            <h4>
              ${name} {tokenName} by Flow State
            </h4>
          </div>
          <div tw='flex justify-center -mt-5'>
            <img src={banner} alt='Banner Image' width={1000} height={200} />
          </div>
          <div tw='flex relative -mt-20 left-5'>
            <img src={logo} alt='Logo Image' width={200} height={200} />
          </div>
          <h4>{title}</h4>
          <p>🌊💸 Real-Time QF Matching Multiplier</p>
          <p>
            💧 Flow Rate: {estimate} {tokenName}/second
          </p>
        </span>
      ),
      textInput: "Monthly Value (Number)",
      buttons: [
        <Button action='link' target={`https://sqf-degen-ui.vercel.app/`}>
          UI
        </Button>,
        <Button
          action='tx'
          target={{
            pathname: "/stream/wrapDegen",
            query: {
              chainId: chainId,
              isWrapperSuperToken: isPureSuperToken,
            },
          }}
          post_url={`/grantee/${address}/${pool}/${chainId}`}
        >
          1. Wrap
        </Button>,
        <Button
          action='tx'
          target={{
            pathname: "/stream/donate",
            query: {
              address: address,
              pool: pool,
              chainId: chainId,
            },
          }}
          post_url={{
            pathname: "/stream/success",
            query: { address, pool, chainId, title },
          }}
        >
          2. Stream
        </Button>,
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
