/*************************************************************************************

    Table of Contents:

    import react
    import components

    SidebarItemList function
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import components */
import { ItemText, ItemList } from '../atoms/Navbar'

export const SidebarItemList: React.FC = ({ children }) => {
  /*************************************************************************************

  Render

  *************************************************************************************/
  return (
    <ItemList>
      {React.Children.map(children, (child: any) => (
        <ItemText>{child}</ItemText>
      ))}
    </ItemList>
  )
}
