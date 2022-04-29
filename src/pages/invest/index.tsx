/*************************************************************************************

    Table of Contents:

    import packages
    import context
    import components
    import constants

    Invest 
      hooks
      local functions

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import context */
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Box } from '../../components/atoms/Box'
import { TextSpan, Text } from '../../components/atoms/Typography'
import { StyledInfo } from '../../components/atoms/Icon'
import { Content } from '../../components/atoms/Layout'
import { EarlyFarmRewardsWindow } from '../../components/organisms/EarlyFarmRewardsWindow'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { useWeb3React } from '@web3-react/core'

function Invest(): any {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { activeNetwork } = useNetwork()
  const { account } = useWeb3React()

  /*************************************************************************************

  Local functions

  *************************************************************************************/

  return (
    <>
      {!activeNetwork.config.restrictedFeatures.noFarmingV1 && account ? (
        <>
          <Content>
            <EarlyFarmRewardsWindow />
          </Content>
        </>
      ) : account ? (
        <Content>
          <Box error pt={10} pb={10} pl={15} pr={15}>
            <TextSpan light textAlignLeft>
              <StyledInfo size={30} />
            </TextSpan>
            <Text light bold style={{ margin: '0 auto' }}>
              Farms are not supported on this network.
            </Text>
          </Box>
        </Content>
      ) : (
        <PleaseConnectWallet />
      )}
    </>
  )
}

export default Invest
