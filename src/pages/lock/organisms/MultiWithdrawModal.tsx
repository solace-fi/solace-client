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

export const MultiWithdrawModal = ({
  isOpen,
  handleClose,
  selectedLocks,
}: {
  isOpen: boolean
  handleClose: () => void
  selectedLocks: VoteLockData[]
}): JSX.Element => {
  const [amountTracker, setAmountTracker] = useState<
    {
      lockID: BigNumber
      amount: string
    }[]
  >([])

  const [commonAmount, setCommonAmount] = useState<string>('')

  const handleAmountInput = useCallback(
    (input: string, index: number) => {
      const filtered = filterAmount(input, amountTracker[index].amount.toString())
      setAmountTracker(
        amountTracker.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              amount: filtered,
            }
          }
          return item
        })
      )
    },
    [amountTracker]
  )

  const handleCommonAmountInput = useCallback(
    (input: string) => {
      const filtered = filterAmount(input, commonAmount)
      setCommonAmount(filtered)
    },
    [commonAmount]
  )

  const changeAlltoCommonAmount = useDebounce((commonAmount: string) => {
    setAmountTracker(
      amountTracker.map((item) => {
        return {
          ...item,
          amount: commonAmount,
        }
      })
    )
  }, 400)

  useEffect(() => {
    changeAlltoCommonAmount(commonAmount)
  }, [changeAlltoCommonAmount, commonAmount])

  useEffect(() => {
    if (isOpen)
      setAmountTracker(
        selectedLocks.map((lock) => {
          return {
            lockID: lock.lockID,
            amount: '',
          }
        })
      )
    else {
      setAmountTracker([])
      setCommonAmount('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Withdraw'}>
      <Flex col gap={10}>
        <Flex col>
          <Text>Set all to this amount</Text>
          <SmallerInputSection
            placeholder={'Amount'}
            value={commonAmount}
            onChange={(e) => handleCommonAmountInput(e.target.value)}
          />
        </Flex>
        <Accordion isOpen={true} thinScrollbar customHeight={'50vh'}>
          <Flex col gap={10} p={10}>
            {amountTracker.map((lock, i) => (
              <Flex gap={10} key={i}>
                <Text autoAlign>Lock</Text>
                <SmallerInputSection
                  placeholder={'Amount'}
                  value={lock.amount}
                  onChange={(e) => handleAmountInput(e.target.value, i)}
                />
              </Flex>
            ))}
          </Flex>
        </Accordion>
        <Button secondary warmgradient noborder>
          Make Withdrawals
        </Button>
        <Button noborder matchBg>
          <Text warmgradient>Withdraw everything</Text>
        </Button>
      </Flex>
    </Modal>
  )
}
