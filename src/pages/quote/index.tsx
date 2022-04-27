/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components

    Quote
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { MultiStepForm } from './MultiStepForm'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'
import { HeroContainer, Content } from '../../components/atoms/Layout'
import { Box } from '../../components/atoms/Box'
import { StyledInfo } from '../../components/atoms/Icon'
import { useWeb3React } from '@web3-react/core'

function Quote(): any {
  /*************************************************************************************
    
  hooks

  *************************************************************************************/
  const { active, account } = useWeb3React()
  const { activeNetwork } = useNetwork()

  return !active || !account ? (
    <HeroContainer>
      <Text bold t1 textAlignCenter>
        Please connect your wallet to buy coverage
      </Text>
      <WalletConnectButton info welcome secondary />
    </HeroContainer>
  ) : !activeNetwork.config.restrictedFeatures.noCoverProducts ? (
    <MultiStepForm />
  ) : (
    <Content>
      <Box error pt={10} pb={10} pl={15} pr={15}>
        <TextSpan light textAlignLeft>
          <StyledInfo size={30} />
        </TextSpan>
        <Text light bold style={{ margin: '0 auto' }}>
          Coverage products are not supported on this network.
        </Text>
      </Box>
    </Content>
  )
}

export default Quote
