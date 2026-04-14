export interface BinanceAssetInr {
  symbol: string;
  quantity: number;
  price_inr: number;
  value_inr: number;
}

export interface BinancePortfolioInr {
  assets: BinanceAssetInr[];
  total_inr: number;
  funding: {
    assets: BinanceAssetInr[];
    total_inr: number;
  };
  spot: {
    assets: BinanceAssetInr[];
    total_inr: number;
  };
}
