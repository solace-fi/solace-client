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
import { useWallet } from '../../context/WalletManager'
import { useGeneral } from '../../context/GeneralManager'
import { useContracts } from '../../context/ContractsManager'
import { useProvider } from '../../context/ProviderManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { BKPT_1, BKPT_5, DAYS_PER_YEAR, ZERO, Z_TABLE } from '../../constants'
import { LockData, UserLocksInfo } from '../../constants/types'
import { StakingVersion } from './types/Version'
import { LockCheckbox } from './types/LockCheckbox'
import { Tab } from './types/Tab'

/* import components */
import { Button, ButtonWrapper } from '../../components/atoms/Button'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormCol, FormRow } from '../../components/atoms/Form'
import { StyledSlider } from '../../components/atoms/Input'
import { Content, Flex, Scrollable } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { HeroContainer } from '../../components/atoms/Layout'
import { WalletConnectButton } from '../../components/molecules/WalletConnectButton'
import { Modal } from '../../components/molecules/Modal'
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '../../components/atoms/Table'
import { StyledMultiselect } from '../../components/atoms/Icon'
import DifferenceNotification from './organisms/DifferenceNotification'
import Safe from './sections/Safe/index'
import AggregatedStakeData from './sections/AggregatedStakeData'
import NewSafe from './sections/Safe/NewSafe'
import DifferenceBoxes from './sections/DifferenceBoxes.tsx'
import Checkbox from './atoms/Checkbox'
import CardSectionValue from './components/CardSectionValue'
import { Label } from './molecules/InfoPair'
import InputSection from './sections/InputSection'
import { SmallBox, Box } from '../../components/atoms/Box'
import { VerticalSeparator } from './components/Separator'
import { Accordion } from '../../components/atoms/Accordion'
import GrayBox from './components/GrayBox'
import { StyledInfo } from '../../components/atoms/Icon'

/* import hooks */
import { useXSolaceV1Balance } from '../../hooks/useBalance'
import { useXSolaceV1 } from '../../hooks/useXSolaceV1'
import { useInputAmount, useTransactionExecution } from '../../hooks/useInputAmount'
import { useReadToken } from '../../hooks/useToken'
import { useUserLockData, useXSLocker } from '../../hooks/useXSLocker'
import { useXSolaceMigrator } from '../../hooks/useXSolaceMigrator'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useProjectedBenefits, useStakingRewards } from '../../hooks/useStakingRewards'

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

import { getExpiration, getTimeFromMillis } from '../../utils/time'
import { BridgeModal } from './organisms/BridgeModal'

// disable no unused variables
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Stake1(): any {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const [isMigrating, setIsMigrating] = useState<boolean>(true)
  const { xSolaceV1Balance, v1StakedSolaceBalance } = useXSolaceV1Balance()
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolaceV1)
  const { amount, isAppropriateAmount, handleInputChange, setMax } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { unstake_v1 } = useXSolaceV1()
  const { migrate } = useXSolaceMigrator()
  const { account } = useWallet()
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
    const xSolaceToUnstake: BigNumber = await getXSolaceFromSolace()
    await unstake_v1(xSolaceToUnstake)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE_V1))
  }

  const callMigrateSigned = async () => {
    if (!latestBlock || !account) return
    const xSolaceToMigrate: BigNumber = await getXSolaceFromSolace()
    const seconds = latestBlock.timestamp + parseInt(lockInputValue) * 86400
    await migrate(account, BigNumber.from(seconds), xSolaceToMigrate)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callMigrateSigned', err, FunctionName.STAKING_MIGRATE))
  }

  const _setMax = () => setMax(parseUnits(v1StakedSolaceBalance, readSolaceToken.decimals), readSolaceToken.decimals)

  const getXSolaceFromSolace = async () => {
    const formatted = formatAmount(amount)
    let xSolace: BigNumber = ZERO
    if (!xSolaceV1) return xSolace
    if (formatted == v1StakedSolaceBalance) {
      xSolace = parseUnits(xSolaceV1Balance, readXSolaceToken.decimals)
    } else {
      xSolace = await xSolaceV1.solaceToXSolace(parseUnits(formatted, readSolaceToken.decimals))
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
      isAppropriateAmount(amount, readSolaceToken.decimals, parseUnits(v1StakedSolaceBalance, readSolaceToken.decimals))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, parseUnits(v1StakedSolaceBalance, readSolaceToken.decimals), readSolaceToken.decimals])

  return (
    <>
      {canStakeV1 ? (
        <>
          {!account ? (
            <HeroContainer>
              <Text bold t1 textAlignCenter>
                Please connect wallet to begin staking
              </Text>
              <WalletConnectButton info welcome secondary />
            </HeroContainer>
          ) : (
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
                      style={{ cursor: 'pointer', backgroundColor: !isMigrating ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
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
                      style={{ cursor: 'pointer', backgroundColor: isMigrating ? 'rgba(0, 0, 0, .05)' : 'inherit' }}
                    >
                      <Text t1 bold info={!isMigrating}>
                        Unstake
                      </Text>
                    </ModalCell>
                  </div>
                  <FormRow mt={20} mb={10}>
                    <FormCol>
                      <Text>Staked Balance</Text>
                    </FormCol>
                    <FormCol>
                      <Text textAlignRight info>
                        {v1StakedSolaceBalance} {readSolaceToken.symbol}
                      </Text>
                    </FormCol>
                  </FormRow>
                  <Flex mb={30} style={{ textAlign: 'center' }}>
                    <InputSection
                      tab={Tab.DEPOSIT}
                      value={amount}
                      onChange={(e) => handleInputChange(e.target.value, readSolaceToken.decimals)}
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
                              <div
                                style={BKPT_5 > width ? { margin: '-4px 0', display: 'block' } : { display: 'none' }}
                              >
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
          )}
        </>
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

  const [targetLock, setTargetLock] = useState<BigNumber | undefined>(undefined)
  const [locksChecked, setLocksChecked] = useState<LockCheckbox[]>([])

  const { account } = useWallet()
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
      const userLockData = await getUserLocks(account)
      setLocks(userLockData.locks)
      setLocksChecked(updateLocksChecked(userLockData.locks, locksChecked))
      setUserLockInfo(userLockData.user)
    }
    _getUserLocks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, latestBlock, version])

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
        <HeroContainer>
          <Text bold t1 textAlignCenter>
            Please connect wallet to begin staking
          </Text>
          <WalletConnectButton info welcome secondary />
        </HeroContainer>
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
                  <FormRow>
                    <FormCol>Rewards from selected safes</FormCol>
                    <FormCol>{formattedRewards}</FormCol>
                  </FormRow>
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
                              <FormRow mb={0}>
                                <FormCol light={isSelected}>Amount</FormCol>
                                <FormCol bold light={isSelected}>
                                  {truncateValue(formatUnits(lock.unboostedAmount, 18), 4)}
                                </FormCol>
                              </FormRow>
                              <FormRow mb={0}>
                                <FormCol light={isSelected}>Lock time left</FormCol>
                                <FormCol bold light={isSelected}>
                                  {getTimeFromMillis(lock.timeLeft.toNumber() * 1000)}
                                </FormCol>
                              </FormRow>
                              <FormRow mb={0}>
                                <FormCol light={isSelected}>Multiplier</FormCol>
                                <FormCol bold light={isSelected}>
                                  {truncateValue(multiplier, 1)}x
                                </FormCol>
                              </FormRow>
                              <FormRow mb={0}>
                                <FormCol light={isSelected}>APR</FormCol>
                                <FormCol bold light={isSelected}>
                                  {truncateValue(lock.apr.toString(), 1)}%
                                </FormCol>
                              </FormRow>
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
                    // checkbox + Select all, Rewards selected (harvest), Withdraw selected (withdraw)
                    <>
                      {/* select all checkbox */}
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
                {locks.map((lock, i) => (
                  <Safe
                    key={lock.xsLockID.toNumber()}
                    lock={lock}
                    batchActionsIsEnabled={batchActionsIsEnabled}
                    isChecked={lockIsChecked(locksChecked, lock.xsLockID)}
                    onCheck={() => handleLockCheck(lock.xsLockID)}
                    index={i}
                  />
                ))}
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
