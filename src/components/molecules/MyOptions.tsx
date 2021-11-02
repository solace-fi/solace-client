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

/* import utils */
import { accurateMultiply, truncateBalance } from '../../utils/formatting'

export const MyOptions: React.FC = () => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { haveErrors } = useGeneral()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { getGasConfig } = useGetFunctionGas()
  const gasConfig = useMemo(() => getGasConfig(gasPrices.selected?.value), [gasPrices, getGasConfig])
  const { activeNetwork, currencyDecimals } = useNetwork()
  const [openOptions, setOpenOptions] = useState<boolean>(true)
  const { optionsDetails, latestBlockTimestamp, exerciseOption } = useOptionsDetails()
  const { width } = useWindowDimensions()

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  const callExerciseOption = async (_optionId: string) => {
    await exerciseOption(_optionId, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callExerciseOption', err, FunctionName.EXERCISE_OPTION))
  }

  const handleToast = async (tx: any, localTx: LocalTx | null) => {
    if (!tx || !localTx) return
    addLocalTransactions(localTx)
    reload()
    makeTxToast(localTx.type, TransactionCondition.PENDING, localTx.hash)
    await tx.wait().then((receipt: any) => {
      const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
      makeTxToast(localTx.type, status, localTx.hash)
      reload()
    })
  }

  const handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    console.log(functionName, err)
    makeTxToast(txType, TransactionCondition.CANCELLED)
    reload()
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
                        {BigNumber.from(option.rewardAmount).gte(accurateMultiply(1, currencyDecimals))
                          ? truncateBalance(
                              formatUnits(option.rewardAmount, currencyDecimals),
                              width > BKPT_3 ? currencyDecimals : 2
                            )
                          : truncateBalance(
                              formatUnits(option.rewardAmount, currencyDecimals),
                              width > BKPT_3 ? currencyDecimals : 6
                            )}{' '}
                        SOLACE
                      </Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle t4 light>
                        Strike Price
                      </BoxItemTitle>
                      <Text t4 light>
                        {BigNumber.from(option.strikePrice).gte(accurateMultiply(1, currencyDecimals))
                          ? truncateBalance(
                              formatUnits(option.strikePrice, currencyDecimals),
                              width > BKPT_3 ? currencyDecimals : 2
                            )
                          : truncateBalance(
                              formatUnits(option.strikePrice, currencyDecimals),
                              width > BKPT_3 ? currencyDecimals : 6
                            )}{' '}
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
                      disabled={haveErrors || latestBlockTimestamp > option.expiry.toNumber()}
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
