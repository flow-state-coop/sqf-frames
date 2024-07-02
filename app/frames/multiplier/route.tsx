import { Button } from "frames.js/next";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { chainConfig } from "../constants";
import { frames } from "../frames";
import { superTokenAbi } from "../../lib/abi/superToken";

const apolloClient = new ApolloClient({
  uri: "https://api.streaming.fund/graphql",
  cache: new InMemoryCache(),
});

const handler = async (req: NextRequest) => {
  return await frames(async (ctx) => {
    const {
      address,
      pool,
      chainId,
      title,
      description,
      banner,
      logo,
      isPureSuperToken,
      chainName,
      tokenName,
    } = ctx.searchParams;

    return {
      image: (
        <span tw='flex flex-col p-10 bg-violet-600 text-white min-h-screen'>
          <h4>
            ${chainName} {tokenName} by Flow State
          </h4>
          <img src={banner} alt='Banner Image' width={1000} height={200} />
          <img src={logo} alt='Logo Image' width={200} height={200} />
          <h4>{title}</h4>
          <h4 className='line-clamp-3'>{description}</h4>
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
