import { Button } from "frames.js/next";
import { frames } from "../../../../frames";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { NextRequest } from "next/server";

const apolloClient = new ApolloClient({
  uri: "https://api.streaming.fund/graphql",
  cache: new InMemoryCache(),
});

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);

  const pathSegments = url.pathname.split("/");

  const address = pathSegments.length > 3 ? pathSegments[3] || "" : "";
  const pool = pathSegments.length > 4 ? pathSegments[4] || "" : "";
  const chainId = pathSegments.length > 5 ? pathSegments[5] : "";

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
    return {
      image: (
        <span tw='flex flex-col px-10 '>
          <h4>
            ${allocationToken} {tokenName} by Flow State
          </h4>
          <h4>{title}</h4>
          <h4>{description}</h4>
          <p>
            Open a $DEGEN donation stream that's matched with quadratic funding.
          </p>
          <p>
            The more DEGENS that donate, the higher the matching multiplier!
          </p>
        </span>
      ),
      textInput: "Monthly Value",
      buttons: [
        <Button action='link' target={`https://sqf-degen-ui.vercel.app/`}>
          SQF Round Details
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
          Check the Multiplier
        </Button>,
        <Button
          action='tx'
          target={{
            pathname: "/stream/wrapDegen",
            query: {
              chainId: chainId,
            },
          }}
          post_url={`/grantee/${address}/${pool}/${chainId}`}
        >
          Wrap to DegenX
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
          Create Stream
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
