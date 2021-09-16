/*************************************************************************************

    Table of Contents:

    import react
    import components
    import constants
    import hooks

    PageHeader function
      custom hooks
      Render

    Footer function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React from 'react'

/* import components */
import { FooterComponent } from '../atoms/Layout'
import { HyperLink } from '../atoms/Link'
import { CenteredHeader, FlexEndHeader } from '../atoms/Header'
import { Account, UserAccount } from './Account'
import { Prices } from '../molecules/Prices'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text } from '../atoms/Typography'

/* import constants */
import { MAX_TABLET_SCREEN_WIDTH, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { ThemeButton } from '../molecules/ThemeButton'
import { StyledDiscord, StyledGithub, StyledTwitter } from '../atoms/Icon'

export const PageHeader: React.FC = () => {
  /*************************************************************************************

      custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()

  /*************************************************************************************

      Render

  *************************************************************************************/
  return (
    <>
      {width > MAX_MOBILE_SCREEN_WIDTH && (
        <FlexEndHeader>
          {width > MAX_TABLET_SCREEN_WIDTH && <Prices />}
          <Account />
        </FlexEndHeader>
      )}
    </>
  )
}

export const Footer: React.FC = () => {
  /*************************************************************************************

      custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()

  /*************************************************************************************
    
          Render
    
  *************************************************************************************/
  return (
    <>
      {width < MAX_MOBILE_SCREEN_WIDTH ? (
        <FooterComponent>
          <CenteredHeader>
            <UserAccount />
          </CenteredHeader>
        </FooterComponent>
      ) : (
        <FooterComponent>
          <ButtonWrapper m={0}>
            <HyperLink
              href={'https://discord.gg/7v8qsyepfu'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <Button pt={10} pb={10} inconspicuous width={70} noradius>
                <StyledDiscord size={30} />
              </Button>
            </HyperLink>
            <HyperLink
              href={'https://twitter.com/solacefi'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <Button pt={10} pb={10} inconspicuous width={70} noradius>
                <StyledTwitter size={30} />
              </Button>
            </HyperLink>
            <HyperLink
              href={'https://github.com/solace-fi'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ lineHeight: '0' }}
            >
              <Button pt={10} pb={10} inconspicuous width={70} noradius>
                <StyledGithub size={30} />
              </Button>
            </HyperLink>
            <HyperLink href={'https://docs.solace.fi/'} target="_blank" rel="noopener noreferrer">
              <Button pt={10} pb={10} inconspicuous noradius>
                <Text autoAlign>Documentation</Text>
              </Button>
            </HyperLink>
            <HyperLink href={'https://whitepaper.solace.fi/'} target="_blank" rel="noopener noreferrer">
              <Button pt={10} pb={10} inconspicuous noradius>
                <Text autoAlign>Whitepaper</Text>
              </Button>
            </HyperLink>
            <HyperLink href={'https://angel.co/company/solace-fi/jobs'} target="_blank" rel="noopener noreferrer">
              <Button pt={10} pb={10} inconspicuous noradius>
                <Text autoAlign>Jobs</Text>
              </Button>
            </HyperLink>
            <ThemeButton pt={10} pb={10} inconspicuous noradius />
          </ButtonWrapper>
        </FooterComponent>
      )}
    </>
  )
}
