class AccountModel {
  static buildFundingAssetRequestParams(timestamp: number): string {
    return `timestamp=${timestamp}`;
  }

  static toApiResponse<T>(data: T): T {
    return data;
  }
}

export default AccountModel;
