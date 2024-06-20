import { Button } from "frames.js/next";
import { frames } from "../frames";

const handler = frames(async (ctx) => {
  const adress = ctx.adress;
  const pool = ctx.pool;
  const amount = ctx.amount;
  const title = ctx.title;
  const chainId = ctx.chainId;
  return {
    image: (
      <div tw='flex relative'>
        <h1>Edit Stream</h1>
        <h2>Title {title}</h2>
        <h2>Current Monthly Amount: {amount}</h2>
      </div>
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
            address: adress,
            pool: pool,
            chainId: chainId,
          },
        }}
        post_url='/stream/success'
      >
        Create Stream
      </Button>,
    ],
  };
});

export const POST = handler;
export const GET = handler;
