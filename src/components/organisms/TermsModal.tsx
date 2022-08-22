import React, { useEffect, useState } from 'react'
import { useGeneral } from '../../context/GeneralManager'
import { Button } from '../atoms/Button'
import { StyledLinkExternal } from '../atoms/Icon'
import { Flex } from '../atoms/Layout/Page'
import { HyperLink } from '../atoms/Link'
import { Text } from '../atoms/Typography'
import { Modal } from '../molecules/Modal'

export const TermsModal = ({ show, handleClose }: { show: boolean; handleClose: () => void }) => {
  const { appTheme, acceptTerms } = useGeneral()
  const [read, setRead] = useState(false)
  const [nextStep, setNextStep] = useState(false)

  const handleCloseModal = () => {
    acceptTerms()
    handleClose()
  }

  useEffect(() => {
    if (!read) return
    const interval = setInterval(() => {
      setNextStep(true)
    }, 3000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [read])

  return (
    <Modal isOpen={show} handleClose={handleClose} modalTitle={'Terms & Conditions'} disableCloseButton>
      <Flex col itemsCenter gap={20}>
        <Text textAlignCenter width={230}>
          Please read through our Terms and Conditions to use this website.
        </Text>
        <HyperLink
          href={'https://www.solace.fi/solace-terms-and-conditions'}
          target="_blank"
          rel="noopener noreferrer"
          widthP={100}
        >
          <Button
            py={20}
            widthP={100}
            warmgradient={appTheme == 'dark'}
            techygradient={appTheme == 'light'}
            secondary
            noborder
            onClick={() => setRead(true)}
          >
            <Text t1>
              Read <StyledLinkExternal size={26} />
            </Text>
          </Button>
        </HyperLink>
        <Button info py={10} widthP={100} disabled={!nextStep} onClick={handleCloseModal}>
          <Text t2_5s lineHeight={20}>
            I have read and agree to the terms and conditions
          </Text>
        </Button>
      </Flex>
    </Modal>
  )
}
