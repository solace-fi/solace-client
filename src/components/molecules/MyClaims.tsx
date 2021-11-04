/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    MyClaims
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
import { useContracts } from '../../context/ContractsManager'
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
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { BKPT_3 } from '../../constants'
import { ClaimDetails, LocalTx } from '../../constants/types'

/* import hooks */
import { useGetClaimsDetails } from '../../hooks/useClaimsEscrow'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useGetFunctionGas } from '../../hooks/useGas'

/* import utils */
import { accurateMultiply, truncateBalance } from '../../utils/formatting'
import { timeToDate } from '../../utils/time'

export const MyClaims: React.FC = () => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { haveErrors } = useGeneral()
  const { claimsEscrow } = useContracts()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { addLocalTransactions, reload } = useCachedData()
  const { makeTxToast } = useNotifications()
  const claimsDetails = useGetClaimsDetails()
  const { getAutoGasConfig } = useGetFunctionGas()
  const gasConfig = useMemo(() => getAutoGasConfig(), [getAutoGasConfig])
  const [openClaims, setOpenClaims] = useState<boolean>(true)
  const { width } = useWindowDimensions()

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  const withdrawPayout = async (_claimId: string) => {
    if (!claimsEscrow || !_claimId) return
    const txType = FunctionName.WITHDRAW_CLAIMS_PAYOUT
    try {
      const tx = await claimsEscrow.withdrawClaimsPayout(_claimId, {
        ...gasConfig,
        gasLimit: 150000,
      })
      const txHash = tx.hash
      const localTx: LocalTx = {
        hash: txHash,
        type: txType,
        value: `Claim #${String(_claimId)}`,
        status: TransactionCondition.PENDING,
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

  return (
    <Content>
      <Text t1 bold mb={0}>
        My Claims
        <Button style={{ float: 'right' }} onClick={() => setOpenClaims(!openClaims)}>
          <StyledArrowDropDown style={{ transform: openClaims ? 'rotate(180deg)' : 'rotate(0deg)' }} size={20} />
          {openClaims ? 'Hide Claims' : 'Show Claims'}
        </Button>
      </Text>
      <Text t4 pt={10} pb={10}>
        View details on claims or start withdrawing payout.
      </Text>
      <Accordion isOpen={openClaims}>
        {claimsDetails.length > 0 ? (
          <CardContainer cardsPerRow={2} p={10}>
            {claimsDetails.map((claim: ClaimDetails) => {
              return (
                <Card key={claim.id}>
                  <Box pt={20} pb={20} glow={claim.canWithdraw} success={claim.canWithdraw}>
                    <BoxItem>
                      <BoxItemTitle t4 light>
                        ID
                      </BoxItemTitle>
                      <Text t3 light>
                        {claim.id}
                      </Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle t4 light>
                        Amount
                      </BoxItemTitle>
                      <Text t3 light>
                        {BigNumber.from(claim.amount).gte(accurateMultiply(1, currencyDecimals))
                          ? truncateBalance(
                              formatUnits(claim.amount, currencyDecimals),
                              width > BKPT_3 ? currencyDecimals : 2
                            )
                          : truncateBalance(
                              formatUnits(claim.amount, currencyDecimals),
                              width > BKPT_3 ? currencyDecimals : 6
                            )}{' '}
                        {activeNetwork.nativeCurrency.symbol}
                      </Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle t4 light>
                        Payout Status
                      </BoxItemTitle>
                      <Text t3 light>
                        {claim.canWithdraw
                          ? 'Available'
                          : `${claim.cooldown == '0' ? '-' : timeToDate(parseInt(claim.cooldown) * 1000)} left`}
                      </Text>
                    </BoxItem>
                  </Box>
                  <ButtonWrapper pb={0} pt={20}>
                    <Button
                      widthP={100}
                      onClick={() => withdrawPayout(claim.id)}
                      disabled={!claim.canWithdraw || haveErrors}
                      info
                    >
                      Withdraw Payout
                    </Button>
                  </ButtonWrapper>
                </Card>
              )
            })}
          </CardContainer>
        ) : (
          <Text t2 textAlignCenter>
            You do not have any claims.
          </Text>
        )}
      </Accordion>
    </Content>
  )
}
