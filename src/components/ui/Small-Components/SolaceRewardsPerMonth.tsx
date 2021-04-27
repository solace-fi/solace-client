import React from "react";
import RoundedContainer from "./RoundedContainer";

interface props {
}

const SolaceRewardsPerMonth: React.FC<props> = () => {

    const SolaceRewardsPerMonth = 50;

    return(
        <>
            <RoundedContainer title="SolaceRewardsPerMonth" value={SolaceRewardsPerMonth}/>
        </>
    )
}

export default SolaceRewardsPerMonth;