/*************************************************************************************

    Table of Contents:

    import react
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

/* import react */
import React, { useEffect, useState } from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { CardContainer, Card } from '../atoms/Card'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text } from '../atoms/Typography'
import { Content } from '../atoms/Layout'
import { StyledArrowDropDown } from '../../components/atoms/Icon'
import { Accordion } from '../atoms/Accordion/Accordion'

/* import constants */
import { Option } from '../../constants/types'
import { GAS_LIMIT, BKPT_3 } from '../../constants'
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'

/* import hooks */
import { useOptionsDetails } from '../../hooks/useOptionsFarming'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useGasConfig } from '../../hooks/useGas'

/* import utils */
import { accurateMultiply, truncateBalance } from '../../utils/formatting'

export const MyOptions: React.FC = () => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { haveErrors } = useGeneral()
  const { account, library } = useWallet()
  const { optionsFarming } = useContracts()
  const { addLocalTransactions, reload, gasPrices, latestBlock } = useCachedData()
  const { makeTxToast } = useToasts()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)
  const { activeNetwork, currencyDecimals } = useNetwork()
  const [openOptions, setOpenOptions] = useState<boolean>(true)
  const optionsDetails = useOptionsDetails(account)
  const { width } = useWindowDimensions()
  const [latestBlockTimestamp, setLatestBlockTimestamp] = useState<number>(0)

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  const exerciseOption = async (_optionId: string) => {
    if (!optionsFarming || !_optionId) return
    const txType = FunctionName.WITHDRAW_CLAIMS_PAYOUT
    try {
      const tx = await optionsFarming.exerciseOption(_optionId, {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: `Option #${String(_optionId)}`,
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      reload()
    }
  }

  useEffect(() => {
    if (!library || !latestBlock) return
    setLatestBlockTimestamp(latestBlock.timestamp)
  }, [latestBlock, library])

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
                  <ButtonWrapper mb={0} mt={20}>
                    <Button
                      widthP={100}
                      onClick={() => exerciseOption(option.id.toString())}
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
