import React from "react";
import styled from "styled-components"
import {NavLink as Link} from "react-router-dom";

export const Nav = styled.nav`
    background: #000;
    display: block;
    justify-content: space-between;
    padding: 0.1rem;
    z-index: 10;
    position: fixed;
    width: 100px;
    height: '100%';
    
`
export const NavLink = styled(Link)`
    color: #fff;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    float: left;
    &.active {
        color: #15cdfc;
    }
`


