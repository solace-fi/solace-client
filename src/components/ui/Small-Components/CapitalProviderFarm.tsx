import React from "react"
import InvestTabPoolView from './InvestTabPoolView'

interface props {
   
}

const CapitalProviderFarm: React.FC<props> = () => {

    const UserRewards = 50;
    const ROI = 50;
    const TotalAssets = 100;
    const RewardsPerDay = 78;
    const Liquidity = 80;

    return (
        <InvestTabPoolView UserRewards={UserRewards} ROI={ROI} TotalAssets={TotalAssets} RewardsPerDay={RewardsPerDay} Liquidity={Liquidity}/>
    )
};

export default CapitalProviderFarm