/*************************************************************************************

    Table of Contents:

    import packages
    import components
    import utils

    Govern

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import components */
import { HeroContainer } from '../../components/atoms/Layout'
import { HyperLink } from '../../components/atoms/Link'
import { Text } from '../../components/atoms/Typography'

/* import utils */

function Govern(): any {
  return (
    <HeroContainer p={10}>
      <Text t1 textAlignCenter mb={20}>
        Solace is currently running a Launch DAO.
      </Text>
      <Text t1 textAlignCenter mb={10}>
        We will eventually transition into a community-run DAO structure.
      </Text>
      <Text t2 textAlignCenter>
        See our Medium blog post{' '}
        <HyperLink
          href={
            'https://medium.com/solace-fi/solace-forms-a-launch-dao-to-deliver-its-defi-coverage-products-5137199369c2'
          }
          target="_blank"
          rel="noopener noreferrer"
          info
          t2
        >
          here
        </HyperLink>{' '}
        to learn more about our approach to governance.
      </Text>
    </HeroContainer>
  )
}

export default Govern
