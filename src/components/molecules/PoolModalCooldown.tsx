/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import utils

    PoolModalCooldown
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import managers */
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Text } from '../atoms/Typography'
import { Button, ButtonWrapper } from '../atoms/Button'

/* import utils */
import { getTimeFromMillis, timeToDate } from '../../utils/time'

interface PoolModalCooldownProps {
  isAppropriateAmount: boolean
  handleCallbackFunc: () => Promise<void>
  modalLoading: boolean
  cd: {
    cooldownStarted: boolean
    timeWaited: number
    cooldownMin: number
    cooldownMax: number
    canWithdrawEth: boolean
  }
}

export const PoolModalCooldown: React.FC<PoolModalCooldownProps> = ({
  isAppropriateAmount,
  handleCallbackFunc,
  modalLoading,
  cd,
}) => {
  /* hooks */
  const { haveErrors } = useGeneral()

  return (
    <>
      {cd.canWithdrawEth && (
        <Box success glow mt={20} mb={20}>
          <Text t3 bold autoAlign>
            You can withdraw now!
          </Text>
        </Box>
      )}
      {cd.cooldownStarted && cd.timeWaited < cd.cooldownMin && (
        <Box mt={20} mb={20}>
          <Text t3 bold autoAlign>
            Cooldown Elapsing...
          </Text>
        </Box>
      )}
      <Box info>
        <BoxItem>
          <BoxItemTitle t4 textAlignCenter light>
            Min Cooldown
          </BoxItemTitle>
          <Text t4 textAlignCenter light>
            {getTimeFromMillis(cd.cooldownMin)}
          </Text>
        </BoxItem>
        {cd.cooldownStarted && (
          <BoxItem>
            <BoxItemTitle t4 textAlignCenter light>
              Time waited
            </BoxItemTitle>
            <Text t4 textAlignCenter success={cd.canWithdrawEth} light={!cd.canWithdrawEth}>
              {timeToDate(cd.timeWaited)}
            </Text>
          </BoxItem>
        )}
        <BoxItem>
          <BoxItemTitle t4 textAlignCenter light>
            Max Cooldown
          </BoxItemTitle>
          <Text t4 textAlignCenter light>
            {getTimeFromMillis(cd.cooldownMax)}
          </Text>
        </BoxItem>
      </Box>
      {!cd.canWithdrawEth && (
        <ButtonWrapper>
          <Button widthP={100} hidden={modalLoading} disabled={haveErrors} onClick={handleCallbackFunc} info>
            {!cd.cooldownStarted
              ? 'Start cooldown'
              : cd.timeWaited < cd.cooldownMin
              ? 'Stop cooldown'
              : cd.cooldownMax < cd.timeWaited
              ? 'Restart cooldown'
              : 'Unknown error'}
          </Button>
        </ButtonWrapper>
      )}
      {cd.canWithdrawEth && (
        <ButtonWrapper>
          <Button
            widthP={100}
            hidden={modalLoading}
            disabled={isAppropriateAmount || haveErrors}
            onClick={handleCallbackFunc}
            info
          >
            Withdraw
          </Button>
          <Button widthP={100} hidden={modalLoading} onClick={handleCallbackFunc} info>
            Stop Cooldown
          </Button>
        </ButtonWrapper>
      )}
    </>
  )
}
