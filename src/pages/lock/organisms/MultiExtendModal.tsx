import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { Button } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { VoteLockData } from '../../../constants/types'
import { useProvider } from '../../../context/ProviderManager'
import { filterAmount } from '../../../utils/formatting'

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
  const [durationTracker, setDurationTracker] = useState<
    {
      lockID: BigNumber
      currDays: string
      extraDays: string
      validInput: boolean
    }[]
  >([])
  const invalidLocks = useMemo(() => durationTracker.filter((lock) => !lock.validInput), [durationTracker])

  const MAX_DAYS = 1460
  const [commonDays, setCommonDays] = useState<string>('')

  const handleDaysInput = useCallback(
    (input: string, index: number) => {
      const filtered = filterAmount(input, durationTracker[index].extraDays.toString())
      setDurationTracker((prevState) => {
        return [
          ...prevState.slice(0, index),
          {
            ...prevState[index],
            extraDays: filtered,
            validInput: parseInt(filtered) + parseInt(prevState[index].currDays) <= MAX_DAYS,
          },
          ...prevState.slice(index + 1),
        ]
      })
    },
    [durationTracker]
  )

  const handleCommonDaysInput = useCallback(
    (input: string) => {
      const filtered = filterAmount(input, commonDays)
      setCommonDays(filtered)
    },
    [commonDays]
  )

  const changeAlltoCommonDays = useDebounce((commonDays: string) => {
    setDurationTracker(
      durationTracker.map((item) => {
        return {
          ...item,
          extraDays: commonDays,
        }
      })
    )
  }, 400)

  useEffect(() => {
    changeAlltoCommonDays(commonDays)
  }, [changeAlltoCommonDays, commonDays])

  useEffect(() => {
    if (isOpen) {
      console.log('opened modal')
      setDurationTracker(
        selectedLocks.map((lock) => {
          const updatedCurrDays = Math.floor(
            Math.max(lock.end.toNumber() - (latestBlock?.timestamp ?? 0), 0) / 86400
          ).toString()
          return {
            lockID: lock.lockID,
            currDays: updatedCurrDays,
            extraDays: '',
            validInput: true,
          }
        })
      )
    } else {
      console.log('closed modal')
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
          const updatedCurrDays = Math.floor(
            Math.max(lock.end.toNumber() - (latestBlock?.timestamp ?? 0), 0) / 86400
          ).toString()
          return {
            ...lock,
            currDays: updatedCurrDays,
            extraDays: prevState[i].extraDays,
            validInput: parseInt(prevState[i].extraDays) + parseInt(updatedCurrDays) <= MAX_DAYS,
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
                <Text autoAlign>Lock</Text>
                <SmallerInputSection
                  placeholder={'Days'}
                  value={lock.extraDays}
                  onChange={(e) => handleDaysInput(e.target.value, i)}
                />
              </Flex>
            ))}
          </Flex>
        </Accordion>
        <Button secondary warmgradient noborder>
          Make Extensions
        </Button>
      </Flex>
    </Modal>
  )
}
