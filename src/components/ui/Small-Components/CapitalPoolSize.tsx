import React from "react";
import RoundedContainer from "./RoundedContainer";

interface props {
}

const CapitalPoolSize: React.FC<props> = () => {

    const PoolSize = 50;

    return(
        <>
            <RoundedContainer title="CapitalPoolSize" value={PoolSize}/>
        </>
    )
}

export default CapitalPoolSize;