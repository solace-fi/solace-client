/*

    Table of Contents:

    import packages
    import managers
    import components
    import hooks

    Stake 
      custom hooks
      useEffect hooks

*/

/* import packages */
import React, { useState, useEffect, useMemo } from 'react'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

/* import managers */
import { useGeneral } from '../../context/GeneralManager'
import { useContracts } from '../../context/ContractsManager'
import { useProvider } from '../../context/ProviderManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { BKPT_1, BKPT_5, DAYS_PER_YEAR, ZERO, Z_TABLE } from '../../constants'
import { LockData, UserLocksData, UserLocksInfo } from '../../constants/types'
import { CheckboxData } from './types/LockCheckbox'
import { Tab, StakingVersion } from '../../constants/enums'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card, CardContainer } from '../../components/atoms/Card'
import { StyledSlider, Checkbox } from '../../components/atoms/Input'
import { Content, Flex, Scrollable, VerticalSeparator, HeroContainer } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Modal } from '../../components/molecules/Modal'
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '../../components/atoms/Table'
import { StyledMultiselect, StyledInfo } from '../../components/atoms/Icon'
import DifferenceNotification from './organisms/DifferenceNotification'
import Safe from './sections/Safe/index'
import AggregatedStakeData from './sections/AggregatedStakeData'
import NewSafe from './sections/Safe/NewSafe'
import DifferenceBoxes from './sections/DifferenceBoxes.tsx'
import CardSectionValue from './components/CardSectionValue'
import { Label } from './molecules/InfoPair'
import { InputSection } from '../../components/molecules/InputSection'
import { SmallBox, Box } from '../../components/atoms/Box'
import { Accordion } from '../../components/atoms/Accordion'
import { GrayBox } from '../../components/molecules/GrayBox'

/* import hooks */
import { useXSolaceV1Balance } from '../../hooks/balance/useBalance'
import { useXSolaceV1 } from '../../hooks/_legacy/useXSolaceV1'
import { useInputAmount, useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useUserLockData, useXSLocker } from '../../hooks/stake/useXSLocker'
import { useXSolaceMigrator } from '../../hooks/stake/useXSolaceMigrator'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useProjectedBenefits, useStakingRewards } from '../../hooks/stake/useStakingRewards'

/* import utils */
import { accurateMultiply, formatAmount, truncateValue } from '../../utils/formatting'
import calculateTotalWithdrawable from './utils/stake/batchActions/actions/calculateTotalWithdrawable'
import calculateTotalHarvest from './utils/stake/batchActions/actions/calculateTotalHarvest'
import { formatShort } from './utils/stake/batchActions/formatShort'

import updateLocksChecked from './utils/stake/batchActions/checkboxes/updateLocksChecked'
import getCheckedLocks from './utils/stake/batchActions/checkboxes/getCheckedLocks'
import lockIsChecked from './utils/stake/batchActions/checkboxes/lockIsChecked'
import updateLockCheck from './utils/stake/batchActions/checkboxes/updateLockCheck'
import somethingIsChecked from './utils/stake/batchActions/checkboxes/somethingIsChecked'
import allLocksAreChecked from './utils/stake/batchActions/checkboxes/allLocksAreChecked'

import '../../styles/tailwind.min.css'

// util imports

import { getExpiration, getTimeFromMillis, withBackoffRetries } from '../../utils/time'
import { BridgeModal } from './organisms/BridgeModal'
import { Loader } from '../../components/atoms/Loader'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { SOLACE_TOKEN, XSOLACE_V1_TOKEN } from '../../constants/mappings/token'
import { useWeb3React } from '@web3-react/core'

// disable no unused variables
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Stake1(): any {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const [isMigrating, setIsMigrating] = useState<boolean>(true)
  const { xSolaceV1Balance, v1StakedSolaceBalance } = useXSolaceV1Balance()
  const { amount, isAppropriateAmount, handleInputChange, setMax } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { unstake_v1 } = useXSolaceV1()
  const { migrate } = useXSolaceMigrator()
  const { account } = useWeb3React()
  const { latestBlock } = useProvider()
  const { width } = useWindowDimensions()

  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)
  const [lockInputValue, setLockInputValue] = React.useState('0')
  const canStakeV1 = useMemo(() => !activeNetwork.config.restrictedFeatures.noStakingV1, [
    activeNetwork.config.restrictedFeatures.noStakingV1,
  ])
  const { projectedMultiplier, projectedApr, projectedYearlyReturns } = useProjectedBenefits(
    accurateMultiply(formatAmount(amount), 18),
    latestBlock ? latestBlock.timestamp + parseInt(lockInputValue) * 86400 : 0
  )

  const callUnstake = async () => {
    const xSolaceToUnstake: BigNumber = await withBackoffRetries(async () => getXSolaceFromSolace())
    await unstake_v1(xSolaceToUnstake)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE_V1))
  }

  const callMigrateSigned = async () => {
    if (!latestBlock || !account) return
    const xSolaceToMigrate: BigNumber = await withBackoffRetries(async () => getXSolaceFromSolace())
    const seconds = latestBlock.timestamp + parseInt(lockInputValue) * 86400
    await migrate(account, BigNumber.from(seconds), xSolaceToMigrate)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callMigrateSigned', err, FunctionName.STAKING_MIGRATE))
  }

  const _setMax = () =>
    setMax(parseUnits(v1StakedSolaceBalance, SOLACE_TOKEN.constants.decimals), SOLACE_TOKEN.constants.decimals)

  const getXSolaceFromSolace = async () => {
    const formatted = formatAmount(amount)
    let xSolace: BigNumber = ZERO
    if (!xSolaceV1) return xSolace
    if (formatted == v1StakedSolaceBalance) {
      xSolace = parseUnits(xSolaceV1Balance, XSOLACE_V1_TOKEN.constants.decimals)
    } else {
      xSolace = await withBackoffRetries(async () =>
        xSolaceV1.solaceToXSolace(parseUnits(formatted, SOLACE_TOKEN.constants.decimals))
      )
    }
    return xSolace
  }

  const lockInputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= DAYS_PER_YEAR * 4 || filtered == '') {
      setLockInputValue(filtered)
    }
  }
  const lockRangeOnChange = (value: string) => setLockInputValue(value)

  const lockSetMax = () => setLockInputValue(`${DAYS_PER_YEAR * 4}`)

  /*

  useEffect hooks

  */

  useEffect(() => {
    setIsAcceptableAmount(
      isAppropriateAmount(
        amount,
        SOLACE_TOKEN.constants.decimals,
        parseUnits(v1StakedSolaceBalance, SOLACE_TOKEN.constants.decimals)
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, parseUnits(v1StakedSolaceBalance, SOLACE_TOKEN.constants.decimals), SOLACE_TOKEN.constants.decimals])

  return (
    <>
      {canStakeV1 ? (
        <Content>
          <Flex col>
            <Card style={{ margin: 'auto' }}>
              <div style={{ gridTemplateColumns: '1fr 0fr 1fr', display: 'grid', position: 'relative' }}>
                <ModalCell
                  pt={5}
                  pb={10}
                  pl={0}
                  pr={0}
                  onClick={() => setIsMigrating(true)}
                  jc={'center'}
                  style={{ cursor: 'pointer', backgroundColor: isMigrating ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
                >
                  <Text t1 bold info={isMigrating}>
                    Migrate
                  </Text>
                </ModalCell>
                <VerticalSeparator />
                <ModalCell
                  pt={5}
                  pb={10}
                  pl={0}
                  pr={0}
                  onClick={() => setIsMigrating(false)}
                  jc={'center'}
                  style={{ cursor: 'pointer', backgroundColor: !isMigrating ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
                >
                  <Text t1 bold info={!isMigrating}>
                    Unstake
                  </Text>
                </ModalCell>
              </div>
              <Flex stretch between mt={20} mb={10}>
                <Text>Staked Balance</Text>
                <Text textAlignRight info>
                  {v1StakedSolaceBalance} {SOLACE_TOKEN.constants.symbol}
                </Text>
              </Flex>
              <Flex mb={30} style={{ textAlign: 'center' }}>
                <InputSection
                  tab={Tab.DEPOSIT}
                  value={amount}
                  onChange={(e) => handleInputChange(e.target.value, SOLACE_TOKEN.constants.decimals)}
                  setMax={_setMax}
                />
              </Flex>
              <Accordion noScroll noBackgroundColor isOpen={isMigrating}>
                <Flex column gap={24} mb={20}>
                  <div>
                    <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                      Choose a Lock time (optional)
                    </Label>
                    <InputSection
                      tab={Tab.LOCK}
                      value={lockInputValue}
                      onChange={(e) => lockInputOnChange(e.target.value)}
                      setMax={lockSetMax}
                    />
                  </div>
                  <StyledSlider
                    value={lockInputValue}
                    onChange={(e) => lockRangeOnChange(e.target.value)}
                    min={0}
                    max={DAYS_PER_YEAR * 4}
                  />
                  {
                    <SmallBox transparent collapse={!lockInputValue || lockInputValue == '0'} m={0} p={0}>
                      <Text
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Lock End Date: {getExpiration(parseInt(lockInputValue))}
                      </Text>
                    </SmallBox>
                  }
                </Flex>
                <Flex column stretch w={BKPT_5 > width ? 300 : 521}>
                  <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                    Projected benefits when migrated
                  </Label>
                  <GrayBox>
                    <Flex stretch column>
                      <Flex stretch gap={24}>
                        <Flex column gap={2}>
                          <Text t5s techygradient mb={8}>
                            APR
                          </Text>
                          <div style={BKPT_5 > width ? { margin: '-4px 0', display: 'block' } : { display: 'none' }}>
                            &nbsp;
                          </div>
                          <Text t3s techygradient>
                            <Flex>{truncateValue(projectedApr.toString(), 1)}%</Flex>
                          </Text>
                        </Flex>
                        <VerticalSeparator />
                        <Flex column gap={2}>
                          <Text t5s techygradient mb={8}>
                            Reward Multiplier
                          </Text>
                          <Text t3s techygradient>
                            {projectedMultiplier}x
                          </Text>
                        </Flex>
                        <VerticalSeparator />
                        <Flex column gap={2}>
                          <Text t5s techygradient mb={8}>
                            Yearly Return
                          </Text>
                          <Text t3s techygradient>
                            {truncateValue(formatUnits(projectedYearlyReturns, 18), 4, false)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </GrayBox>
                </Flex>
              </Accordion>
              <ButtonWrapper>
                {isMigrating ? (
                  <Button
                    widthP={100}
                    error
                    style={{ backgroundColor: '#f04d42' }}
                    disabled={!isAcceptableAmount || haveErrors}
                    secondary
                    onClick={callMigrateSigned}
                    light
                  >
                    Migrate to STAKING V2
                  </Button>
                ) : (
                  <Button
                    widthP={100}
                    info
                    secondary
                    disabled={!isAcceptableAmount || haveErrors}
                    onClick={callUnstake}
                  >
                    Unstake
                  </Button>
                )}
              </ButtonWrapper>
            </Card>
          </Flex>
        </Content>
      ) : (
        <Content>
          <Box error pt={10} pb={10} pl={15} pr={15}>
            <TextSpan light textAlignLeft>
              <StyledInfo size={30} />
            </TextSpan>
            <Text light bold style={{ margin: '0 auto' }}>
              Staking V1 is not available on this network.
            </Text>
          </Box>
        </Content>
      )}
    </>
  )
}

/*
 Components
 */

export default function Stake(): JSX.Element {
  const { width } = useWindowDimensions()
  // account usewallet
  const [newSafeIsOpen, setNewSafeIsOpen] = useState(false)
  const [batchActionsIsEnabled, setBatchActionsIsEnabled] = useState(false)
  const [isCompoundModalOpen, setIsCompoundModalOpen] = useState<boolean>(false)
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const [targetLock, setTargetLock] = useState<BigNumber | undefined>(undefined)
  const [locksChecked, setLocksChecked] = useState<CheckboxData[]>([])

  const { account } = useWeb3React()
  const { latestBlock } = useProvider()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const [stakingVersion, setStakingVersion] = useState<StakingVersion>(StakingVersion.v2 as StakingVersion)
  const [locks, setLocks] = useState<LockData[]>([])
  const [userLockInfo, setUserLockInfo] = useState<UserLocksInfo>({
    pendingRewards: ZERO,
    stakedBalance: ZERO,
    lockedBalance: ZERO,
    unlockedBalance: ZERO,
    yearlyReturns: ZERO,
    apr: ZERO,
  })
  const canStakeV2 = useMemo(() => !activeNetwork.config.restrictedFeatures.noStakingV2, [
    activeNetwork.config.restrictedFeatures.noStakingV2,
  ])
  const { getUserLocks } = useUserLockData()
  const { withdrawFromLock } = useXSLocker()
  const { harvestLockRewards, compoundLockRewards } = useStakingRewards()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const rewardsAreZero = useMemo(() => calculateTotalHarvest(getCheckedLocks(locks, locksChecked)).isZero(), [
    locks,
    locksChecked,
  ])
  const withdrawalsAreZero = useMemo(() => calculateTotalWithdrawable(getCheckedLocks(locks, locksChecked)).isZero(), [
    locks,
    locksChecked,
  ])
  const formattedRewards = useMemo(() => formatShort(calculateTotalHarvest(getCheckedLocks(locks, locksChecked))), [
    locks,
    locksChecked,
  ])
  const formattedWithdrawal = useMemo(
    () => formatShort(calculateTotalWithdrawable(getCheckedLocks(locks, locksChecked))),
    [locks, locksChecked]
  )

  useEffect(() => {
    const _getUserLocks = async () => {
      if (!account) return
      await getUserLocks(account).then((userLockData: UserLocksData) => {
        if (userLockData.successfulFetch) {
          setLocks(userLockData.locks)
          setLocksChecked(updateLocksChecked(userLockData.locks, locksChecked))
          setUserLockInfo(userLockData.user)
          setLoading(false)
        }
      })
    }
    _getUserLocks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, activeNetwork, latestBlock, version])

  useEffect(() => {
    setLoading(true)
  }, [account, activeNetwork])

  const openSafe = () => setNewSafeIsOpen(true)
  const closeSafe = () => setNewSafeIsOpen(false)
  const toggleBatchActions = () => {
    closeSafe()
    setBatchActionsIsEnabled(!batchActionsIsEnabled)
  }

  const handleLockCheck = (lockId: BigNumber) => {
    const checkboxStatus = lockIsChecked(locksChecked, lockId)
    const newArr = updateLockCheck(locksChecked, lockId, !checkboxStatus)
    setLocksChecked(newArr)
  }

  const handleLockCheckAll = () => {
    if (allLocksAreChecked(locksChecked)) {
      setLocksChecked(locksChecked.map((lock) => ({ ...lock, checked: false })))
    } else {
      setLocksChecked(locksChecked.map((lock) => ({ ...lock, checked: true })))
    }
  }

  const handleBatchWithdraw = async () => {
    if (!account) return
    const selectedLocks = getCheckedLocks(locks, locksChecked)
    const eligibleLocks = selectedLocks.filter((lock) => lock.timeLeft.isZero())
    const eligibleIds = eligibleLocks.map((lock) => lock.xsLockID)
    if (eligibleIds.length == 0) return
    const type = eligibleIds.length > 1 ? FunctionName.WITHDRAW_MANY_FROM_LOCK : FunctionName.WITHDRAW_FROM_LOCK
    await withdrawFromLock(account, eligibleIds)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('handleBatchWithdraw', err, type))
  }

  const handleBatchHarvest = async () => {
    const selectedLocks = getCheckedLocks(locks, locksChecked)
    const eligibleLocks = selectedLocks.filter((lock) => !lock.pendingRewards.isZero())
    const eligibleIds = eligibleLocks.map((lock) => lock.xsLockID)
    const type = eligibleIds.length > 1 ? FunctionName.HARVEST_LOCKS : FunctionName.HARVEST_LOCK
    await harvestLockRewards(eligibleIds)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('handleBatchHarvest', err, type))
  }

  const handleBatchCompound = async () => {
    const selectedLocks = getCheckedLocks(locks, locksChecked)
    const eligibleLocks = selectedLocks.filter((lock) => !lock.pendingRewards.isZero())
    const eligibleIds = eligibleLocks.map((lock) => lock.xsLockID)
    const type = eligibleIds.length > 1 ? FunctionName.COMPOUND_LOCKS : FunctionName.COMPOUND_LOCK
    setTargetLock(undefined)
    await compoundLockRewards(eligibleIds, targetLock)
      .then((res) => {
        setIsCompoundModalOpen(false)
        handleToast(res.tx, res.localTx)
      })
      .catch((err) => handleContractCallError('handleBatchCompound', err, type))
  }

  return (
    <>
      {!account ? (
        <PleaseConnectWallet />
      ) : (
        <Content>
          <DifferenceNotification version={stakingVersion} setVersion={setStakingVersion} />
          {StakingVersion.v2 === stakingVersion &&
            (canStakeV2 ? (
              <>
                <Modal
                  isOpen={isCompoundModalOpen}
                  handleClose={() => {
                    setIsCompoundModalOpen(false)
                    setTargetLock(undefined)
                  }}
                  modalTitle={'Select a safe to deposit your rewards'}
                >
                  <Flex stretch between mb={24}>
                    <Text>Rewards from selected safes</Text>
                    <Text>{formattedRewards}</Text>
                  </Flex>
                  <Scrollable maxMobileHeight={60}>
                    {width > BKPT_1 ? (
                      <Table>
                        <TableHead sticky zIndex={Z_TABLE + 1}>
                          <TableRow textAlignCenter>
                            <TableHeader t5s pl={2} pr={2}>
                              Amount
                            </TableHeader>
                            <TableHeader t5s pl={2} pr={2}>
                              Lock time
                            </TableHeader>
                            <TableHeader t5s pl={2} pr={2}>
                              Multiplier
                            </TableHeader>
                            <TableHeader t5s pl={2} pr={2}>
                              APR
                            </TableHeader>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {locks.map((lock) => {
                            const unboostedAmount = formatUnits(lock.unboostedAmount, 18)
                            const boostedValue = formatUnits(lock.boostedValue, 18)
                            const multiplier =
                              parseFloat(unboostedAmount) > 0
                                ? parseFloat(boostedValue) / parseFloat(unboostedAmount)
                                : 0
                            const isSelected = targetLock ? targetLock.eq(lock.xsLockID) : false
                            const timeLeft = getTimeFromMillis(lock.timeLeft.toNumber() * 1000)
                            return (
                              <TableRow
                                canHover
                                key={lock.xsLockID.toNumber()}
                                onClick={() => setTargetLock(lock.xsLockID)}
                                isHighlight={isSelected}
                                style={{ cursor: 'pointer' }}
                              >
                                <TableData p={10}>
                                  <Text light={isSelected}>
                                    {truncateValue(formatUnits(lock.unboostedAmount, 18), 4)}
                                  </Text>
                                </TableData>
                                <TableData p={10}>
                                  <Text light={isSelected}>
                                    {timeLeft.includes('<') ? timeLeft : timeLeft.split(' ')[0]}
                                  </Text>
                                </TableData>
                                <TableData p={10}>
                                  <Text light={isSelected}>{truncateValue(multiplier, 1)}x</Text>
                                </TableData>
                                <TableData p={10}>
                                  <Text light={isSelected}>{truncateValue(lock.apr.toString(), 1)}%</Text>
                                </TableData>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <CardContainer cardsPerRow={1} style={{ gap: '10px' }}>
                        {locks.map((lock) => {
                          const unboostedAmount = formatUnits(lock.unboostedAmount, 18)
                          const boostedValue = formatUnits(lock.boostedValue, 18)
                          const multiplier =
                            parseFloat(unboostedAmount) > 0 ? parseFloat(boostedValue) / parseFloat(unboostedAmount) : 0
                          const isSelected = targetLock && targetLock.eq(lock.xsLockID)
                          return (
                            <Card
                              canHover
                              pt={15}
                              pb={15}
                              pl={30}
                              pr={30}
                              key={lock.xsLockID.toNumber()}
                              isHighlight={isSelected}
                              onClick={() => setTargetLock(lock.xsLockID)}
                            >
                              <Flex stretch between>
                                <Text light={isSelected}>Amount</Text>
                                <Text bold light={isSelected}>
                                  {truncateValue(formatUnits(lock.unboostedAmount, 18), 4)}
                                </Text>
                              </Flex>
                              <Flex stretch between>
                                <Text light={isSelected}>Lock time left</Text>
                                <Text bold light={isSelected}>
                                  {getTimeFromMillis(lock.timeLeft.toNumber() * 1000)}
                                </Text>
                              </Flex>
                              <Flex stretch between>
                                <Text light={isSelected}>Multiplier</Text>
                                <Text bold light={isSelected}>
                                  {truncateValue(multiplier, 1)}x
                                </Text>
                              </Flex>
                              <Flex stretch between>
                                <Text light={isSelected}>APR</Text>
                                <Text bold light={isSelected}>
                                  {truncateValue(lock.apr.toString(), 1)}%
                                </Text>
                              </Flex>
                            </Card>
                          )
                        })}
                      </CardContainer>
                    )}
                  </Scrollable>
                  {targetLock && (
                    <ButtonWrapper>
                      <Button widthP={100} onClick={handleBatchCompound} info>
                        Confirm
                      </Button>
                    </ButtonWrapper>
                  )}
                </Modal>
                <BridgeModal
                  modalTitle={'Bridge SOLACE'}
                  handleClose={() => setIsBridgeModalOpen(false)}
                  isOpen={isBridgeModalOpen}
                />
                {activeNetwork.config.specialFeatures.unwrapBridgedSolace && (
                  <Flex between mt={20} mb={20}>
                    <Button onClick={() => setIsBridgeModalOpen(true)}>Bridge</Button>
                  </Flex>
                )}
                <AggregatedStakeData stakeData={userLockInfo} />
                <Flex
                  between
                  mt={20}
                  mb={20}
                  style={
                    width < BKPT_5 && batchActionsIsEnabled
                      ? {
                          flexDirection: 'column-reverse',
                          gap: '30px',
                          alignItems: 'stretch',
                        }
                      : {}
                  }
                >
                  {!batchActionsIsEnabled ? (
                    !newSafeIsOpen ? (
                      <Button secondary info noborder pl={23} pr={23} onClick={openSafe}>
                        Create New Safe
                      </Button>
                    ) : (
                      <Button secondary info noborder pl={23} pr={23} onClick={closeSafe}>
                        Close
                      </Button>
                    )
                  ) : (
                    <>
                      <Flex gap={15} style={{ marginTop: 'auto', marginBottom: 'auto' }} between={width < BKPT_5}>
                        <Flex
                          center
                          gap={5}
                          style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                          onClick={handleLockCheckAll}
                        >
                          <Checkbox type="checkbox" checked={allLocksAreChecked(locksChecked)} />
                          <Text bold t4 info>
                            Select all
                          </Text>
                        </Flex>
                        {somethingIsChecked(locksChecked) && (
                          <Flex
                            gap={15}
                            style={
                              width < BKPT_5
                                ? {
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '5px',
                                  }
                                : {}
                            }
                          >
                            <Flex center gap={5}>
                              <Text t4>Rewards selected:</Text>
                              <CardSectionValue annotation="SOLACE" smol info>
                                {/* calcualte total selected harvest, divide by 1e18, to string (big numbers) */}
                                {formattedRewards}
                              </CardSectionValue>
                            </Flex>
                            <Flex center gap={5}>
                              <Text t4>Withdrawable selected:</Text>
                              <CardSectionValue annotation="SOLACE" smol info>
                                {formattedWithdrawal}
                              </CardSectionValue>
                            </Flex>
                          </Flex>
                        )}
                      </Flex>
                    </>
                  )}
                  <Flex center gap={15} column={width < BKPT_5}>
                    {batchActionsIsEnabled && (
                      <Flex gap={15}>
                        <Button
                          secondary
                          info
                          noborder
                          pl={10}
                          pr={10}
                          onClick={handleBatchHarvest}
                          disabled={rewardsAreZero}
                        >
                          Harvest Rewards
                        </Button>
                        <Button
                          secondary
                          info
                          noborder
                          pl={10}
                          pr={10}
                          onClick={() => {
                            if (getCheckedLocks(locks, locksChecked).length > 1) {
                              setIsCompoundModalOpen(true)
                            } else {
                              handleBatchCompound()
                            }
                          }}
                          disabled={rewardsAreZero}
                        >
                          Compound Rewards
                        </Button>
                        <Button
                          secondary
                          info
                          noborder
                          pl={10}
                          pr={10}
                          onClick={handleBatchWithdraw}
                          disabled={withdrawalsAreZero}
                        >
                          Withdraw
                        </Button>
                      </Flex>
                    )}
                    <Button pl={10} pr={10} onClick={toggleBatchActions} secondary={batchActionsIsEnabled}>
                      <StyledMultiselect size={20} style={{ marginRight: '5px' }} />{' '}
                      {batchActionsIsEnabled ? 'Exit Multi-select' : `Multi-select`}
                    </Button>
                  </Flex>
                </Flex>
                <NewSafe isOpen={newSafeIsOpen} />
                {loading && (
                  <Content>
                    <Loader />
                  </Content>
                )}
                {!loading &&
                  locks.length > 0 &&
                  locks.map((lock, i) => (
                    <Safe
                      key={lock.xsLockID.toNumber()}
                      lock={lock}
                      batchActionsIsEnabled={batchActionsIsEnabled}
                      isChecked={lockIsChecked(locksChecked, lock.xsLockID)}
                      onCheck={() => handleLockCheck(lock.xsLockID)}
                      index={i}
                    />
                  ))}
                {!loading && locks.length == 0 && (
                  <HeroContainer>
                    <Text t1 textAlignCenter>
                      You do not have any safes.
                    </Text>
                  </HeroContainer>
                )}
              </>
            ) : (
              <Content>
                <Box error pt={10} pb={10} pl={15} pr={15}>
                  <TextSpan light textAlignLeft>
                    <StyledInfo size={30} />
                  </TextSpan>
                  <Text light bold style={{ margin: '0 auto' }}>
                    Staking V2 is not available on this network.
                  </Text>
                </Box>
              </Content>
            ))}
          {/* only show the following if staking is v1 and the tab is not `difference` */}
          {stakingVersion === StakingVersion.v1 && <Stake1 />}
          {/* only show the following if staking is v1 and the tab is 'difference' */}
          {stakingVersion === StakingVersion.difference && <DifferenceBoxes setStakingVersion={setStakingVersion} />}
        </Content>
      )}
    </>
  )
}
