import React, { useMemo, useState } from 'react'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import InformationBox from '../../components/InformationBox'
import { Tab, InfoBoxType } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { BKPT_7, BKPT_5, DAYS_PER_YEAR } from '../../../../constants'
import { useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { BigNumber } from 'ethers'
import { useProvider } from '../../../../context/ProviderManager'
import { Text } from '../../../../components/atoms/Typography'
import { getDateStringWithMonthName } from '../../../../utils/time'
import { StyledForm } from '../../atoms/StyledForm'
import { Flex } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'
import { useUwLocker } from '../../../../hooks/lock/useUwLocker'

export default function LockForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { latestBlock } = useProvider()
  const { extendLock } = useUwLocker()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { width } = useWindowDimensions()
  const [maxSelected, setMaxSelected] = useState(false)

  const lockEnd = useMemo(() => Math.max(lock.end.toNumber(), latestBlock?.timestamp ?? 0), [lock.end, latestBlock])

  const lockTimeInSeconds = useMemo(() => (latestBlock ? lockEnd - latestBlock.timestamp : 0), [latestBlock, lockEnd])

  const extendableDays = useMemo(() => Math.floor(DAYS_PER_YEAR * 4 - lockTimeInSeconds / 86400), [lockTimeInSeconds])

  const [inputValue, setInputValue] = React.useState('0')

  const callExtendLock = async () => {
    if (!latestBlock || !inputValue || inputValue == '0') return
    const newEndDateInSeconds =
      lockEnd + (maxSelected ? DAYS_PER_YEAR * 4 * 86400 - lockTimeInSeconds : parseInt(inputValue) * 86400)
    await extendLock(lock.lockID, BigNumber.from(newEndDateInSeconds))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callExtendLock', err, FunctionName.EXTEND_LOCK))
  }

  const inputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= extendableDays || filtered == '') {
      setInputValue(filtered)
      setMaxSelected(false)
    }
  }
  const rangeOnChange = (value: string) => {
    setInputValue(value)
    setMaxSelected(false)
  }

  const setMax = () => {
    setInputValue(`${extendableDays}`)
    setMaxSelected(true)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox
        type={InfoBoxType.info}
        text="The maximum lockup period is 4 years. Note that you cannot withdraw during a lockup period."
      />
      <StyledForm>
        <Flex column={(rightSidebar ? BKPT_7 : BKPT_5) > width} gap={24}>
          <Flex column gap={24}>
            <InputSection
              tab={Tab.LOCK}
              value={inputValue}
              onChange={(e) => inputOnChange(e.target.value)}
              setMax={setMax}
            />
            <StyledSlider
              value={inputValue}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={0}
              max={extendableDays}
            />
          </Flex>
        </Flex>
        <Text>
          Lockup End Date:{' '}
          {getDateStringWithMonthName(new Date((lockEnd + parseInt(!inputValue ? '0' : inputValue) * 86400) * 1000))}
        </Text>
        <Button
          pl={14}
          pr={14}
          secondary
          info
          noborder
          disabled={
            !inputValue || inputValue == '0' || parseInt(inputValue) + lockTimeInSeconds / 86400 > DAYS_PER_YEAR * 4
          }
          onClick={callExtendLock}
        >
          Extend
        </Button>
      </StyledForm>
    </div>
  )
}
