import { Button } from "frames.js/next";
import { frames } from "../frames";

const handler = frames(async (ctx) => {
  const { address, pool, amount, chainId, title } = ctx.searchParams;
  return {
    image: (
      <span tw='flex flex-col px-10'>
        <h1>Edit Stream</h1>
        <h2>Title {title}</h2>
        <h2>Current Monthly Amount: {amount}</h2>
      </span>
    ),
    textInput: "Edit Monthly Value",
    buttons: [
      <Button action='link' target={`https://sqf-degen-ui.vercel.app/`}>
        Learn about SQF
      </Button>,
      <Button action='post' target={"/grantee/2345"}>
        Check the Multiplier
      </Button>,
      <Button
        action='tx'
        target={{
          pathname: "/stream/updateFlow",
          query: {
            address: address,
            pool: pool,
            chainId: chainId,
          },
        }}
        post_url='/stream/success'
      >
        Edit Stream
      </Button>,
    ],
  };
});

export const POST = handler;
export const GET = handler;
