/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../../frames";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
  return await frames(async (ctx) => {
    const amount = ctx.amount;
    const title = ctx.title;
    const address = ctx.address;
    const pool = ctx.pool;
    const chainId = ctx.chainId;

    return {
      image: (
        <span tw='flex flex-col px-10'>
          <h3>Success!</h3>
          <p>Your stream has been created.</p>
          <p>{title}</p>
          <p>{amount}</p>
        </span>
      ),
      buttons: [
        <Button action='link' target={`https://sqf-degen-ui.vercel.app/`}>
          SQF Round Details
        </Button>,
        <Button
          action='post'
          target={{
            pathname: "/edit",
            query: {
              address: address,
              pool: pool,
              chainId: chainId,
            },
          }}
        >
          Edit Stream
        </Button>,
      ],
      state: { address, pool, amount, chainId },
    };
  })(req);
};

export const GET = handler;
export const POST = handler;
