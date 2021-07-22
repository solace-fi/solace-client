/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    MyClaims function
      custom hooks
      useState hooks
      contract functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import { formatEther } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { CardContainer, Card } from '../../components/Card'
import { Box, BoxItem, BoxItemTitle } from '../../components/Box'
import { Button, ButtonWrapper } from '../../components/Button'
import { Heading1, Text } from '../../components/Typography'
import { Content } from '../../components/Layout'

/* import constants */
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { GAS_LIMIT } from '../../constants'
import { ClaimDetails } from '../../constants/types'

/* import hooks */
import { useGetClaimsDetails } from '../../hooks/useClaimsEscrow'

/* import utils */
import { truncateBalance, getGasValue, getNativeTokenUnit } from '../../utils/formatting'
import { timer } from '../../utils/time'

export const MyClaims = () => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { claimsEscrow } = useContracts()
  const wallet = useWallet()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { makeTxToast } = useToasts()
  const claimsDetails = useGetClaimsDetails(wallet.account)

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  const withdrawPayout = async (_claimId: any) => {
    if (!claimsEscrow || !_claimId) return
    const txType = FunctionName.WITHDRAW_CLAIMS_PAYOUT
    try {
      const tx = await claimsEscrow.withdrawClaimsPayout(_claimId, {
        gasPrice: getGasValue(gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: String(_claimId),
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

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {claimsDetails.length > 0 && (
        <Content>
          <Heading1>Your Claims</Heading1>
          <CardContainer cardsPerRow={2}>
            {claimsDetails.map((claim: ClaimDetails) => {
              return (
                <Card key={claim.id}>
                  <Box pt={20} pb={20} glow={claim.canWithdraw} green={claim.canWithdraw}>
                    <BoxItem>
                      <BoxItemTitle h3>ID</BoxItemTitle>
                      <Text h3>{claim.id}</Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle h3>Amount</BoxItemTitle>
                      <Text h3>
                        {parseFloat(formatEther(claim.amount)) >= 1
                          ? truncateBalance(parseFloat(formatEther(claim.amount)))
                          : formatEther(claim.amount)}{' '}
                        {getNativeTokenUnit(wallet.chainId)}
                      </Text>
                    </BoxItem>
                    <BoxItem>
                      <BoxItemTitle h3>Payout Status</BoxItemTitle>
                      <Text h3>
                        {claim.canWithdraw
                          ? 'Available'
                          : `${claim.cooldown == '0' ? '-' : timer(parseInt(claim.cooldown) * 1000)} left`}
                      </Text>
                    </BoxItem>
                  </Box>
                  <ButtonWrapper mb={0} mt={20}>
                    <Button
                      widthP={100}
                      onClick={() => withdrawPayout(claim.id)}
                      disabled={!claim.canWithdraw || wallet.errors.length > 0}
                    >
                      Withdraw Payout
                    </Button>
                  </ButtonWrapper>
                </Card>
              )
            })}
          </CardContainer>
        </Content>
      )}
    </Fragment>
  )
}
