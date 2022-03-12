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
import React, { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { FunctionName } from '../../../../constants/enums'
import { BondTellerDetails } from '../../../../constants/types'

/* import managers */
import { useNetwork } from '../../../../context/NetworkManager'
import { useWallet } from '../../../../context/WalletManager'
import { useContracts } from '../../../../context/ContractsManager'

/* import components */
import { Flex } from '../../../atoms/Layout'
import { Text } from '../../../atoms/Typography'
import { SmallBox } from '../../../atoms/Box'

/* import hooks */
import { useReadToken } from '../../../../hooks/contract/useToken'

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

  const { account } = useWallet()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolaceV1)
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
                ? `${formatUnits(calculatedAmountOut, readSolaceToken.decimals)} ${readSolaceToken.symbol}`
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
                    ? `${formatUnits(calculatedAmountOut_X, readXSolaceToken.decimals)} ${readXSolaceToken.symbol}`
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
