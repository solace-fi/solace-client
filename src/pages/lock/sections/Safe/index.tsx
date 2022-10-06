import React, { useMemo, useState } from 'react'

import { Button } from '../../../../components/atoms/Button'
import { Flex, ShadowDiv, HorizontalSeparator, GridOrRow } from '../../../../components/atoms/Layout'

import { RaisedBox } from '../../../../components/atoms/Box'
import CardSectionValue from '../../components/CardSectionValue'
import InfoPair, { Label } from '../../molecules/InfoPair'
import DepositForm from './DepositForm'
import LockForm from './LockForm'
import WithdrawForm from './WithdrawForm'
import { Tab } from '../../../../constants/enums'
import { Accordion } from '../../../../components/atoms/Accordion'
import { getDateStringWithMonthName, getTimeFromMillis } from '../../../../utils/time'
import { truncateValue } from '../../../../utils/formatting'
import { formatUnits } from 'ethers/lib/utils'
import { BKPT_6, BKPT_5, BKPT_7 } from '../../../../constants'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { Checkbox } from '../../../../components/atoms/Input'
import { StyledTooltip } from '../../../../components/molecules/Tooltip'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'
import { useProvider } from '../../../../context/ProviderManager'
import { ZERO } from '@solace-fi/sdk-nightly'

export default function Safe({
  lock,
  batchActionsIsEnabled,
  isChecked,
  openedLockId,
  handleOpenLock,
  onCheck,
  index,
}: {
  lock: VoteLockData
  batchActionsIsEnabled: boolean
  isChecked: boolean
  openedLockId: number | undefined
  handleOpenLock: (openedId: number | undefined) => void
  onCheck: (index: number) => void
  index: number
}): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  const { latestBlock } = useProvider()
  const isOpen = useMemo(() => openedLockId == lock.lockID.toNumber(), [lock.lockID, openedLockId])
  const openSafe = () => handleOpenLock(lock.lockID.toNumber())
  const closeSafe = () => handleOpenLock(undefined)

  const amount = useMemo(() => formatUnits(lock.amount, 18), [lock.amount])

  const lockTimeLeft = useMemo(
    () => getTimeFromMillis((latestBlock ? Math.max(lock.end.toNumber() - latestBlock.timestamp, 0) : 0) * 1000),
    [lock.end, latestBlock]
  )
  const safeStatus = useMemo(() => {
    if (latestBlock ? lock.end.toNumber() > latestBlock.timestamp : 0) return lockTimeLeft
    if (parseFloat(amount) > 0) return 'Unlocked'
    return 'Empty'
  }, [latestBlock, amount, lock.end, lockTimeLeft])

  const [activeTab, setActiveTab] = useState(Tab.DEPOSIT)
  return (
    <ShadowDiv style={{ marginBottom: '20px' }}>
      <RaisedBox>
        {/******************************************************
				                      TOP SECTION
				******************************************************/}
        <Flex between={batchActionsIsEnabled} justifyCenter={!batchActionsIsEnabled} stretch p={24} gap={24}>
          <Flex center hidden={!batchActionsIsEnabled || width < (rightSidebar ? BKPT_6 : BKPT_5)}>
            {batchActionsIsEnabled && <Checkbox type="checkbox" checked={isChecked} onChange={() => onCheck(index)} />}
          </Flex>
          <GridOrRow preferredWidth={rightSidebar ? BKPT_7 : BKPT_6}>
            <InfoPair
              isSafePreview
              batch={batchActionsIsEnabled}
              importance="tertiary"
              label="Amount"
              desktop={width > (rightSidebar ? BKPT_6 : BKPT_5)}
            >
              <CardSectionValue highlight={true} annotation="UWE">
                {truncateValue(amount, 4)}
              </CardSectionValue>
            </InfoPair>
            <InfoPair
              isSafePreview
              batch={batchActionsIsEnabled}
              importance="tertiary"
              label="Lock ID"
              desktop={width > (rightSidebar ? BKPT_6 : BKPT_5)}
            >
              <CardSectionValue>#{lock.lockID.toNumber()}</CardSectionValue>
            </InfoPair>
            <StyledTooltip
              id={`lock-time-left#${lock.lockID.toNumber()}`}
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
                <CardSectionValue>{safeStatus}</CardSectionValue>
              </InfoPair>
            </StyledTooltip>
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
        </Flex>
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
                    Extend
                  </Label>
                  <Label
                    importance={activeTab === Tab.WITHDRAW ? 'primary' : 'secondary'}
                    clickable
                    onClick={() => setActiveTab(Tab.WITHDRAW)}
                  >
                    Withdraw
                  </Label>
                </Flex>
              </Flex>
              {activeTab === Tab.DEPOSIT && <DepositForm lock={lock} />}
              {activeTab === Tab.LOCK && <LockForm lock={lock} />}
              {activeTab === Tab.WITHDRAW && <WithdrawForm lock={lock} />}
            </Flex>
          </div>
        </Accordion>
      </RaisedBox>
    </ShadowDiv>
  )
}
