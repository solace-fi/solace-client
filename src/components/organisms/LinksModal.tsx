/*************************************************************************************

    Table of Contents:

    import react
    import components

    LinksModal function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useCallback } from 'react'

/* import components */
import { Modal } from '../molecules/Modal'
import { HyperLink } from '../atoms/Link'
import { StyledDiscord, StyledGithub, StyledTwitter } from '../atoms/Icon'
import { Card, CardContainer } from '../atoms/Card'
import { Text } from '../atoms/Typography'

type LinksModalProps = {
  isOpen: boolean
  closeModal: () => void
}

export const LinksModal: React.FC<LinksModalProps> = ({ closeModal, isOpen }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'Community Links'} disableCloseButton={false}>
      <CardContainer>
        <HyperLink
          href={'https://discord.gg/7v8qsyepfu'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white' }}
        >
          <Card pt={20} pb={20} pl={0} pr={0} style={{ display: 'flex', justifyContent: 'center' }}>
            <StyledDiscord size={30} />
          </Card>
        </HyperLink>
        <HyperLink
          href={'https://twitter.com/solacefi'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white' }}
        >
          <Card pt={20} pb={20} pl={0} pr={0} style={{ display: 'flex', justifyContent: 'center' }}>
            <StyledTwitter size={30} />
          </Card>
        </HyperLink>
        <HyperLink
          href={'https://github.com/solace-fi'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white' }}
        >
          <Card pt={20} pb={20} pl={0} pr={0} style={{ display: 'flex', justifyContent: 'center' }}>
            <StyledGithub size={30} />
          </Card>
        </HyperLink>
        <HyperLink
          href={'https://docs.solace.fi/'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white' }}
        >
          <Card pt={20} pb={20} pl={0} pr={0} style={{ display: 'flex', justifyContent: 'center' }}>
            <Text t2>Documentation</Text>
          </Card>
        </HyperLink>
        <HyperLink
          href={'https://whitepaper.solace.fi/'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white' }}
        >
          <Card pt={20} pb={20} pl={0} pr={0} style={{ display: 'flex', justifyContent: 'center' }}>
            <Text t2>Whitepaper</Text>
          </Card>
        </HyperLink>
        <HyperLink
          href={'https://angel.co/company/solace-fi/jobs'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white' }}
        >
          <Card pt={20} pb={20} pl={0} pr={0} style={{ display: 'flex', justifyContent: 'center' }}>
            <Text t2>Jobs</Text>
          </Card>
        </HyperLink>
      </CardContainer>
    </Modal>
  )
}
