import React from 'react'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import InformationBox from '../../components/InformationBox'
import { Tab, InfoBoxType } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { BKPT_7, BKPT_5, DAYS_PER_YEAR } from '../../../../constants'
import { useXSLocker } from '../../../../hooks/stake/useXSLocker'
import { useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { BigNumber } from 'ethers'
import { useProvider } from '../../../../context/ProviderManager'
import { SmallBox } from '../../../../components/atoms/Box'
import { Text } from '../../../../components/atoms/Typography'
import { getExpiration } from '../../../../utils/time'
import { StyledForm } from '../../atoms/StyledForm'
import { Flex } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'

export default function LockForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { rightSidebar } = useGeneral()
  const { latestBlock } = useProvider()
  const { extendLock } = useXSLocker()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { width } = useWindowDimensions()

  const [inputValue, setInputValue] = React.useState('0')

  const callExtendLock = async () => {
    if (!latestBlock || !inputValue || inputValue == '0') return
    const seconds = latestBlock.timestamp + parseInt(inputValue) * 86400
    await extendLock(lock.lockID, BigNumber.from(seconds))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callExtendLock', err, FunctionName.EXTEND_LOCK))
  }

  const inputOnChange = (value: string) => {
    const filtered = value.replace(/[^0-9]*/g, '')
    if (parseFloat(filtered) <= DAYS_PER_YEAR * 4 || filtered == '') {
      setInputValue(filtered)
    }
  }
  const rangeOnChange = (value: string) => {
    setInputValue(value)
  }

  const setMax = () => setInputValue(`${DAYS_PER_YEAR * 4}`)

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
              max={DAYS_PER_YEAR * 4}
            />
          </Flex>
        </Flex>
        {
          <SmallBox transparent collapse={!inputValue || inputValue == '0'} m={0} p={0}>
            <Text>Lockup End Date: {getExpiration(parseInt(inputValue))}</Text>
          </SmallBox>
        }
        <Button
          pl={14}
          pr={14}
          secondary
          info
          noborder
          disabled={
            !inputValue ||
            parseInt(inputValue) * 86400 <= (latestBlock ? lock.end.toNumber() > latestBlock.timestamp : 0)
          }
          onClick={callExtendLock}
        >
          {(latestBlock ? lock.end.toNumber() > latestBlock.timestamp : true) ? `Reset Lockup` : `Start Lockup`}
        </Button>
      </StyledForm>
    </div>
  )
}
