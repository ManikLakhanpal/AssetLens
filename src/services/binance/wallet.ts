import { Wallet } from '@binance/wallet';

const configurationRestAPI = {
    apiKey: process.env.BINANCE_API_KEY as string,
    apiSecret: process.env.BINANCE_API_SECRET as string,
};
const walletClient = new Wallet({ configurationRestAPI });

export default walletClient;