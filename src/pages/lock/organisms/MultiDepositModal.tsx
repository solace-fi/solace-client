import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useState } from 'react'
import { Accordion } from '../../../components/atoms/Accordion'
import { ButtonAppearance } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { Modal } from '../../../components/molecules/Modal'
import { VoteLockData } from '../../../constants/types'
import { filterAmount, formatAmount } from '../../../utils/formatting'

export const MultiDepositModal = ({
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
      amount: BigNumber
    }[]
  >([])

  const handleAmountInput = useCallback(
    (input: string, index: number) => {
      const filtered = filterAmount(input, amountTracker[index].amount.toString())
      setAmountTracker(
        amountTracker.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              amount: parseUnits(formatAmount(filtered)),
            }
          }
          return item
        })
      )
    },
    [amountTracker]
  )

  useEffect(() => {
    if (isOpen) setAmountTracker(selectedLocks)
    else setAmountTracker([])
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Deposit'}>
      <Accordion isOpen={true} thinScrollbar>
        <Flex col gap={10} p={10}>
          {amountTracker.map((lock, i) => (
            <ButtonAppearance key={i} secondary matchBg noborder nohover p={10}>
              <Flex gap={10}>
                <SmallerInputSection
                  placeholder={'Amount'}
                  value={lock.amount.toString()}
                  onChange={(e) => handleAmountInput(e.target.value, i)}
                />
              </Flex>
            </ButtonAppearance>
          ))}
        </Flex>
      </Accordion>
    </Modal>
  )
}
