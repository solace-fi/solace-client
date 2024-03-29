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
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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
import { BKPT_1, BKPT_5, BKPT_6, DAYS_PER_YEAR, ZERO, Z_TABLE } from '../../constants'
import { CheckboxData } from '../../constants/types'
import { Tab, StakingVersion } from '../../constants/enums'

/* import components */
import { Button, ButtonWrapper, GraySquareButton } from '../../components/atoms/Button'
import { Card, CardContainer } from '../../components/atoms/Card'
import { StyledSlider, Checkbox, Input } from '../../components/atoms/Input'
import { Content, Flex, Scrollable, VerticalSeparator, HeroContainer } from '../../components/atoms/Layout'
import { ModalCell } from '../../components/atoms/Modal'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Modal } from '../../components/molecules/Modal'
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '../../components/atoms/Table'
import {
  StyledMultiselect,
  StyledInfo,
  StyledArrowIosBackOutline,
  StyledArrowIosForwardOutline,
} from '../../components/atoms/Icon'
import { DifferenceNotification, CoverageNotification, SGTMigrationNotification } from './organisms/NotificationBox'
import Safe from './sections/Safe/index'
import AggregatedStakeData from './sections/AggregatedStakeData'
import NewSafe from './sections/Safe/NewSafe'
import DifferenceBoxes from './sections/DifferenceBoxes'
import CardSectionValue from '../../components/molecules/stake-and-lock/CardSectionValue'
import { Label } from '../../components/molecules/stake-and-lock/InfoPair'
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
import { accurateMultiply, floatUnits, formatAmount, shortenAddress, truncateValue } from '../../utils/formatting'

import updateLocksChecked from './utils/updateLocksChecked'
import getCheckedLocks from './utils/getCheckedLocks'

import { boxIsChecked, updateBoxCheck, somethingIsChecked, allBoxesAreChecked } from '../../utils/checkbox'

import '../../styles/tailwind.min.css'

// util imports

import { getExpiration, getTimeFromMillis, withBackoffRetries } from '../../utils/time'
import { BridgeModal } from './organisms/BridgeModal'
import { Loader } from '../../components/atoms/Loader'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { SOLACE_TOKEN, XSOLACE_V1_TOKEN } from '../../constants/mappings/token'
import { useWeb3React } from '@web3-react/core'
import { LockData, UserLocksData, UserLocksInfo } from '@solace-fi/sdk-nightly'
import { useCheckIsCoverageActive } from '../../hooks/policy/useSolaceCoverProductV3'
import { isAddress } from '../../utils'

// disable no unused variables
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StakeV1(): any {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { haveErrors, appTheme, rightSidebar } = useGeneral()
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
  const canStakeV1 = useMemo(() => activeNetwork.config.generalFeatures.stakingV1, [
    activeNetwork.config.generalFeatures.stakingV1,
  ])
  const { projectedMultiplier, projectedApr, projectedYearlyReturns } = useProjectedBenefits(
    accurateMultiply(formatAmount(amount), 18),
    latestBlock.blockTimestamp ? latestBlock.blockTimestamp + parseInt(lockInputValue) * 86400 : 0
  )

  const callUnstake = async () => {
    const xSolaceToUnstake: BigNumber = await withBackoffRetries(async () => getXSolaceFromSolace())
    await unstake_v1(xSolaceToUnstake)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callUnstake', err, FunctionName.UNSTAKE_V1))
  }

  const callMigrateSigned = async () => {
    if (!latestBlock.blockTimestamp || !account) return
    const xSolaceToMigrate: BigNumber = await withBackoffRetries(async () => getXSolaceFromSolace())
    const seconds = latestBlock.blockTimestamp + parseInt(lockInputValue) * 86400
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
                <Flex column stretch width={(rightSidebar ? BKPT_6 : BKPT_5) > width ? 300 : 521}>
                  <Label importance="quaternary" style={{ marginBottom: '8px' }}>
                    Projected benefits when migrated
                  </Label>
                  <GrayBox>
                    <Flex stretch column>
                      <Flex stretch gap={24}>
                        <Flex column gap={2}>
                          <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'} mb={8}>
                            APR
                          </Text>
                          <div
                            style={
                              (rightSidebar ? BKPT_6 : BKPT_5) > width
                                ? { margin: '-4px 0', display: 'block' }
                                : { display: 'none' }
                            }
                          >
                            &nbsp;
                          </div>
                          <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                            <Flex>{truncateValue(projectedApr.toString(), 1)}%</Flex>
                          </Text>
                        </Flex>
                        <VerticalSeparator />
                        <Flex column gap={2}>
                          <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'} mb={8}>
                            Reward Multiplier
                          </Text>
                          <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
                            {projectedMultiplier}x
                          </Text>
                        </Flex>
                        <VerticalSeparator />
                        <Flex column gap={2}>
                          <Text t5s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'} mb={8}>
                            Yearly Return
                          </Text>
                          <Text t3s techygradient={appTheme == 'light'} warmgradient={appTheme == 'dark'}>
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
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  // account usewallet
  const [newSafeIsOpen, setNewSafeIsOpen] = useState(false)
  const [batchActionsIsEnabled, setBatchActionsIsEnabled] = useState(false)
  const [isCompoundModalOpen, setIsCompoundModalOpen] = useState<boolean>(false)
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchingLocks = useRef(false)

  const [targetLock, setTargetLock] = useState<BigNumber | undefined>(undefined)
  const [locksChecked, setLocksChecked] = useState<CheckboxData[]>([])
  const locksCheckedRef = useRef(locksChecked)
  locksCheckedRef.current = locksChecked

  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { positiveVersion, coverage, minute } = useCachedData()
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
  const canStakeV2 = useMemo(() => activeNetwork.config.generalFeatures.stakingV2, [
    activeNetwork.config.generalFeatures.stakingV2,
  ])
  const { xSolaceV1Balance } = useXSolaceV1Balance()
  const { getUserLocks } = useUserLockData()
  const { withdrawFromLock } = useXSLocker()
  const { harvestLockRewards, compoundLockRewards, harvestLockRewardsForScp } = useStakingRewards()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { policyId } = useCheckIsCoverageActive()
  const navbarThreshold = useMemo(() => width < (rightSidebar ? BKPT_6 : BKPT_5), [rightSidebar, width])

  const calculateTotalHarvest = (locks: LockData[]): BigNumber =>
    locks.reduce((acc, lock) => acc.add(lock.pendingRewards), ZERO)

  const calculateTotalWithdrawable = (locks: LockData[]): BigNumber =>
    locks.reduce((acc, lock) => (lock.timeLeft.isZero() ? acc.add(lock.unboostedAmount) : acc), ZERO)

  const rewardsAreZero = useMemo(() => calculateTotalHarvest(getCheckedLocks(locks, locksChecked)).isZero(), [
    locks,
    locksChecked,
  ])
  const withdrawalsAreZero = useMemo(() => calculateTotalWithdrawable(getCheckedLocks(locks, locksChecked)).isZero(), [
    locks,
    locksChecked,
  ])
  const formattedRewards = useMemo(
    () => truncateValue(formatUnits(calculateTotalHarvest(getCheckedLocks(locks, locksChecked)), 18), 4),
    [locks, locksChecked]
  )
  const formattedWithdrawal = useMemo(
    () => truncateValue(formatUnits(calculateTotalWithdrawable(getCheckedLocks(locks, locksChecked)), 18), 4),
    [locks, locksChecked]
  )

  const [currentPage, setCurrentPage] = useState<number>(0)

  const numResultsPerPage = 5
  const numPages = useMemo(() => Math.ceil(locks.length / numResultsPerPage), [locks])

  const locksPaginated = useMemo(
    () => locks.slice(currentPage * numResultsPerPage, (currentPage + 1) * numResultsPerPage),
    [currentPage, locks]
  )

  const [openedLockId, setOpenedLockId] = useState<number | undefined>(undefined)

  const [recipientAddress, setRecipientAddress] = useState<string>('')

  const handleRecipientAddressChange = useCallback((address: string) => {
    setRecipientAddress(address)
  }, [])

  useEffect(() => {
    if (!account) return
    handleRecipientAddressChange(account)
  }, [account])

  useEffect(() => {
    const _getUserLocks = async () => {
      if (!account || fetchingLocks.current) return
      fetchingLocks.current = true
      await getUserLocks(account).then((userLockData: UserLocksData) => {
        if (userLockData.successfulFetch) {
          setLocks(
            userLockData.locks.sort((a, b) => {
              return floatUnits(b.unboostedAmount.sub(a.unboostedAmount), 18)
            })
          )
          setLocksChecked(updateLocksChecked(userLockData.locks, locksCheckedRef.current))
          setUserLockInfo(userLockData.user)
          setLoading(false)
          fetchingLocks.current = false
        }
      })
    }
    _getUserLocks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, activeNetwork, minute, positiveVersion])

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
    const checkboxStatus = boxIsChecked(locksChecked, lockId.toString())
    const newArr = updateBoxCheck(locksChecked, lockId.toString(), !checkboxStatus)
    setLocksChecked(newArr)
  }

  const handleLockCheckAll = () => {
    if (allBoxesAreChecked(locksChecked)) {
      setLocksChecked(locksChecked.map((lock) => ({ ...lock, checked: false })))
    } else {
      setLocksChecked(locksChecked.map((lock) => ({ ...lock, checked: true })))
    }
  }

  const handleOpenLock = useCallback((openedId: number | undefined) => {
    setOpenedLockId(openedId)
  }, [])

  const handleCurrentPageChange = (dest: 'next' | 'prev') => {
    setOpenedLockId(undefined)
    if (dest == 'prev') {
      setCurrentPage(currentPage - 1 < 0 ? numPages - 1 : currentPage - 1)
    } else {
      setCurrentPage(currentPage + 1 > numPages - 1 ? 0 : currentPage + 1)
    }
  }

  const handleBatchWithdraw = async () => {
    if (!isAddress(recipientAddress)) return
    const selectedLocks = getCheckedLocks(locks, locksChecked)
    const eligibleLocks = selectedLocks.filter((lock) => lock.timeLeft.isZero())
    const eligibleIds = eligibleLocks.map((lock) => lock.xsLockID)
    if (eligibleIds.length == 0) return
    const type = eligibleIds.length > 1 ? FunctionName.WITHDRAW_MANY_FROM_LOCK : FunctionName.WITHDRAW_FROM_LOCK
    await withdrawFromLock(recipientAddress, eligibleIds)
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

  const handleBatchHarvestForScp = async () => {
    const selectedLocks = getCheckedLocks(locks, locksChecked)
    const eligibleLocks = selectedLocks.filter((lock) => !lock.pendingRewards.isZero())
    const eligibleIds = eligibleLocks.map((lock) => lock.xsLockID)
    const type = eligibleIds.length > 1 ? FunctionName.HARVEST_LOCKS_FOR_SCP : FunctionName.HARVEST_LOCK_FOR_SCP
    await harvestLockRewardsForScp(eligibleIds)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('handleBatchHarvestForScp', err, type))
  }

  const handleBatchCompound = async () => {
    const selectedLocks = getCheckedLocks(locks, locksChecked)
    const eligibleLocks = selectedLocks.filter((lock) => !lock.pendingRewards.isZero())
    const eligibleIds = eligibleLocks.map((lock) => lock.xsLockID)
    setTargetLock(undefined)
    await compoundLockRewards(eligibleIds, true, targetLock)
      .then((res) => {
        setIsCompoundModalOpen(false)
        handleToast(res.tx, res.localTx)
      })
      .catch((err) => handleContractCallError('handleBatchCompound', err, FunctionName.COMPOUND_LOCKS))
  }

  return (
    <>
      {!account ? (
        <PleaseConnectWallet />
      ) : (
        <Content>
          {parseUnits(xSolaceV1Balance, XSOLACE_V1_TOKEN.constants.decimals).gt(ZERO) && (
            <DifferenceNotification version={stakingVersion} setVersion={setStakingVersion} />
          )}
          {/* {locks.length > 0 && coverage.policyId?.isZero() && <CoverageNotification />} */}
          <SGTMigrationNotification />
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
                  <Flex stretch between mb={10}>
                    <Text>Safes selected</Text>
                    <Text>{getCheckedLocks(locks, locksChecked).length}</Text>
                  </Flex>
                  <Flex stretch between mb={24}>
                    <Text>Rewards from selected safes</Text>
                    <Text>{formattedRewards}</Text>
                  </Flex>
                  <Scrollable maxMobileHeight={'60vh'}>
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
                <Flex col itemsCenter p={10}>
                  <Text t4s textAlignCenter>
                    Recipient address for withdrawals
                  </Text>
                  <Input
                    info={recipientAddress === String(account)}
                    success={recipientAddress !== String(account)}
                    error={!isAddress(recipientAddress)}
                    bold
                    type="string"
                    value={recipientAddress}
                    onChange={(e) => handleRecipientAddressChange(e.target.value)}
                  />
                  <Text
                    bold
                    info={recipientAddress === String(account)}
                    success={recipientAddress !== String(account) && isAddress(recipientAddress) != false}
                    error={!isAddress(recipientAddress)}
                  >
                    {recipientAddress === String(account) && 'This is your address.'}
                    {recipientAddress !== String(account) &&
                      isAddress(recipientAddress) &&
                      `${shortenAddress(recipientAddress)}`}
                    {!isAddress(recipientAddress) && 'This is not a valid address.'}
                  </Text>
                </Flex>

                <Flex
                  between
                  mt={20}
                  mb={20}
                  style={
                    navbarThreshold && batchActionsIsEnabled
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
                      <Flex gap={15} style={{ marginTop: 'auto', marginBottom: 'auto' }} between={navbarThreshold}>
                        <Flex
                          center
                          gap={5}
                          style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                          onClick={handleLockCheckAll}
                        >
                          <Checkbox type="checkbox" checked={allBoxesAreChecked(locksChecked)} />
                          <Text bold t4 info>
                            Select all
                          </Text>
                        </Flex>
                        {somethingIsChecked(locksChecked) && (
                          <Flex
                            gap={15}
                            style={
                              navbarThreshold
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
                  <Flex center gap={15} column={navbarThreshold}>
                    {batchActionsIsEnabled && (
                      <Flex gap={15} col={navbarThreshold}>
                        <Button
                          secondary
                          info
                          noborder
                          pl={10}
                          pr={10}
                          py={navbarThreshold ? 20 : 0}
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
                          py={navbarThreshold ? 20 : 0}
                          onClick={() => setIsCompoundModalOpen(true)}
                          disabled
                        >
                          Compound Rewards
                        </Button>
                        <Button
                          secondary
                          info
                          noborder
                          pl={10}
                          pr={10}
                          py={navbarThreshold ? 20 : 0}
                          onClick={handleBatchWithdraw}
                          disabled={withdrawalsAreZero || !isAddress(recipientAddress)}
                        >
                          Withdraw
                        </Button>
                        {activeNetwork.config.generalFeatures.stakingRewardsV2 && policyId?.gt(ZERO) && (
                          <Button
                            warmgradient
                            secondary
                            noborder
                            pl={10}
                            pr={10}
                            py={navbarThreshold ? 20 : 0}
                            onClick={handleBatchHarvestForScp}
                            disabled={rewardsAreZero}
                          >
                            Pay Premium
                          </Button>
                        )}
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
                  locksPaginated.map((lock, i) => (
                    <Safe
                      key={lock.xsLockID.toNumber()}
                      lock={lock}
                      batchActionsIsEnabled={batchActionsIsEnabled}
                      isChecked={boxIsChecked(locksChecked, lock.xsLockID.toString())}
                      onCheck={() => handleLockCheck(lock.xsLockID)}
                      index={i}
                      openedLockId={openedLockId}
                      handleOpenLock={handleOpenLock}
                      recipientAddress={recipientAddress}
                    />
                  ))}
                {!loading && numPages > 1 && (
                  <Flex pb={20} justifyCenter>
                    <Flex itemsCenter gap={5}>
                      <GraySquareButton onClick={() => handleCurrentPageChange('prev')}>
                        <StyledArrowIosBackOutline height={18} />
                      </GraySquareButton>
                      {numPages > 1 && (
                        <Text t4>
                          Page {currentPage + 1}/{numPages}
                        </Text>
                      )}
                      <GraySquareButton onClick={() => handleCurrentPageChange('next')}>
                        <StyledArrowIosForwardOutline height={18} />
                      </GraySquareButton>
                    </Flex>
                  </Flex>
                )}
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
          {stakingVersion === StakingVersion.v1 && <StakeV1 />}
          {/* only show the following if staking is v1 and the tab is 'difference' */}
          {stakingVersion === StakingVersion.difference && <DifferenceBoxes setStakingVersion={setStakingVersion} />}
        </Content>
      )}
    </>
  )
}
