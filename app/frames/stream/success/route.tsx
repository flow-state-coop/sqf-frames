/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames } from "../../frames";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
  return await frames(async (ctx) => {
    const {
      address = "",
      pool = "",
      amount = "1",
      chainId = "666666666",
      title = "",
    } = ctx.searchParams;

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
              title: title,
            },
          }}
        >
          Edit Stream
        </Button>,
      ],
      state: { address, pool, amount, chainId, title },
    };
  })(req);
};

export const GET = handler;
export const POST = handler;
