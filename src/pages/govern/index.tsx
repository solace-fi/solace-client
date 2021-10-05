import React from 'react'
import { HeroContainer } from '../../components/atoms/Layout'
import { HyperLink } from '../../components/atoms/Link'
import { Heading1, Heading2 } from '../../components/atoms/Typography'
function Govern(): any {
  return (
    <HeroContainer>
      <Heading1 textAlignCenter>Solace is currently running a Launch DAO.</Heading1>
      <Heading1 textAlignCenter>We will eventually transition into a community-run DAO structure.</Heading1>
      <Heading2 textAlignCenter>
        See our Medium blog post{' '}
        <HyperLink
          href={
            'https://medium.com/solace-fi/solace-forms-a-launch-dao-to-deliver-its-defi-coverage-products-5137199369c2'
          }
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'yellow' }}
        >
          here
        </HyperLink>{' '}
        to learn more about our approach to governance.
      </Heading2>
    </HeroContainer>
  )
}

export default Govern
