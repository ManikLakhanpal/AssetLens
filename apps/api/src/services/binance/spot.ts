import { Spot } from '@binance/spot';

const configurationRestAPI = {
    apiKey: process.env.BINANCE_API_KEY as string,
    apiSecret: process.env.BINANCE_API_SECRET as string,
};
const spotClient = new Spot({ configurationRestAPI });

export default spotClient;