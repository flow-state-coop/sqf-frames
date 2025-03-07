import { Button } from "frames.js/next";
import { frames } from "../../../../frames";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { NextRequest } from "next/server";
import { chainConfig } from "../../../../constants";
import { superTokenAbi } from "../../../../../lib/abi/superToken";
import { createPublicClient, http } from "viem";

const apolloClient = new ApolloClient({
  uri: "https://api.flowstate.network/graphql",
  cache: new InMemoryCache(),
});

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);

  const pathSegments = url.pathname.split("/");

  const address = pathSegments.length > 3 ? pathSegments[3] || "" : "";
  const pool = pathSegments.length > 4 ? pathSegments[4] || "" : "";
  const chainId =
    pathSegments.length > 5 ? pathSegments[5] || "666666666" : "666666666";

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
  const { name, chainName, rpcUrl } = chainConfigEntry;

  const { data: queryRes } = await apolloClient.query({
    query: gql`
      query Recipient($pool: String!, $address: String!, $chainId: Int!) {
        recipient(id: $address, poolId: $pool, chainId: $chainId) {
          metadata
          superappAddress
          strategyAddress
          recipientAddress
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
    const recipientAddress = queryRes.recipient.recipientAddress ?? "";
    const poolName = queryRes.recipient.poolChain.metadata.name ?? "";
    const amount = ctx.message?.inputText || "";
    const description = queryRes.recipient.metadata.description ?? "";
    const strategyAddress = queryRes.recipient.strategyAddress ?? "";
    const banner =
      "https://gateway.pinata.cloud/ipfs/" +
      queryRes.recipient.metadata.bannerImg;
    const logo =
      "https://gateway.pinata.cloud/ipfs/" +
      queryRes.recipient.metadata.logoImg;

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

    const matchingTokenSymbol = await publicClient.readContract({
      address: queryRes.recipient.poolChain.matchingToken,
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

    const clampText = (str: string, newLength: number) => {
      if (str.length <= newLength) {
        return str;
      }

      return `${str.slice(0, newLength - 4)}...`;
    };

    const donationUrl =
      "https://flowstate.network/pool/?poolId=" +
      pool +
      "&chainId=" +
      chainId +
      "&recipientId=" +
      address;

    console.log("Donation URL ", donationUrl);

    return {
      image: (
        <span tw="flex flex-col p-10 bg-slate-900 text-white min-h-screen">
          <div tw="flex justify-center text-5xl p-0 m-0">
            <h4>{poolName} on Flow State</h4>
          </div>
          {/* <div tw='flex justify-center -mt-5'>
            <img src={banner} alt='Banner Image' width={1000} height={200} />
          </div> */}
          <div tw="flex relative mt-10">
            <img
              src={logo}
              alt="Logo Image"
              width={200}
              height={200}
              tw="rounded-3xl"
            />
          </div>
          <div tw="flex text-7xl font-bold ">
            <h4 tw="mt-10">{title}</h4>
          </div>
          <div tw="flex justify-center items-center text-white border bg-black rounded-3xl p-6">
            <h4>{clampText(description, 174)}</h4>
          </div>
          <div tw="flex justify-center items-center p-6">
            <p tw="text-center">
              Support {title} with real-time, quadratic matching below!
            </p>
          </div>
        </span>
      ),
      // textInput: "Monthly Value (Number)",
      buttons: [
        <Button
          action="post"
          target={{
            pathname: "/multiplier",
            query: {
              address: address,
              recipientAddress: recipientAddress,
              pool: pool,
              chainId: chainId,
              title: title,
              banner: banner,
              logo: logo,
              strategyAddress: strategyAddress,
              chainName: chainName,
              allocationTokenSymbol: allocationTokenSymbol,
              poolName: poolName,
              matchingTokenSymbol: matchingTokenSymbol,
            } as unknown as Record<string, string>,
          }}
        >
          Multiplier
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
        //       address: queryRes.recipient.superappAddress,
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
