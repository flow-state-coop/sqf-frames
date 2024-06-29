import { Button } from "frames.js/next";
import { frames } from "../../../../frames";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { NextRequest } from "next/server";
import { chainConfig } from "../../../../constants";
import Image from "next/image";
import { superTokenAbi } from "../../../../../lib/abi/superToken";
import { createPublicClient, http } from "viem";

const apolloClient = new ApolloClient({
  uri: "https://api.streaming.fund/graphql",
  cache: new InMemoryCache(),
});

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);

  const pathSegments = url.pathname.split("/");

  const address = pathSegments.length > 3 ? pathSegments[3] || "" : "";
  const pool = pathSegments.length > 4 ? pathSegments[4] || "" : "";
  const chainId =
    pathSegments.length > 5 ? pathSegments[5] || "666666666" : "666666666";

  const chainConfigEntry = chainConfig[chainId];
  if (!chainConfigEntry) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const { name: chainName } = chainConfigEntry;

  const { data: queryRes } = await apolloClient.query({
    query: gql`
      query Recipient($pool: String!, $address: String!, $chainId: Int!) {
        recipient(id: $address, poolId: $pool, chainId: $chainId) {
          metadata
          superappAddress
          poolChain {
            allocationToken
            matchingToken
            metadata
          }
        }
      }
    `,
    variables: { pool, address, chainId: Number(chainId) },
  });

  return await frames(async (ctx) => {
    const title = queryRes.recipient.metadata.title;
    const allocationToken = queryRes.recipient.poolChain.allocationToken;
    const tokenName = queryRes.recipient.poolChain.metadata.name;
    const amount = ctx.message?.inputText || "";
    const description = queryRes.recipient.metadata.description;
    const banner =
      "https://ipfs.io/ipfs/" + queryRes.recipient.metadata.bannerImg;
    const logo = "https://ipfs.io/ipfs/" + queryRes.recipient.metadata.logoImg;

    const publicClient = createPublicClient({
      transport: http("https://rpc.degen.tips"),
      batch: {
        multicall: true,
      },
    });

    const allocationTokenSymbol = await publicClient.readContract({
      address: queryRes.recipient.poolChain.allocationToken,
      abi: superTokenAbi,
      functionName: "symbol",
    });
    const underlyingToken = await publicClient.readContract({
      address: queryRes.recipient.poolChain.allocationToken,
      abi: superTokenAbi,
      functionName: "getUnderlyingToken",
    });

    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    let isPureSuperToken = false;
    let isNativeSuperToken = false;

    if (
      allocationTokenSymbol === "ETHx" ||
      allocationTokenSymbol === "DEGENx"
    ) {
      isNativeSuperToken = true;
    } else if (underlyingToken === ZERO_ADDRESS) {
      isPureSuperToken = true;
    }

    return {
      image: (
        <span tw='flex flex-col px-8 bg-violet-900 text-white'>
          <img src={banner} alt='Banner Image'></img>
          {/* {banner} */}
          <h4>
            ${chainName} {tokenName} by Flow State
          </h4>
          <p>A quadratic funding round every second</p>
          <h4>{title}</h4>
          <h4>{description}</h4>
          <p>Power their mission:</p>
          <p>
            1. Wrap ${chainName} to ${chainName}x (as needed){" "}
          </p>
          <p>2. Open a stream with real-time ${chainName} matching 🌊💸</p>
        </span>
      ),
      textInput: "Monthly Value",
      buttons: [
        <Button action='link' target={`https://sqf-degen-ui.vercel.app/`}>
          UI
        </Button>,
        <Button
          action='post'
          target={{
            pathname: "/grantee",
            query: {
              address,
              pool,
            },
          }}
        >
          Multiplier
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
              address: queryRes.recipient.superappAddress,
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
        amount,
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
