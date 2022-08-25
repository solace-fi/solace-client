import React from 'react'
import { useGeneral } from '../../context/GeneralManager'
import { Button } from '../atoms/Button'
import { Flex } from '../atoms/Layout/Page'
import { HyperLink } from '../atoms/Link'
import { Text } from '../atoms/Typography'
import { Modal } from '../molecules/Modal'

export const TermsModal = ({ show, handleClose }: { show: boolean; handleClose: () => void }): JSX.Element => {
  const { appTheme, acceptTerms } = useGeneral()

  const handleCloseModal = () => {
    acceptTerms()
    handleClose()
  }

  return (
    <Modal isOpen={show} handleClose={handleClose} modalTitle={'Terms & Conditions'} disableCloseButton centerTitle>
      <Flex col itemsCenter gap={20}>
        <Text textAlignCenter width={270}>
          {`Please read, by entering you agree to our Terms & Conditions.`}
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
          >
            <Text t1>Read</Text>
          </Button>
        </HyperLink>
        <Button info py={10} widthP={100} onClick={handleCloseModal}>
          <Text t2_5s lineHeight={20}>
            Continue to website
          </Text>
        </Button>
      </Flex>
    </Modal>
  )
}
