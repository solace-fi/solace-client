import React from "react";
import RoundedContainer from "./RoundedContainer";

interface props {
}

const TotalValueLocked: React.FC<props> = () => {

    const TotalValueLocked = 50;

    return(
        <>
            <RoundedContainer title="TotalValueLocked" value={TotalValueLocked}/>
        </>
    )
}

export default TotalValueLocked;