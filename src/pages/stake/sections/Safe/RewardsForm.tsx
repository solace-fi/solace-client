import React, { useMemo } from 'react'
import { Button, ButtonWrapper } from '../../../../components/atoms/Button'
import InformationBox from '../../components/InformationBox'
import { LockData } from '@solace-fi/sdk-nightly'
import { useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { useStakingRewards } from '../../../../hooks/stake/useStakingRewards'
import { FunctionName, InfoBoxType } from '../../../../constants/enums'
import { StyledForm } from '../../atoms/StyledForm'
import { useNetwork } from '../../../../context/NetworkManager'
import { ZERO } from '../../../../constants'
import { GrayBox } from '../../../../components/molecules/GrayBox'
import { Flex, VerticalSeparator } from '../../../../components/atoms/Layout'
import { Text } from '../../../../components/atoms/Typography'
import { useCachedData } from '../../../../context/CachedDataManager'
import { floatUnits, truncateValue } from '../../../../utils/formatting'

export default function RewardsForm({ lock }: { lock: LockData }): JSX.Element {
  const { activeNetwork } = useNetwork()
  const { tokenPriceMapping, coverage } = useCachedData()
  const { policyId, status, curDailyCost, scpBalance } = coverage
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { harvestLockRewards, compoundLockRewards, harvestLockRewardsForScp } = useStakingRewards()

  const currentDuration = useMemo(() => (curDailyCost > 0 ? parseFloat(scpBalance) / curDailyCost : 0), [
    curDailyCost,
    scpBalance,
  ])

  const newDuration = useMemo(() => {
    if (tokenPriceMapping['solace']) {
      const numberified_rewards = floatUnits(lock.pendingRewards, 18)
      const numberified_rewards_USD = numberified_rewards * tokenPriceMapping['solace']
      const numberified_scp_plus_rewards_USD = parseFloat(scpBalance) + numberified_rewards_USD
      if (curDailyCost > 0) {
        return numberified_scp_plus_rewards_USD / curDailyCost
      }
      return 0
    }
    return 0
  }, [curDailyCost, lock.pendingRewards, scpBalance, tokenPriceMapping])

  const additionalDuration = useMemo(() => {
    if (newDuration == 0) return 0
    return newDuration - currentDuration
  }, [newDuration, currentDuration])

  const callHarvestLockRewards = async () => {
    await harvestLockRewards([lock.xsLockID])
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callHarvestLockRewards', err, FunctionName.HARVEST_LOCK))
  }

  const callHarvestLockRewardsForSCP = async () => {
    await harvestLockRewardsForScp([lock.xsLockID])
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callHarvestLockRewardsForSCP', err, FunctionName.HARVEST_LOCK_FOR_SCP))
  }

  const callCompoundLockRewards = async () => {
    await compoundLockRewards([lock.xsLockID], false)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callCompoundLockRewards', err, FunctionName.COMPOUND_LOCK))
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox
        type={InfoBoxType.info}
        text={
          !lock.pendingRewards.isZero()
            ? 'Rewards are accrued per second. Depositing, withdrawing, or changing a lockup period harvests rewards for you. You may compound your rewards if you wish to stake them.'
            : "You don't have any rewards to collect. Stake SOLACE to earn rewards!"
        }
      />
      <StyledForm>
        <ButtonWrapper p={0}>
          <Button secondary info noborder disabled={lock.pendingRewards.isZero()} onClick={callHarvestLockRewards}>
            Harvest
          </Button>
          <Button secondary info noborder disabled={lock.pendingRewards.isZero()} onClick={callCompoundLockRewards}>
            Compound
          </Button>
        </ButtonWrapper>
        {!activeNetwork.config.restrictedFeatures.noStakingRewardsV2 && policyId?.gt(ZERO) && (
          <GrayBox>
            <Flex stretch col gap={5}>
              <Button
                warmgradient
                secondary
                noborder
                disabled={lock.pendingRewards.isZero()}
                onClick={callHarvestLockRewardsForSCP}
              >
                Pay Premium
              </Button>
              <VerticalSeparator />
              {status ? (
                <Text t3s success autoAlignVertical>
                  + {truncateValue(additionalDuration, 2)} days
                </Text>
              ) : (
                <Text t5s warning autoAlignVertical>
                  Cannot project additional days for inactive policy
                </Text>
              )}
            </Flex>
          </GrayBox>
        )}
      </StyledForm>
    </div>
  )
}
