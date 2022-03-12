/*************************************************************************************

    Table of Contents:

    import packages
    import components

    Bond
      Render

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import components */
import { HyperLink } from '../../components/atoms/Link'
import { Text } from '../../components/atoms/Typography'

import { BondV2 } from './BondV2'

function Bond(): any {
  return (
    <>
      <Text t4 pt={10} pb={10}>
        You can bond by selling your assets for SOLACE at a discounted price.
        <HyperLink
          t4
          href={'https://medium.com/solace-fi/bonds-staking-and-other-ways-to-get-solace-99e71ed3cf2'}
          target="_blank"
          rel="noopener noreferrer"
          info
        >
          {' '}
          More information on bonding here.
        </HyperLink>
      </Text>
      <BondV2 />
    </>
  )
}

export default Bond
