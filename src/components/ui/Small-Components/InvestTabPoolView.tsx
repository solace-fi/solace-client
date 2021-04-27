import React from "react"
import styled from "styled-components";

const OuterDiv = styled.div`
    height: 100px;
    width: 775px;
    border: 1px solid #4287f5;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const InnerDiv = styled.div`
    height: 70px;
    width: 725px;
    display: flex;
    flex-direction: row;
    border: 1px solid green;
    border-radius: 20px;
`
const TableDiv = styled.div`
    height: 70px;
    width: 625px;
    border-radius: 20px;
    border: 1px solid yellow;
    display: flex;
    flex-direction: column;
`

const TopDiv = styled.div`
    height: 20px;
    width: 625px;
    border: 1px solid black;
    display: flex;
    flex-direction: row;
`

const BotDiv = styled.div`
    height: 50px;
    width: 625px;
    border: 1px solid green;
    background-color: Aquamarine;
    border-radius: 20px;
    display: flex;
    flex-direction: row;
`

const ButtonDiv = styled.div`
    width: 100px;
    height: 70px;
    border: 1px solid purple;
`
const NameDiv = styled.div`
    width: 125px;
    height: 20px;
`
const ContentDiv = styled.div`
    width: 125px;
    height: 50px;
`
const InvestButton = styled.div`
    height: 25px;
    width: 80px;
    border-radius: 20px;
    border: 1px solid green;
    background-color: blue;
    &:hover {
        background-color: yellow;
    }
`
interface props {
    UserRewards: number;
    ROI: number;
    TotalAssets: number;
    RewardsPerDay: number;
    Liquidity: number;
}

const InvestTabPoolView: React.FC<props> = ({UserRewards, ROI, TotalAssets, RewardsPerDay, Liquidity}) => {
    return (
        <OuterDiv>
            <InnerDiv>
                <TableDiv>
                    <TopDiv>
                        <NameDiv>
                            My Rewards
                        </NameDiv>
                        <NameDiv>
                            ROY(1Y)
                        </NameDiv>
                        <NameDiv>
                            Total Assets
                        </NameDiv>
                        <NameDiv>
                            Rewards
                        </NameDiv>
                        <NameDiv>
                            Liquidity
                        </NameDiv>
                    </TopDiv>
                    <BotDiv>
                        <ContentDiv>
                            {UserRewards} SOLACE
                        </ContentDiv>
                        <ContentDiv>    
                            {ROI}%
                        </ContentDiv>
                        <ContentDiv>
                            ${TotalAssets}
                        </ContentDiv>
                        <ContentDiv>
                            {RewardsPerDay} SOLACE/day
                        </ContentDiv>
                        <ContentDiv>
                            {Liquidity}
                        </ContentDiv>
                    </BotDiv>
                </TableDiv>
                <ButtonDiv>
                    <InvestButton >
                        INVEST
                    </InvestButton>
                </ButtonDiv>
            </InnerDiv>
        </OuterDiv>
    )
}

export default InvestTabPoolView;