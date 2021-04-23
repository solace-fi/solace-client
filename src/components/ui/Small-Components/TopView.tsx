import { Pair } from "@uniswap/sdk";
import React from "react";
import styled from "styled-components";
import getPair from "../backend/getPair"


const ContainerView = styled.div`
    height: 100px;
    width: 200px;
    float: left;
`

const TopContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    overflow: hidden;
    justify-content: center;
    border-width: 9px;
    border-color: #000;
`

interface props {
    coin1: string;
    coin2: string;
    text: string;
}

interface pair {
    text: string;
}
const ConversionView: React.FC<props> = ( {coin1, coin2, text} ) => {


    return (
        <ContainerView>
            <p>
                {coin1}/{coin2} {text}
            </p>
        </ContainerView>
    )
}

const TopView: React.FC<pair> = ( {text} ) => {
     
    
    return (
        <TopContainer>
            <ConversionView coin1="DAI" coin2="ETH" text={text} />
            <ConversionView coin1="DAI" coin2="ETH" text={text} />
            <ConversionView coin1="DAI" coin2="ETH" text={text} />
            <ConversionView coin1="DAI" coin2="ETH" text={text} />
        </TopContainer>
    )
}

export default TopView