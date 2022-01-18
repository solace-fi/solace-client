import React, { useMemo, useState } from 'react'

import { Button } from '../../../../components/atoms/Button'
import Flex from '../../atoms/Flex'
import RaisedBox from '../../atoms/RaisedBox'
import ShadowDiv from '../../atoms/ShadowDiv'
import CardSectionValue from '../../components/CardSectionValue'
import InfoPair, { Label } from '../../molecules/InfoPair'
import HorizontalSeparator from '../../components/HorizontalSeparator'
import DepositForm from './DepositForm'
import LockForm from './LockForm'
import RewardsForm from './RewardsForm'
import WithdrawForm from './WithdrawForm'
import { Tab } from '../../types/Tab'
import { Accordion } from '../../../../components/atoms/Accordion'
import { LockData } from '../../../../constants/types'
import { getTimeFromMillis } from '../../../../utils/time'
import { truncateBalance } from '../../../../utils/formatting'

export default function Safe({ lock }: { lock: LockData }): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const openSafe = () => setIsOpen(true)
  const closeSafe = () => setIsOpen(false)

  const multiplier = useMemo(
    () => (parseFloat(lock.unboostedAmount) > 0 ? parseFloat(lock.boostedValue) / parseFloat(lock.unboostedAmount) : 0),
    [lock.boostedValue, lock.unboostedAmount]
  )
  const stringifiedMultiplier = useMemo(() => truncateBalance(multiplier, 1), [multiplier])
  const lockTimeLeft = useMemo(() => getTimeFromMillis(lock.timeLeft.toNumber() * 1000), [lock.timeLeft])
  const safeStatus = useMemo(() => {
    if (lock.timeLeft.toNumber() > 0) return 'Locked'
    if (parseFloat(lock.unboostedAmount) > 0) return 'Unlocked'
    return 'Empty'
  }, [lock.timeLeft, lock.unboostedAmount])

  const [activeTab, setActiveTab] = useState(Tab.DEPOSIT)
  return (
    <ShadowDiv style={{ marginBottom: '20px' }}>
      <RaisedBox>
        {/******************************************************
				                      TOP SECTION
				******************************************************/}
        <Flex between stretch p={24}>
          <Flex stretch gap={90}>
            <InfoPair importance="tertiary" label="Amount">
              <CardSectionValue highlight={true} annotation="SOLACE">
                {truncateBalance(lock.unboostedAmount, 4)}
              </CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="Status">
              <CardSectionValue>{safeStatus}</CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="Lock time left">
              <CardSectionValue>{lockTimeLeft}</CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="Multiplier">
              <CardSectionValue highlight={multiplier > 1}>{stringifiedMultiplier}x</CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="APY">
              <CardSectionValue highlight={true}>{lock.apy.toNumber()}%</CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="Rewards">
              <CardSectionValue highlight={parseFloat(lock.pendingRewards) > 0} annotation="SOLACE">
                {truncateBalance(lock.pendingRewards, 4)}
              </CardSectionValue>
            </InfoPair>
          </Flex>
          <Flex center>
            {!isOpen ? (
              <Button info semibold onClick={openSafe}>
                Manage
              </Button>
            ) : (
              <Button info semibold onClick={closeSafe}>
                Close
              </Button>
            )}
          </Flex>
        </Flex>
        {/* Separator */}
        {/* <div style={{ height: '1px', backgroundColor: '#e6e6e6',  }} /> */}
        {/******************************************************
				                        SAFE BODY
				******************************************************/}
        <Accordion isOpen={isOpen} style={{ backgroundColor: 'inherit' }}>
          <HorizontalSeparator />
          <Flex column gap={30} p={24} stretch>
            <Flex between stretch>
              {/* 4 tab switchers, just normal text with underline offset 8px: deposit, extend lock/lock, withdraw, rewards */}
              <Flex gap={40}>
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
                  {lock.timeLeft.toNumber() > 0 ? 'Extend Lockup' : 'Lockup'}
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
        </Accordion>
      </RaisedBox>
    </ShadowDiv>
  )
}
