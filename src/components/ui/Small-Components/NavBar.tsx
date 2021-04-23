import React from 'react'
import {Nav, NavLink} from './NavElements'

const NavBar = () => {
    return (
        <>
            <Nav>
                <NavLink to='/' >
                    <h1>Logo</h1>
                </NavLink>
                <NavLink to='/' >
                    Dashboard
                </NavLink>
                <NavLink to='/get_quote'>
                    Quote
                </NavLink>
                <NavLink to='/invest'>
                    Invest
                </NavLink>
                <NavLink to='/govern'>
                    Govern
                </NavLink>
            </Nav>
        </>
    )
}

export default NavBar;