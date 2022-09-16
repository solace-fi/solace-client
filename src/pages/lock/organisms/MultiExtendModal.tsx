import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { Button } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { DAYS_PER_YEAR } from '../../../constants'
import { FunctionName } from '../../../constants/enums'
import { VoteLockData } from '../../../constants/types'
import { useProvider } from '../../../context/ProviderManager'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { useUwLocker } from '../../../hooks/lock/useUwLocker'
import { filterAmount, formatAmount } from '../../../utils/formatting'
import { getDateStringWithMonthName } from '../../../utils/time'

export const MultiExtendModal = ({
  isOpen,
  handleClose,
  selectedLocks,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedLocks: VoteLockData[]
}): JSX.Element => {
  const { latestBlock } = useProvider()
  const { extendLock, extendLockMultiple } = useUwLocker()
  const { handleToast, handleContractCallError } = useTransactionExecution()

  const [durationTracker, setDurationTracker] = useState<
    {
      lockID: BigNumber
      currDays: string
      currEnd: number
      extraDays: string
      validInput: boolean
    }[]
  >([])
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const invalidLocks = useMemo(() => durationTracker.filter((lock) => !lock.validInput), [durationTracker])

  const MAX_DAYS = DAYS_PER_YEAR * 4
  const [commonDays, setCommonDays] = useState<string>('')

  const callExtendLockMultiple = async () => {
    if (!latestBlock) return
    const chosenlocks = durationTracker.filter((lock) => parseInt(formatAmount(lock.extraDays)) > 0)

    if (chosenlocks.length === 0) return
    if (chosenlocks.length === 1) {
      const l = chosenlocks[0]
      const lockEnd = Math.max(l.currEnd, latestBlock.timestamp)
      const lockTimeInSeconds = lockEnd - latestBlock.timestamp
      const extendableSeconds = maxSelected
        ? MAX_DAYS * 86400 - lockTimeInSeconds
        : parseInt(formatAmount(l.extraDays)) * 86400
      const newEndDateInSeconds = BigNumber.from(lockEnd + extendableSeconds)
      await extendLock(l.lockID, newEndDateInSeconds)
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callExtendLock', err, FunctionName.EXTEND_LOCK))
    } else {
      const newEndDatesInSeconds = chosenlocks.map((lock) => {
        const lockEnd = Math.max(lock.currEnd, latestBlock.timestamp)
        const lockTimeInSeconds = lockEnd - latestBlock.timestamp
        const extendableSeconds = maxSelected
          ? MAX_DAYS * 86400 - lockTimeInSeconds
          : parseInt(formatAmount(lock.extraDays)) * 86400
        return BigNumber.from(lockEnd + extendableSeconds)
      })
      await extendLockMultiple(
        chosenlocks.map((lock) => lock.lockID),
        newEndDatesInSeconds
      )
        .then((res) => handleToast(res.tx, res.localTx))
        .catch((err) => handleContractCallError('callExtendLockMultiple', err, FunctionName.EXTEND_LOCK_MULTIPLE))
    }
  }

  const handleMax = useCallback(() => {
    setMaxSelected(true)
    setDurationTracker((prevState) => {
      return prevState.map((lock) => {
        return {
          ...lock,
          extraDays: Math.max(MAX_DAYS - parseInt(lock.currDays), 0).toString(),
          validInput: true,
        }
      })
    })
  }, [MAX_DAYS])

  const handleDaysInput = useCallback(
    (input: string, index: number) => {
      setMaxSelected(false)
      const filtered = filterAmount(input, durationTracker[index].extraDays.toString())
      const formatted = formatAmount(filtered)
      setDurationTracker((prevState) => {
        return [
          ...prevState.slice(0, index),
          {
            ...prevState[index],
            extraDays: filtered,
            validInput:
              parseFloat(formatted) > 0 ? parseInt(formatted) + parseInt(prevState[index].currDays) <= MAX_DAYS : true,
          },
          ...prevState.slice(index + 1),
        ]
      })
    },
    [durationTracker, MAX_DAYS]
  )

  const handleCommonDaysInput = useCallback(
    (input: string) => {
      const filtered = filterAmount(input, commonDays)
      setCommonDays(filtered)
    },
    [commonDays]
  )

  const changeAlltoCommonDays = useDebounce((commonDays: string) => {
    setMaxSelected(false)
    setDurationTracker((prevState) => {
      return prevState.map((item) => {
        return {
          ...item,
          extraDays: commonDays,
          validInput: parseFloat(commonDays) > 0 ? parseInt(commonDays) + parseInt(item.currDays) <= MAX_DAYS : true,
        }
      })
    })
  }, 400)

  useEffect(() => {
    changeAlltoCommonDays(commonDays)
  }, [changeAlltoCommonDays, commonDays])

  useEffect(() => {
    if (isOpen) {
      setDurationTracker(
        selectedLocks.map((lock) => {
          const lockEnd = Math.max(lock.end.toNumber(), latestBlock?.timestamp ?? 0)
          const lockTimeInSeconds = latestBlock ? lockEnd - latestBlock.timestamp : 0
          const extendableDays = Math.floor(MAX_DAYS - lockTimeInSeconds / 86400)
          const updatedCurrDays = (MAX_DAYS - extendableDays).toString()
          return {
            lockID: lock.lockID,
            currDays: updatedCurrDays,
            currEnd: lock.end.toNumber(),
            extraDays: '',
            validInput: true,
          }
        })
      )
    } else {
      setDurationTracker([])
      setCommonDays('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      console.log('updated curr days')
      setDurationTracker((prevState) =>
        selectedLocks.map((lock, i) => {
          const lockEnd = Math.max(lock.end.toNumber(), latestBlock?.timestamp ?? 0)
          const lockTimeInSeconds = latestBlock ? lockEnd - latestBlock.timestamp : 0
          const extendableDays = Math.floor(MAX_DAYS - lockTimeInSeconds / 86400)
          const updatedCurrDays = (MAX_DAYS - extendableDays).toString()
          return {
            lockID: lock.lockID,
            currDays: updatedCurrDays,
            currEnd: lock.end.toNumber(),
            extraDays: prevState[i].extraDays,
            validInput:
              parseInt(formatAmount(prevState[i].extraDays)) > 0
                ? parseInt(formatAmount(prevState[i].extraDays)) + parseInt(updatedCurrDays) <= MAX_DAYS
                : true,
          }
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestBlock])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Extend'}>
      <Flex col gap={10}>
        <Flex col>
          <Text>Set all to this number of days</Text>
          <SmallerInputSection
            placeholder={'Days'}
            value={commonDays}
            onChange={(e) => handleCommonDaysInput(e.target.value)}
          />
        </Flex>
        <Accordion isOpen={true} thinScrollbar customHeight={'50vh'}>
          <Flex col gap={10} p={10}>
            {durationTracker.map((lock, i) => (
              <Flex gap={10} key={i}>
                <Text
                  autoAlign
                  warning={parseInt(formatAmount(lock.extraDays)) == 0 && parseInt(lock.currDays) >= MAX_DAYS}
                  error={
                    parseInt(formatAmount(lock.extraDays)) > 0 &&
                    parseInt(lock.currDays) + parseInt(formatAmount(lock.extraDays)) > MAX_DAYS
                  }
                >
                  #{lock.lockID.toNumber()}
                </Text>
                <div style={{ width: '70px' }}>
                  <SmallerInputSection
                    placeholder={'Days'}
                    value={lock.extraDays}
                    onChange={(e) => handleDaysInput(e.target.value, i)}
                  />
                </div>
                <Text autoAlign>
                  {getDateStringWithMonthName(
                    new Date(
                      (Math.max(lock.currEnd, latestBlock?.timestamp ?? 0) +
                        parseInt(formatAmount(lock.extraDays)) * 86400) *
                        1000
                    )
                  )}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Accordion>
        <Flex col gap={10}>
          <Button
            secondary
            techygradient
            noborder
            widthP={100}
            disabled={invalidLocks.length > 0}
            onClick={callExtendLockMultiple}
          >
            Make Extensions
          </Button>
          <Button widthP={100} noborder matchBg onClick={handleMax}>
            <Text warmgradient>MAX</Text>
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}
