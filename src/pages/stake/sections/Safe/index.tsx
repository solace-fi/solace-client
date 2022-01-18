import React, { useState } from 'react'

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

export default function Safe({
  stakingAmount,
  safeStatus,
  timeLeft,
  multiplier,
  apy,
  rewards,
  key,
}: {
  stakingAmount: number
  safeStatus: string
  timeLeft: number
  multiplier: number
  apy: number
  rewards: number
  key: string
}): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const openSafe = () => setIsOpen(true)
  const closeSafe = () => setIsOpen(false)

  const [activeTab, setActiveTab] = useState(Tab.DEPOSIT)
  return (
    <ShadowDiv style={{ marginBottom: '20px' }} key={key}>
      <RaisedBox>
        {/******************************************************
				                      TOP SECTION
				******************************************************/}
        <Flex between stretch p={24}>
          <Flex stretch gap={90}>
            <InfoPair importance="tertiary" label="Amount">
              <CardSectionValue highlight={true} annotation="SOLACE">
                {stakingAmount}
              </CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="Status">
              <CardSectionValue>{safeStatus}</CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="Lock time left">
              <CardSectionValue annotation="DAYS">{timeLeft}</CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="Multiplier">
              <CardSectionValue highlight={multiplier > 1}>{multiplier}x</CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="APY">
              <CardSectionValue highlight={true}>{apy}%</CardSectionValue>
            </InfoPair>
            <InfoPair importance="tertiary" label="Rewards">
              <CardSectionValue highlight={rewards > 0} annotation="SOLACE">
                {rewards}
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
        <HorizontalSeparator />
        {/* <div style={{ height: '1px', backgroundColor: '#e6e6e6',  }} /> */}
        {/******************************************************
				                        SAFE BODY
				******************************************************/}
        {isOpen && (
          <Flex column gap={30} p={24} stretch>
            <Flex between stretch>
              {/* 4 tab switchers, just normal text with underline offset 8px: deposit, extend lock/lock, withdraw, rewards */}
              <Flex gap={40}>
                <Label
                  importance={activeTab === Tab.DEPOSIT ? 'primary' : 'secondary'}
                  clickable
                  onClick={() => setActiveTab(Tab.DEPOSIT)}
                >
                  Deposit
                </Label>
                <Label
                  importance={activeTab === Tab.LOCK ? 'primary' : 'secondary'}
                  clickable
                  onClick={() => setActiveTab(Tab.LOCK)}
                >
                  {timeLeft > 0 ? 'Extend Lock' : 'Lock'}
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
            {activeTab === Tab.DEPOSIT && <DepositForm />}
            {activeTab === Tab.LOCK && <LockForm />}
            {activeTab === Tab.WITHDRAW && <WithdrawForm />}
            {activeTab === Tab.REWARDS && <RewardsForm />}
          </Flex>
        )}
      </RaisedBox>
    </ShadowDiv>
  )
}
