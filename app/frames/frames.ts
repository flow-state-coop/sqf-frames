import { createFrames } from "frames.js/next";

type State = {
  address: string;
  pool: string;
  amount: string;
  chainId: string;
  title: string;
};

export const frames = createFrames<State>({
  basePath: "/frames",
  initialState: { address: "", pool: "", amount: "", chainId: "", title: "" },
});
