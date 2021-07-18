/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    PolicyInfo function
      useState hooks
      custom hooks
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useEffect, useState } from 'react'

/* import packages */
import { formatEther } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'

/* import constants */
import { Policy } from '../../constants/types'

/* import components */
import { Box, BoxItem, BoxItemTitle } from '../../components/Box'
import { FormCol } from '../../components/Input/Form'
import { FlexRow, HeroContainer } from '../../components/Layout'
import { Protocol, ProtocolImage, ProtocolTitle } from '../../components/Protocol'
import { Loader } from '../../components/Loader'
import { Text } from '../../components/Typography'

/* import hooks */
import { useAppraisePosition } from '../../hooks/usePolicy'

/* import utils */
import { getDays } from '../../utils/time'
import { truncateBalance } from '../../utils/formatting'

interface PolicyInfoProps {
  selectedPolicy: Policy | undefined
  latestBlock: number
  asyncLoading: boolean
}

export const PolicyInfo: React.FC<PolicyInfoProps> = ({ selectedPolicy, latestBlock, asyncLoading }) => {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/
  const [positionAmount, setPositionAmount] = useState<string | null>(null)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { getAppraisePosition } = useAppraisePosition()
  const wallet = useWallet()
  const { getProtocolByName } = useContracts()

  /*************************************************************************************

    useEffect Hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy) return
      const positionAmount = await getAppraisePosition(
        getProtocolByName(selectedPolicy.productName),
        selectedPolicy.positionContract
      )
      setPositionAmount(formatEther(positionAmount))
    }
    load()
  }, [selectedPolicy, wallet.account, wallet.chainId])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      <Box transparent pl={10} pr={10} pt={20} pb={20}>
        <BoxItem>
          <BoxItemTitle h3>Policy ID</BoxItemTitle>
          <Text h2 nowrap>
            {selectedPolicy?.policyId}
          </Text>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Days to expiration</BoxItemTitle>
          <Text h2 nowrap>
            {getDays(selectedPolicy ? parseFloat(selectedPolicy.expirationBlock) : 0, latestBlock)}
          </Text>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Cover Amount</BoxItemTitle>
          <Text h2 nowrap>
            {selectedPolicy?.coverAmount ? truncateBalance(formatEther(selectedPolicy.coverAmount)) : 0} ETH
          </Text>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Position Amount</BoxItemTitle>
          <Text h2 nowrap>
            {positionAmount && !asyncLoading ? (
              `${truncateBalance(positionAmount || '0')} ETH`
            ) : (
              <Loader width={10} height={10} />
            )}
          </Text>
        </BoxItem>
      </Box>
      <HeroContainer height={150}>
        <FlexRow>
          <FormCol>
            <Protocol style={{ alignItems: 'center', flexDirection: 'column' }}>
              <ProtocolImage width={70} height={70} mb={10}>
                <img src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}.svg`} />
              </ProtocolImage>
              <ProtocolTitle t2>{selectedPolicy?.productName}</ProtocolTitle>
            </Protocol>
          </FormCol>
          <FormCol>
            <Protocol style={{ alignItems: 'center', flexDirection: 'column' }}>
              <ProtocolImage width={70} height={70} mb={10}>
                <img src={`https://assets.solace.fi/${selectedPolicy?.positionName.toLowerCase()}.svg`} />
              </ProtocolImage>
              <ProtocolTitle t2>{selectedPolicy?.positionName}</ProtocolTitle>
            </Protocol>
          </FormCol>
        </FlexRow>
      </HeroContainer>
      <hr style={{ marginBottom: '20px' }} />
    </Fragment>
  )
}
