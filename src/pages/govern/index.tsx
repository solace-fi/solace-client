/*************************************************************************************

    Table of Contents:

    import packages
    import components

    Govern

  *************************************************************************************/

/* import packages */
import React from 'react'
import { Button } from '../../components/atoms/Button'

/* import components */
import { Content, Flex, HeroContainer } from '../../components/atoms/Layout'
import { HyperLink } from '../../components/atoms/Link'
import { Text } from '../../components/atoms/Typography'

function Govern(): any {
  return (
    <HeroContainer p={10} style={{ height: 'unset' }}>
      <Content>
        <Text t1 textAlignCenter mb={20} bold>
          We are beginning the transition from a launch DAO to a community run DAO.
        </Text>
        <Text t3 textAlignCenter mb={10}>
          $SOLACE stakers can participate formal discussion via our forums page, and in voting through our @SnapshotLabs
          page.
        </Text>
      </Content>
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
        {/* <CardContainer cardsPerRow={2}>
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
        </CardContainer> */}
        <Flex
          gap={20}
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'grid',
            gridTemplateColumns: `1fr 1fr 1fr`,
          }}
        >
          <HyperLink
            href={
              'https://medium.com/solace-fi/solace-forms-a-launch-dao-to-deliver-its-defi-coverage-products-5137199369c2'
            }
            target="_blank"
            rel="noopener noreferrer"
            info
            t2
          >
            <Button widthP={100} info secondary>
              <Text textAlignCenter>Read DAO Article</Text>
            </Button>
          </HyperLink>
          <HyperLink href={'https://forum.solace.fi/'} target="_blank" rel="noopener noreferrer" info t2>
            <Button widthP={100} info secondary>
              <Text textAlignCenter>Visit Forum</Text>
            </Button>
          </HyperLink>
          <HyperLink href={'https://snapshot.org/#/solacefi.eth'} target="_blank" rel="noopener noreferrer" info t2>
            <Button widthP={100} info secondary>
              <Text textAlignCenter>Visit Snapshot</Text>
            </Button>
          </HyperLink>
        </Flex>
      </Content>
    </HeroContainer>
  )
}

export default Govern
