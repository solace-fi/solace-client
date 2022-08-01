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
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

/* import managers */
import { useGeneral } from '../../context/GeneralManager'
import { useProvider } from '../../context/ProviderManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { BKPT_1, BKPT_5, BKPT_6, ZERO, Z_TABLE } from '../../constants'
import { CheckboxData } from '../../constants/types'

/* import components */
import { Button, ButtonWrapper, GraySquareButton } from '../../components/atoms/Button'
import { Card, CardContainer } from '../../components/atoms/Card'
import { Checkbox } from '../../components/atoms/Input'
import { Content, Flex, Scrollable, HeroContainer } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { Modal } from '../../components/molecules/Modal'
import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '../../components/atoms/Table'
import {
  StyledMultiselect,
  StyledInfo,
  StyledArrowIosBackOutline,
  StyledArrowIosForwardOutline,
} from '../../components/atoms/Icon'
import Safe from './sections/Safe/index'
import AggregatedStakeData from './sections/AggregatedStakeData'
import NewSafe from './sections/Safe/NewSafe'
import CardSectionValue from './components/CardSectionValue'

/* import hooks */
import { useTransactionExecution } from '../../hooks/internal/useInputAmount'
import { useUserLockData, useXSLocker } from '../../hooks/stake/useXSLocker'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

/* import utils */
import { floatUnits, truncateValue } from '../../utils/formatting'

import updateLocksChecked from './utils/updateLocksChecked'
import getCheckedLocks from './utils/getCheckedLocks'

import { boxIsChecked, updateBoxCheck, somethingIsChecked, allBoxesAreChecked } from '../../utils/checkbox'

import '../../styles/tailwind.min.css'

// util imports

import { getTimeFromMillis } from '../../utils/time'
import { Loader } from '../../components/atoms/Loader'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { useWeb3React } from '@web3-react/core'
import { LockData, UserLocksData, UserLocksInfo } from '@solace-fi/sdk-nightly'

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
  const [loading, setLoading] = useState<boolean>(true)

  const fetchingLocks = useRef(false)

  const [targetLock, setTargetLock] = useState<BigNumber | undefined>(undefined)
  const [locksChecked, setLocksChecked] = useState<CheckboxData[]>([])
  const locksCheckedRef = useRef(locksChecked)
  locksCheckedRef.current = locksChecked

  const { account } = useWeb3React()
  const { latestBlock } = useProvider()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
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
  const { getUserLocks } = useUserLockData()
  const { withdrawFromLock } = useXSLocker()
  const { handleToast, handleContractCallError } = useTransactionExecution()
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

  return (
    <>
      {!account ? (
        <PleaseConnectWallet />
      ) : (
        <Content>
          {canStakeV2 ? (
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {locks.map((lock) => {
                          const unboostedAmount = formatUnits(lock.unboostedAmount, 18)
                          const boostedValue = formatUnits(lock.boostedValue, 18)
                          const multiplier =
                            parseFloat(unboostedAmount) > 0 ? parseFloat(boostedValue) / parseFloat(unboostedAmount) : 0
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
                          </Card>
                        )
                      })}
                    </CardContainer>
                  )}
                </Scrollable>
                {targetLock && (
                  <ButtonWrapper>
                    <Button widthP={100} info>
                      Confirm
                    </Button>
                  </ButtonWrapper>
                )}
              </Modal>
              <AggregatedStakeData stakeData={userLockInfo} />
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
              <Card error pt={10} pb={10} pl={15} pr={15}>
                <TextSpan light textAlignLeft>
                  <StyledInfo size={30} />
                </TextSpan>
                <Text light bold style={{ margin: '0 auto' }}>
                  Staking V2 is not available on this network.
                </Text>
              </Card>
            </Content>
          )}
        </Content>
      )}
    </>
  )
}
