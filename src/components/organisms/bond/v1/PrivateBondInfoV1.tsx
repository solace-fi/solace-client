/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks

    PrivateBondInfoV1
      custom hooks

  *************************************************************************************/

/* import packages */
import React from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { FunctionName } from '../../../../constants/enums'
import { BondTellerDetails } from '../../../../constants/types'

/* import managers */
import { useNetwork } from '../../../../context/NetworkManager'

/* import components */
import { Flex } from '../../../atoms/Layout'
import { Text } from '../../../atoms/Typography'
import { SmallBox } from '../../../atoms/Box'
import { SOLACE_TOKEN, XSOLACE_V1_TOKEN } from '../../../../constants/mappings/token'
import { useWeb3React } from '@web3-react/core'

interface PrivateBondInfoV1Props {
  func: FunctionName
  selectedBondDetail?: BondTellerDetails
  assetBalance: BigNumber
  pncplDecimals: number | undefined
  calculatedAmountOut?: BigNumber
  calculatedAmountOut_X?: BigNumber
  isStaking: boolean
}

export const PrivateBondInfoV1: React.FC<PrivateBondInfoV1Props> = ({
  func,
  selectedBondDetail,
  assetBalance,
  pncplDecimals,
  calculatedAmountOut,
  calculatedAmountOut_X,
  isStaking,
}) => {
  /*

  custom hooks

  */

  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  return (
    <>
      {account && (
        <>
          <Flex stretch between mt={40} mb={10}>
            <Text bold>My Balance</Text>
            <Text info textAlignRight bold>
              {formatUnits(assetBalance, pncplDecimals)}{' '}
              {func == FunctionName.BOND_DEPOSIT_ETH_V1
                ? activeNetwork.nativeCurrency.symbol
                : selectedBondDetail?.principalData.principalProps?.symbol}
            </Text>
          </Flex>
          <Flex stretch between mb={5}>
            <Text bold>You Will Get</Text>
            <Text info textAlignRight bold>
              {calculatedAmountOut
                ? `${formatUnits(calculatedAmountOut, SOLACE_TOKEN.constants.decimals)} ${
                    SOLACE_TOKEN.constants.symbol
                  }`
                : `-`}
            </Text>
          </Flex>
          <Flex stretch between mb={30} style={{ justifyContent: 'right' }}>
            <SmallBox transparent collapse={!isStaking} m={0} p={0}>
              <Flex stretch between mb={10}>
                <Text></Text>
                <Text t4 textAlignRight>
                  {'( '}
                  {calculatedAmountOut_X
                    ? `${formatUnits(calculatedAmountOut_X, XSOLACE_V1_TOKEN.constants.decimals)} ${
                        XSOLACE_V1_TOKEN.constants.symbol
                      }`
                    : `-`}
                  {' )'}
                </Text>
              </Flex>
            </SmallBox>
          </Flex>
        </>
      )}
    </>
  )
}
