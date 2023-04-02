const web3 = require("@solana/web3.js");
const sdk = require("@hxronetwork/parimutuelsdk");

const config = sdk.DEV_CONFIG;
const rpc = web3.clusterApiUrl("devnet");
const connection = new web3.Connection(rpc, "confirmed");

const parimutuel = new sdk.ParimutuelWeb3(config, connection);

const market = sdk.MarketPairEnum.BTCUSD;
//return an array of all markets for each expiry and their contests for each expiry in the BTCUSD pair
const markets = sdk.getMarketPubkeys(config, market);

const marketTerm = 60; // The expires are in seconds, so this would be the 1 min
const marketsByTime = markets.filter(
  (market) => market.duration === marketTerm
);

const Paris = async () => {
  const parimutuels = await parimutuel.getParimutuels(marketsByTime, 5);

  console.log(`\\nMarket Pair: BTCUSD\\nMarket Expiry Interval: 1 min\\n`);

  const usdcDec = 1_000_000;

  parimutuels.forEach((contest) => {
    const strike = contest.info.parimutuel.strike.toNumber() / usdcDec;
    const slotId = contest.info.parimutuel.strike.toNumber() / usdcDec;
    const longSide =
      contest.info.parimutuel.activeLongPositions.toNumber() / usdcDec;
    const shortSide =
      contest.info.parimutuel.activeShortPositions.toNumber() / usdcDec;
    const expired = contest.info.parimutuel.expired;

    const totalVolume = longSide + shortSide;

    const longOdds = sdk.calculateNetOdds(longSide, totalVolume, 0.03);
    const shortOdds = sdk.calculateNetOdds(shortSide, totalVolume, 0.03);

    // Pass in 0.03 to take into account the 3% Hxro Network standard fee
    // (50% of it goes to stakers)

    console.log(
      `\\nStrike: $ ${strike}\\nSlot: ${slotId}\\nLongs: $ ${longSide}\\nShorts: $ ${shortSide}\\nExprired?: ${
        expired ? "true" : "false"
      }`
    );
  });
};

Paris();
