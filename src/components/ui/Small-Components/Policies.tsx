import React, { Props } from 'react'
import styled from 'styled-components';

const PolicyDiv = styled.div`
    width: 400px;
    height: 200px;
    background-color: blue;
    border-radius: 10px;
    border-width: 2px;
    border-style: solid;
    border-color: white;
`
const PolicyBtn = styled.button`

`


interface buttonProps {
    action: string;
}

const PolicyButton: React.FC<buttonProps> = ( {action} ) => {
    return(
        <>
            <PolicyBtn>{action}</PolicyBtn>
        </>
    )
}

interface props {

}

const Policies: React.FC<props> = () => {
    return (
        <PolicyDiv>
            <PolicyButton action="claim"/>
            <PolicyButton action="edit"/>
            <PolicyButton action="renew"/>
            <PolicyButton action="view"/>
        </PolicyDiv>
    )
}