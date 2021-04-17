import React from 'react';

import { ChainId, Fetcher, Route, WETH, Trade, TokenAmount, TradeType } from '@uniswap/sdk';

const chainId = ChainId.MAINNET
const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // tokenaddress of DAI

async function getPair() {
  // Fetch Token Data according to TokenAddress taken from etherscan
  const dai = await Fetcher.fetchTokenData(chainId, tokenAddress);

  // Fetch Trading Token Data ' Wrapped Ether '
  const weth = WETH[chainId];

  // Fetch theoretical pair data with dai and weth
  const pair = await Fetcher.fetchPairData(dai, weth);
  const route = new Route([pair], weth);
  
  // Fetch theoretical prices when trading 1 wETH to DAI
  const trade = new Trade(route, new TokenAmount(weth ,'1000000000000000'), TradeType.EXACT_INPUT)
  console.log(trade.executionPrice.toSignificant(6));
  return trade.executionPrice.toSignificant(6);
};

export default getPair;