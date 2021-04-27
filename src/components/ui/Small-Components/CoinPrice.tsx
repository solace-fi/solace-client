import React from "react"
import styled from 'styled-components';

const PriceDiv = styled.div`
    height: 50px;
    width: 250px;
    background-color: blue;
    flex-direction: row;
    display: flex;
    justify-content: center;
    position: relative;
    border: 1px solid #000;
`

const DisplayDiv = styled.div`
    height: 50px;
    width: 60px;
    background-color: green;
    padding-left: 10px;
    padding-right: 10px;
    vertical-align: text-bottom;
`

interface props {
    coinName: string;
    coinValue: number;
    coinChange?: number;

}

const CoinPrice: React.FC<props> = ({ coinName , coinValue }) => {
    return (
        <PriceDiv>
            <DisplayDiv>
                    
                    {coinName}
                    
        
            </DisplayDiv>
            <DisplayDiv>
                    
                    {coinValue}
                    
            </DisplayDiv>
        </PriceDiv>
    )
}

export default CoinPrice;