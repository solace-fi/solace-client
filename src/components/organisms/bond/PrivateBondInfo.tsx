/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks

    PrivateBondInfo
      custom hooks

  *************************************************************************************/

/* import packages */
import React, { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { FunctionName } from '../../../constants/enums'
import { BondTellerDetails } from '../../../constants/types'

/* import managers */
import { useNetwork } from '../../../context/NetworkManager'
import { useWallet } from '../../../context/WalletManager'
import { useContracts } from '../../../context/ContractsManager'

/* import components */
import { FormCol, FormRow } from '../../atoms/Form'
import { Text } from '../../atoms/Typography'
import { SmallBox } from '../../atoms/Box'

/* import hooks */
import { useReadToken } from '../../../hooks/useToken'

interface PrivateBondInfoProps {
  func: FunctionName
  selectedBondDetail?: BondTellerDetails
  assetBalance: BigNumber
  pncplDecimals: number | undefined
  calculatedAmountOut?: BigNumber
  calculatedAmountOut_X?: BigNumber
  isStaking: boolean
}

export const PrivateBondInfo: React.FC<PrivateBondInfoProps> = ({
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
          <FormRow mt={40} mb={10}>
            <FormCol>
              <Text bold>My Balance</Text>
            </FormCol>
            <FormCol>
              <Text info textAlignRight bold>
                {formatUnits(assetBalance, pncplDecimals)}{' '}
                {func == FunctionName.BOND_DEPOSIT_ETH_V1
                  ? activeNetwork.nativeCurrency.symbol
                  : selectedBondDetail?.principalData.principalProps?.symbol}
              </Text>
            </FormCol>
          </FormRow>
          <FormRow mb={5}>
            <FormCol>
              <Text bold>You Will Get</Text>
            </FormCol>
            <FormCol>
              <Text info textAlignRight bold>
                {calculatedAmountOut
                  ? `${formatUnits(calculatedAmountOut, readSolaceToken.decimals)} ${readSolaceToken.symbol}`
                  : `-`}
              </Text>
            </FormCol>
          </FormRow>
          <FormRow mb={30} jc={'right'}>
            <SmallBox transparent collapse={!isStaking} m={0} p={0}>
              <FormRow mb={10}>
                <FormCol></FormCol>
                <FormCol>
                  <Text t4 textAlignRight>
                    {'( '}
                    {calculatedAmountOut_X
                      ? `${formatUnits(calculatedAmountOut_X, readXSolaceToken.decimals)} ${readXSolaceToken.symbol}`
                      : `-`}
                    {' )'}
                  </Text>
                </FormCol>
              </FormRow>
            </SmallBox>
          </FormRow>
        </>
      )}
    </>
  )
}
