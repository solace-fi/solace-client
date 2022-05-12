import React, { useMemo, useState } from 'react'

import { Button } from '../../../../components/atoms/Button'
import { Flex, ShadowDiv, HorizontalSeparator, GridOrRow } from '../../../../components/atoms/Layout'

import { RaisedBox } from '../../../../components/atoms/Box'
import CardSectionValue from '../../components/CardSectionValue'
import InfoPair, { Label } from '../../molecules/InfoPair'
import DepositForm from './DepositForm'
import LockForm from './LockForm'
import RewardsForm from './RewardsForm'
import WithdrawForm from './WithdrawForm'
import { Tab } from '../../../../constants/enums'
import { Accordion } from '../../../../components/atoms/Accordion'
import { LockData } from '../../../../constants/types'
import { getDateStringWithMonthName, getTimeFromMillis } from '../../../../utils/time'
import { truncateValue } from '../../../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { BKPT_6, BKPT_5, BKPT_7 } from '../../../../constants'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { Checkbox } from '../../../../components/atoms/Input'
import { StyledTooltip } from '../../../../components/molecules/Tooltip'
import { useGeneral } from '../../../../context/GeneralManager'

export default function Safe({
  lock,
  batchActionsIsEnabled,
  isChecked,
  onCheck,
  index,
}: {
  lock: LockData
  batchActionsIsEnabled: boolean
  isChecked: boolean
  onCheck: (index: number) => void
  index: number
}): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const [isOpen, setIsOpen] = useState(false)
  const openSafe = () => setIsOpen(true)
  const closeSafe = () => setIsOpen(false)

  const unboostedAmount = useMemo(() => formatUnits(lock.unboostedAmount, 18), [lock.unboostedAmount])
  const boostedValue = useMemo(() => formatUnits(lock.boostedValue, 18), [lock.boostedValue])
  const pendingRewards = useMemo(() => formatUnits(lock.pendingRewards, 18), [lock.pendingRewards])

  const multiplier = useMemo(
    () => (parseFloat(unboostedAmount) > 0 ? parseFloat(boostedValue) / parseFloat(unboostedAmount) : 0),
    [boostedValue, unboostedAmount]
  )
  const stringifiedMultiplier = useMemo(() => truncateValue(multiplier, 1), [multiplier])
  const lockTimeLeft = useMemo(() => getTimeFromMillis(lock.timeLeft.toNumber() * 1000), [lock.timeLeft])
  const safeStatus = useMemo(() => {
    if (lock.timeLeft.toNumber() > 0) return 'Locked'
    if (parseFloat(unboostedAmount) > 0) return 'Unlocked'
    return 'Empty'
  }, [lock.timeLeft, unboostedAmount])

  const [activeTab, setActiveTab] = useState(Tab.DEPOSIT)
  return (
    <ShadowDiv style={{ marginBottom: '20px' }}>
      <RaisedBox>
        {/******************************************************
				                      TOP SECTION
				******************************************************/}
        <Flex between stretch p={24} gap={24}>
          <Flex center hidden={!batchActionsIsEnabled || width < (rightSidebar ? BKPT_6 : BKPT_5)}>
            {batchActionsIsEnabled && <Checkbox type="checkbox" checked={isChecked} onChange={() => onCheck(index)} />}
          </Flex>
          <GridOrRow preferredWidth={rightSidebar ? BKPT_7 : BKPT_6}>
            {/* <Flex stretch gap={90}> */}
            <InfoPair
              isSafePreview
              batch={batchActionsIsEnabled}
              importance="tertiary"
              label="Amount"
              desktop={width > (rightSidebar ? BKPT_6 : BKPT_5)}
            >
              <CardSectionValue highlight={true} annotation="SOLACE">
                {truncateValue(unboostedAmount, 4)}
              </CardSectionValue>
            </InfoPair>
            <InfoPair
              isSafePreview
              batch={batchActionsIsEnabled}
              importance="tertiary"
              label="Status"
              desktop={width > (rightSidebar ? BKPT_6 : BKPT_5)}
            >
              <CardSectionValue>{safeStatus}</CardSectionValue>
            </InfoPair>
            <StyledTooltip
              id={`lock-time-left#${lock.xsLockID.toNumber()}`}
              tip={`${getDateStringWithMonthName(new Date(lock.end.toNumber() * 1000))}`}
              alwaysShowChildren
            >
              <InfoPair
                isSafePreview
                batch={batchActionsIsEnabled}
                importance="tertiary"
                label="Lock time left"
                desktop={width > (rightSidebar ? BKPT_6 : BKPT_5)}
              >
                <CardSectionValue>{lockTimeLeft}</CardSectionValue>
              </InfoPair>
            </StyledTooltip>
            <InfoPair
              isSafePreview
              batch={batchActionsIsEnabled}
              importance="tertiary"
              label="Multiplier"
              desktop={width > (rightSidebar ? BKPT_6 : BKPT_5)}
            >
              <CardSectionValue highlight={multiplier > 1}>{stringifiedMultiplier}x</CardSectionValue>
            </InfoPair>
            <InfoPair
              isSafePreview
              batch={batchActionsIsEnabled}
              importance="tertiary"
              label="APR"
              desktop={width > (rightSidebar ? BKPT_6 : BKPT_5)}
            >
              <CardSectionValue highlight={true}>{truncateValue(lock.apr.toString(), 1)}%</CardSectionValue>
            </InfoPair>
            <InfoPair
              isSafePreview
              batch={batchActionsIsEnabled}
              importance="tertiary"
              label="Rewards"
              desktop={width > (rightSidebar ? BKPT_6 : BKPT_5)}
            >
              <CardSectionValue highlight={parseFloat(pendingRewards) > 0} annotation="SOLACE">
                {truncateValue(pendingRewards, 4)}
              </CardSectionValue>
            </InfoPair>
            <Flex center className="items-1">
              {!batchActionsIsEnabled ? (
                !isOpen ? (
                  <Button info semibold onClick={openSafe}>
                    Manage
                  </Button>
                ) : (
                  <Button info semibold onClick={closeSafe}>
                    Close
                  </Button>
                )
              ) : !isChecked ? (
                <Button info semibold nohover onClick={onCheck}>
                  Select
                </Button>
              ) : (
                <Button info secondary nohover semibold onClick={onCheck}>
                  Selected
                </Button>
              )}
            </Flex>
          </GridOrRow>
          {/* </Flex> */}
        </Flex>
        {/* Separator */}
        {/* <div style={{ height: '1px', backgroundColor: '#e6e6e6',  }} /> */}
        {/******************************************************
				                        SAFE BODY
				******************************************************/}
        <Accordion noScroll isOpen={isOpen} style={{ backgroundColor: 'inherit' }} customHeight={'1000px'}>
          <div>
            <HorizontalSeparator />
            <Flex column gap={30} p={24} stretch>
              <Flex between stretch>
                {/* 4 tab switchers, just normal text with underline offset 8px: deposit, extend lock/lock, withdraw, rewards */}
                <Flex gap={(rightSidebar ? BKPT_6 : BKPT_5) < width ? 40 : 21.66}>
                  <Label
                    importance={activeTab === Tab.DEPOSIT ? 'primary' : 'secondary'}
                    clickable
                    onClick={() => setActiveTab(Tab.DEPOSIT)}
                  >
                    Stake
                  </Label>
                  <Label
                    importance={activeTab === Tab.LOCK ? 'primary' : 'secondary'}
                    clickable
                    onClick={() => setActiveTab(Tab.LOCK)}
                  >
                    {lock.timeLeft.toNumber() > 0 ? 'Reset Lockup' : 'Lockup'}
                  </Label>
                  <Label
                    importance={activeTab === Tab.WITHDRAW ? 'primary' : 'secondary'}
                    clickable
                    onClick={() => setActiveTab(Tab.WITHDRAW)}
                  >
                    Withdraw
                  </Label>
                  <Label
                    importance={activeTab === Tab.REWARDS ? 'primary' : 'secondary'}
                    clickable
                    onClick={() => setActiveTab(Tab.REWARDS)}
                  >
                    Rewards
                  </Label>
                </Flex>
              </Flex>
              {/* depending on the tab, use <DepositForm />, or LockForm, RewardsForm or WithdrawForm */}
              {activeTab === Tab.DEPOSIT && <DepositForm lock={lock} />}
              {activeTab === Tab.LOCK && <LockForm lock={lock} />}
              {activeTab === Tab.WITHDRAW && <WithdrawForm lock={lock} />}
              {activeTab === Tab.REWARDS && <RewardsForm lock={lock} />}
            </Flex>
          </div>
        </Accordion>
      </RaisedBox>
    </ShadowDiv>
  )
}
