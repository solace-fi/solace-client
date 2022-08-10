import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { Button } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { VoteLockData } from '../../../constants/types'
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
  const [durationTracker, setDurationTracker] = useState<
    {
      lockID: BigNumber
      days: string
    }[]
  >([])

  const [commonDays, setCommonDays] = useState<string>('')

  const handleDaysInput = useCallback(
    (input: string, index: number) => {
      const filtered = filterAmount(input, durationTracker[index].days.toString())
      setDurationTracker(
        durationTracker.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              days: filtered,
            }
          }
          return item
        })
      )
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
          amount: commonDays,
        }
      })
    )
  }, 400)

  useEffect(() => {
    changeAlltoCommonDays(commonDays)
  }, [changeAlltoCommonDays, commonDays])

  useEffect(() => {
    if (isOpen)
      setDurationTracker(
        selectedLocks.map((lock) => {
          return {
            lockID: lock.lockID,
            days: '',
          }
        })
      )
    else {
      setDurationTracker([])
      setCommonDays('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

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
                  value={lock.days}
                  onChange={(e) => handleDaysInput(e.target.value, i)}
                />
              </Flex>
            ))}
          </Flex>
        </Accordion>
        <Button secondary warmgradient noborder>
          Make Deposits
        </Button>
      </Flex>
    </Modal>
  )
}
