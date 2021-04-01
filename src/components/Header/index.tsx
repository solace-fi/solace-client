import { NavLink, Link } from 'react-router-dom'
import React, { Fragment } from 'react'

export const Header = (props: any) => {
  return (
    <Fragment>
      <NavLink className="dashboard-nav-link" to={'/'}>
        Dashboard
      </NavLink>
      <NavLink className="invest-nav-link" to={'/invest'}>
        Invest
      </NavLink>
      <NavLink className="quote-nav-link" to={'/quote'}>
        Quote
      </NavLink>
    </Fragment>
  )
}

export default Header
