import { KiteConnect } from "kiteconnect";

const kiteClient = new KiteConnect({
  api_key: process.env.ZERODHA_API_KEY as string,
});

kiteClient.setAccessToken(process.env.ZERODHA_ACCESS_TOKEN as string);

export default kiteClient;
