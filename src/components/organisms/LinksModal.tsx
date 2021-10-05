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
import {
  StyledDiscord,
  StyledDocuments,
  StyledDocumentText,
  StyledGithub,
  StyledMedium,
  StyledTwitter,
  StyledWork,
} from '../atoms/Icon'
import { Card, CardContainer } from '../atoms/Card'
import { Heading4 } from '../atoms/Typography'
import { Scrollable } from '../atoms/Layout'
import { FormRow } from '../atoms/Form'
import { ModalCell } from '../atoms/Modal'

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
      <Scrollable>
        <CardContainer>
          <HyperLink
            href={'https://docs.solace.fi/'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <Card pt={5} pb={5} pl={30} pr={30} style={{ display: 'flex', justifyContent: 'center' }}>
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <StyledDocuments size={30} />
                </ModalCell>
                <ModalCell p={10}>
                  <Heading4 high_em>Docs</Heading4>
                </ModalCell>
              </FormRow>
            </Card>
          </HyperLink>
          <HyperLink
            href={'https://whitepaper.solace.fi/'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <Card pt={5} pb={5} pl={30} pr={30} style={{ display: 'flex', justifyContent: 'center' }}>
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <StyledDocumentText size={30} />
                </ModalCell>
                <ModalCell p={10}>
                  <Heading4 high_em>Whitepaper</Heading4>
                </ModalCell>
              </FormRow>
            </Card>
          </HyperLink>
          <HyperLink
            href={'https://angel.co/company/solace-fi/jobs'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <Card pt={5} pb={5} pl={30} pr={30} style={{ display: 'flex', justifyContent: 'center' }}>
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <StyledWork size={30} />
                </ModalCell>
                <ModalCell p={10}>
                  <Heading4 high_em>Jobs</Heading4>
                </ModalCell>
              </FormRow>
            </Card>
          </HyperLink>
          <HyperLink
            href={'https://discord.gg/7v8qsyepfu'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <Card pt={5} pb={5} pl={30} pr={30} style={{ display: 'flex', justifyContent: 'center' }}>
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <StyledDiscord size={30} />
                </ModalCell>
                <ModalCell p={10}>
                  <Heading4 high_em>Discord</Heading4>
                </ModalCell>
              </FormRow>
            </Card>
          </HyperLink>
          <HyperLink
            href={'https://twitter.com/solacefi'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <Card pt={5} pb={5} pl={30} pr={30} style={{ display: 'flex', justifyContent: 'center' }}>
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <StyledTwitter size={30} />
                </ModalCell>
                <ModalCell p={10}>
                  <Heading4 high_em>Twitter</Heading4>
                </ModalCell>
              </FormRow>
            </Card>
          </HyperLink>
          <HyperLink
            href={'https://github.com/solace-fi'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <Card pt={5} pb={5} pl={30} pr={30} style={{ display: 'flex', justifyContent: 'center' }}>
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <StyledGithub size={30} />
                </ModalCell>
                <ModalCell p={10}>
                  <Heading4 high_em>GitHub</Heading4>
                </ModalCell>
              </FormRow>
            </Card>
          </HyperLink>
          <HyperLink
            href={'https://medium.com/solace-fi'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <Card pt={5} pb={5} pl={30} pr={30} style={{ display: 'flex', justifyContent: 'center' }}>
              <FormRow mb={0}>
                <ModalCell p={10}>
                  <StyledMedium size={30} />
                </ModalCell>
                <ModalCell p={10}>
                  <Heading4 high_em>Medium</Heading4>
                </ModalCell>
              </FormRow>
            </Card>
          </HyperLink>
        </CardContainer>
      </Scrollable>
    </Modal>
  )
}
