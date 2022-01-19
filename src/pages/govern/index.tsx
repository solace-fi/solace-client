/*************************************************************************************

    Table of Contents:

    import packages
    import components

    Govern

  *************************************************************************************/

/* import packages */
import React from 'react'
import { Card, CardContainer } from '../../components/atoms/Card'

/* import components */
import { Content, HeroContainer } from '../../components/atoms/Layout'
import { HyperLink } from '../../components/atoms/Link'
import { Text } from '../../components/atoms/Typography'

function Govern(): any {
  return (
    <HeroContainer p={10}>
      <Text t1 textAlignCenter mb={20}>
        We are beginning the transition from a launch DAO to a community run DAO.
      </Text>
      <Text t1 textAlignCenter mb={10}>
        $SOLACE stakers can participate formal discussion via our forums page, and in voting through our @SnapshotLabs
        page.
      </Text>
      {/* <Text t2 textAlignCenter>
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
      </Text> */}
      <Content>
        <CardContainer cardsPerRow={2}>
          <HyperLink
            href={
              'https://medium.com/solace-fi/solace-forms-a-launch-dao-to-deliver-its-defi-coverage-products-5137199369c2'
            }
            target="_blank"
            rel="noopener noreferrer"
            info
            t2
          >
            <Card canHover>
              <Text textAlignCenter>Launch DAO Article</Text>
            </Card>
          </HyperLink>
          <HyperLink href={'https://forum.solace.fi/'} target="_blank" rel="noopener noreferrer" info t2>
            <Card canHover>
              <Text textAlignCenter>Forum</Text>
            </Card>
          </HyperLink>
          <HyperLink href={'https://snapshot.org/#/solacefi.eth'} target="_blank" rel="noopener noreferrer" info t2>
            <Card canHover>
              <Text textAlignCenter>Snapshot</Text>
            </Card>
          </HyperLink>
        </CardContainer>
      </Content>
    </HeroContainer>
  )
}

export default Govern
