import { Button } from "frames.js/next";
import { frames } from "../../../../frames";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { NextRequest } from "next/server";
import { chainConfig } from "../../../../constants";
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

  const { name, chainName, rpcUrl } = chainConfigEntry;

  const { data: queryRes } = await apolloClient.query({
    query: gql`
      query Recipient($pool: String!, $address: String!, $chainId: Int!) {
        recipient(id: $address, poolId: $pool, chainId: $chainId) {
          metadata
          superappAddress
          strategyAddress
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
    const title = queryRes.recipient.metadata.title ?? "";
    const allocationToken = queryRes.recipient.poolChain.allocationToken ?? "";
    const tokenName = queryRes.recipient.poolChain.metadata.name ?? "";
    const amount = ctx.message?.inputText || "";
    const description = queryRes.recipient.metadata.description ?? "";
    const strategyAddress = queryRes.recipient.strategyAddress ?? "";
    const banner =
      "https://ipfs.io/ipfs/" + queryRes.recipient.metadata.bannerImg;
    const logo = "https://ipfs.io/ipfs/" + queryRes.recipient.metadata.logoImg;

    const publicClient = createPublicClient({
      transport: http(rpcUrl),
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
        <span tw='flex flex-col p-10 bg-slate-900 text-white min-h-screen'>
          <div tw='flex justify-center p-0 m-0'>
            <h4>
              ${name} {tokenName} by Flow State
            </h4>
          </div>
          <div tw='flex justify-center'>
            <img src={banner} alt='Banner Image' width={1000} height={200} />
          </div>
          <div tw='flex left-5 top-5'>
            <img src={logo} alt='Logo Image' width={200} height={200} />
          </div>
          <h4>{title}</h4>
          <h4>{description}</h4>
        </span>
      ),
      textInput: "Monthly Value (Number)",
      buttons: [
        <Button action='link' target={`https://sqf-degen-ui.vercel.app/`}>
          UI
        </Button>,
        <Button
          action='post'
          target={{
            pathname: "/multiplier",
            query: {
              address: address,
              pool: pool,
              chainId: chainId,
              title: title,
              banner: banner,
              logo: logo,
              isPureSuperToken: isPureSuperToken,
              strategyAddress: strategyAddress,
              chainName: chainName,
              tokenName: tokenName,
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
        address: address || "",
        pool: pool || "",
        amount,
        chainId: chainId || "666666666",
        title: title || "",
      },
      imageOptions: {
        aspectRatio: "1:1",
      },
    };
  })(req);
};

export const POST = handler;
export const GET = handler;
