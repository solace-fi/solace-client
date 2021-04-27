import React from "react";
import styled from "styled-components";

const OuterDiv = styled.div`
    height: 90px;
    width: 125px;
    border: 1px solid #4287f5;
    display: flex;
    justify-content: flex;
    flex-direction: column;
    border-radius: 20px;
`

interface props {
    title: string;
    value: number;
}

const RoundedContainer: React.FC<props> = ({title, value}) => {
    return(
        <OuterDiv>
            <div>
                {title}
            </div>
            <div>
                {value}
            </div>
        </OuterDiv>
    )
}

export default RoundedContainer;