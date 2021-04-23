import React from 'react';
import styled from 'styled-components'

const StyledDiv = styled.div`
    height: 80px;
    width: 200px;
    background-color: yellow;
    margin-left: 50px;
    margin-right: 50px;
`
const Box = styled.div`
    height: 40px;
    width: 160px;
    margin-left: 20px;
    margin-right: 20px;
    background-color: blue;
    border-radius: 10px;
    border-width: 2px;
    border-style: solid;
    border-color: white;
`

interface props {
    title: string;
    contents: string;
}


const MyRewards: React.FC<props> = ( {title, contents} ) => {
    return (
        <StyledDiv>
            <h6>{title}</h6>
            <Box>
                {contents}
            </Box>
        </StyledDiv>
    )
}

export default MyRewards;