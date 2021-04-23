import React from 'react';
import styled from 'styled-components';

interface props {
    title: string;
    size: number;
    isMoney?: boolean;
}

const BoxDiv = styled.div`
    height: 120px;
    width: 200px;
    background-color: red;
    border-radius: 10px;
    border-width: 2px;
    border-style: solid;
    border-color: white;
`


const LargeBox: React.FC<props> = ( {title, size}) => {
    
    return (
        <BoxDiv>
            <div>
                {title}
            </div>
            <div>
                {size}
            </div>
        </BoxDiv>
    )
}

export default LargeBox;
