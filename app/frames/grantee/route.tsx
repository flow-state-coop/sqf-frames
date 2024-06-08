import { Button } from "frames.js/next";
import { frames } from "../frames";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
  return await frames(async (ctx) => {
    const address = ctx.state.address;
    const pool = ctx.state.pool;
    const chainId = ctx.state.chainId;
    const title = ctx.state.title;
    return {
      image: (
        <span tw='flex flex-col px-10'>
          <h3>Streaming QF- Degen Builders Round</h3>
          <h3>{title}</h3>
          <p>
            Open a $DEGEN donation stream that's matched with quadratic funding.
          </p>
          <p>
            The more DEGENS that donate, the higher the matching multiplier!
          </p>
        </span>
      ),
      textInput: "Monthly Value (Requires $DEGENx)",
      buttons: [
        <Button action='link' target={`https://sqf-degen-ui.vercel.app/`}>
          Learn about SQF
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
          post_url='/stream/success'
        >
          Create Stream
        </Button>,
      ],
    };
  })(req);
};

export const POST = handler;
export const GET = handler;
