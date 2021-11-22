/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    MyOptions
      hooks
      contract functions

  *************************************************************************************/

/* import packages */
import React, { useMemo, useState } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useNotifications } from '../../context/NotificationsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { CardContainer, Card } from '../atoms/Card'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text } from '../atoms/Typography'
import { Content } from '../atoms/Layout'
import { StyledArrowDropDown } from '../atoms/Icon'
import { Accordion } from '../atoms/Accordion'

/* import constants */
import { Option, LocalTx } from '../../constants/types'
import { BKPT_3 } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'

/* import hooks */
import { useOptionsDetails } from '../../hooks/useOptionsFarming'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useGetFunctionGas } from '../../hooks/useGas'
import { useInputAmount } from '../../hooks/useInputAmount'

/* import utils */
import { accurateMultiply, truncateBalance } from '../../utils/formatting'

export const MyOptions: React.FC = () => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { haveErrors } = useGeneral()
  const { getAutoGasConfig } = useGetFunctionGas()
  const gasConfig = useMemo(() => getAutoGasConfig(), [getAutoGasConfig])
  const { activeNetwork, currencyDecimals } = useNetwork()
  const [openOptions, setOpenOptions] = useState<boolean>(true)
  const { optionsDetails, latestBlockTimestamp, exerciseOption } = useOptionsDetails()
  const { width } = useWindowDimensions()
  const { handleToast, handleContractCallError } = useInputAmount()

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  const callExerciseOption = async (_optionId: string) => {
    await exerciseOption(_optionId, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callExerciseOption', err, FunctionName.EXERCISE_OPTION))
  }

  return (
    <Content>
      <Text t1 bold mb={0}>
        My Options
        <Button style={{ float: 'right' }} onClick={() => setOpenOptions(!openOptions)}>
          <StyledArrowDropDown style={{ transform: openOptions ? 'rotate(180deg)' : 'rotate(0deg)' }} size={20} />
          {openOptions ? 'Hide Options' : 'Show Options'}
        </Button>
      </Text>
      <Text t4 pt={10} pb={10}>
        Options are special tokens granting you the right to purchase $SOLACE at a discount. You can earn $SOLACE
        options by underwriting coverage and staking in the Options Farming Pool.
      </Text>
      <Accordion isOpen={openOptions}>
        {optionsDetails.length > 0 ? (
          <CardContainer cardsPerRow={2} p={10}>
            {optionsDetails.map((option: Option) => {
              const formattedBalance = formatUnits(option.rewardAmount, currencyDecimals)
              const isBalanceGreaterThanOrEqualTo1 = BigNumber.from(option.rewardAmount).gte(
                accurateMultiply(1, currencyDecimals)
              )
              const customBalanceDecimals = isBalanceGreaterThanOrEqualTo1 ? 2 : 6

              const formattedPrice = formatUnits(option.strikePrice, currencyDecimals)
              const isPriceGreaterThanOrEqualTo1 = BigNumber.from(option.strikePrice).gte(
                accurateMultiply(1, currencyDecimals)
              )
              const customPriceDecimals = isPriceGreaterThanOrEqualTo1 ? 2 : 6
              const isExpired = latestBlockTimestamp > option.expiry.toNumber()
              return (
                <Card key={option.id.toString()}>
                  <Box pt={20} pb={20} success>
                    <BoxItem>
                      <BoxItemTitle t4 light>
                        ID
                      </BoxItemTitle>
                      <Text t4 light>
                        {option.id}
                      </Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle t4 light>
                        Reward Amount
                      </BoxItemTitle>
                      <Text t4 light>
                        {truncateBalance(formattedBalance, width > BKPT_3 ? currencyDecimals : customBalanceDecimals)}{' '}
                        SOLACE
                      </Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle t4 light>
                        Strike Price
                      </BoxItemTitle>
                      <Text t4 light>
                        {truncateBalance(formattedPrice, width > BKPT_3 ? currencyDecimals : customPriceDecimals)}{' '}
                        {activeNetwork.nativeCurrency}
                      </Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle t4 light>
                        Expiry
                      </BoxItemTitle>
                      <Text t4 light>
                        {option.expiry}
                      </Text>
                    </BoxItem>
                  </Box>
                  <ButtonWrapper pb={0} pt={20}>
                    <Button
                      widthP={100}
                      onClick={() => callExerciseOption(option.id.toString())}
                      info
                      disabled={haveErrors || isExpired}
                    >
                      Exercise Option
                    </Button>
                  </ButtonWrapper>
                </Card>
              )
            })}
          </CardContainer>
        ) : (
          <Text t2 textAlignCenter>
            Options will be available when the SOLACE token is deployed.
          </Text>
        )}
      </Accordion>
    </Content>
  )
}
