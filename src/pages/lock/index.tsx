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
import { BKPT_5, BKPT_6, ZERO } from '../../constants'
import { CheckboxData, VoteLockData } from '../../constants/types'

/* import components */
import { Button, GraySquareButton } from '../../components/atoms/Button'
import { Checkbox } from '../../components/atoms/Input'
import { Content, Flex, HeroContainer } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { StyledMultiselect, StyledArrowIosBackOutline, StyledArrowIosForwardOutline } from '../../components/atoms/Icon'
import Safe from './sections/Safe/index'
import AggregatedStakeData from './sections/AggregatedStakeData'
import NewSafe from './sections/Safe/NewSafe'
import CardSectionValue from './components/CardSectionValue'

/* import hooks */
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useUwLocker } from '../../hooks/lock/useUwLocker'

/* import utils */
import { floatUnits, truncateValue } from '../../utils/formatting'

import updateLocksChecked from './utils/updateLocksChecked'
import getCheckedLocks from './utils/getCheckedLocks'

import { boxIsChecked, updateBoxCheck, somethingIsChecked, allBoxesAreChecked } from '../../utils/checkbox'

import '../../styles/tailwind.min.css'

// util imports

import { Loader } from '../../components/atoms/Loader'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { useWeb3React } from '@web3-react/core'
import { MultiDepositModal } from './organisms/MultiDepositModal'
import { MultiWithdrawModal } from './organisms/MultiWithdrawModal'
import { MultiExtendModal } from './organisms/MultiExtendModal'
import LockManager from './LockContext'

/*
 Components
 */

export default function Lock(): JSX.Element {
  return (
    <LockManager>
      <LockContent />
    </LockManager>
  )
}

const LockContent = () => {
  const { rightSidebar } = useGeneral()
  const { width } = useWindowDimensions()
  // account usewallet
  const [newSafeIsOpen, setNewSafeIsOpen] = useState(false)
  const [batchActionsIsEnabled, setBatchActionsIsEnabled] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)

  const [openDepositModal, setOpenDepositModal] = useState(false)
  const [openExtendModal, setOpenExtendModal] = useState(false)
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false)

  const fetchingLocks = useRef(false)

  const [locksChecked, setLocksChecked] = useState<CheckboxData[]>([])
  const locksCheckedRef = useRef(locksChecked)
  locksCheckedRef.current = locksChecked

  const { account } = useWeb3React()
  const { latestBlock } = useProvider()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const [locks, setLocks] = useState<VoteLockData[]>([])
  const [staked, setStaked] = useState<BigNumber>(ZERO)
  const { totalStakedBalance, getAllLockIDsOf, locks: getLock } = useUwLocker()
  const selectedLocks = useMemo(
    () =>
      locks.filter((lock) =>
        locksChecked.find((checkedLock) => checkedLock.id == lock.lockID.toString() && checkedLock.checked)
      ),
    [locks, locksChecked]
  )

  const navbarThreshold = useMemo(() => width < (rightSidebar ? BKPT_6 : BKPT_5), [rightSidebar, width])

  const calculateTotalWithdrawable = useCallback(
    (locks: VoteLockData[]): BigNumber =>
      locks.reduce(
        (acc, lock) => (latestBlock && lock.end.toNumber() <= latestBlock.timestamp ? acc.add(lock.amount) : acc),
        ZERO
      ),
    [latestBlock]
  )

  const withdrawalsAreZero = useMemo(() => calculateTotalWithdrawable(getCheckedLocks(locks, locksChecked)).isZero(), [
    locks,
    locksChecked,
    calculateTotalWithdrawable,
  ])

  const formattedWithdrawal = useMemo(
    () => truncateValue(formatUnits(calculateTotalWithdrawable(getCheckedLocks(locks, locksChecked)), 18), 4),
    [locks, locksChecked, calculateTotalWithdrawable]
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
      const [staked, lockIDs] = await Promise.all([totalStakedBalance(account), getAllLockIDsOf(account)])
      // const voteLocks = await Promise.all(lockIDs.map((lockID) => getLock(lockID)))

      // const locks = lockIDs.map((lockID, index) => ({ ...voteLocks[index], lockID }))
      const locks = [
        {
          lockID: BigNumber.from(0),
          amount: BigNumber.from(0),
          end: BigNumber.from(0),
        },
        {
          lockID: BigNumber.from(1),
          amount: BigNumber.from(0),
          end: BigNumber.from(0),
        },
      ]
      const sortedLocks = locks.sort((a, b) => {
        return floatUnits(b.amount.sub(a.amount), 18)
      })

      setLocksChecked(updateLocksChecked(sortedLocks, locksCheckedRef.current))
      setLocks(sortedLocks)
      setStaked(staked)
      setLoading(false)
      fetchingLocks.current = false
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

  return (
    <>
      {!account ? (
        <PleaseConnectWallet />
      ) : (
        <Content>
          <MultiDepositModal
            isOpen={openDepositModal}
            handleClose={() => setOpenDepositModal(false)}
            selectedLocks={selectedLocks}
          />
          <MultiExtendModal
            isOpen={openExtendModal}
            handleClose={() => setOpenExtendModal(false)}
            selectedLocks={selectedLocks}
          />
          <MultiWithdrawModal
            isOpen={openWithdrawModal}
            handleClose={() => setOpenWithdrawModal(false)}
            selectedLocks={selectedLocks}
          />
          <AggregatedStakeData stakeData={{ stakedBalance: staked }} />
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
                    <Checkbox
                      type="checkbox"
                      checked={allBoxesAreChecked(locksChecked)}
                      onChange={handleLockCheckAll}
                    />
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
                    onClick={() => setOpenDepositModal(true)}
                  >
                    Deposit
                  </Button>
                  <Button
                    secondary
                    info
                    noborder
                    pl={10}
                    pr={10}
                    py={navbarThreshold ? 20 : 0}
                    onClick={() => setOpenExtendModal(true)}
                  >
                    Extend
                  </Button>
                  <Button
                    secondary
                    info
                    noborder
                    pl={10}
                    pr={10}
                    py={navbarThreshold ? 20 : 0}
                    onClick={() => setOpenWithdrawModal(true)}
                    // disabled={withdrawalsAreZero}
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
                key={lock.lockID.toNumber()}
                lock={lock}
                batchActionsIsEnabled={batchActionsIsEnabled}
                isChecked={boxIsChecked(locksChecked, lock.lockID.toString())}
                onCheck={() => handleLockCheck(lock.lockID)}
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
        </Content>
      )}
    </>
  )
}
