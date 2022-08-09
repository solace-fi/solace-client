import React from 'react'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { useSolaceBalance } from '../../../../hooks/balance/useBalance'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount } from '../../../../utils/formatting'
import InformationBox from '../../components/InformationBox'
import { Tab, InfoBoxType } from '../../../../constants/enums'
import { InputSection } from '../../../../components/molecules/InputSection'
import { useInputAmount, useTransactionExecution } from '../../../../hooks/internal/useInputAmount'
import { FunctionName } from '../../../../constants/enums'
import { useXSLocker } from '../../../../hooks/stake/useXSLocker'

import { StyledForm } from '../../atoms/StyledForm'
import { Flex } from '../../../../components/atoms/Layout'
import { useWindowDimensions } from '../../../../hooks/internal/useWindowDimensions'
import { BKPT_5, BKPT_7 } from '../../../../constants'
import { useWeb3React } from '@web3-react/core'
import { useGeneral } from '../../../../context/GeneralManager'
import { VoteLockData } from '../../../../constants/types'

export default function DepositForm({ lock }: { lock: VoteLockData }): JSX.Element {
  const { rightSidebar } = useGeneral()
  const solaceBalance = useSolaceBalance()
  const { isAppropriateAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { increaseLockAmount } = useXSLocker()
  const { account } = useWeb3React()
  const { width } = useWindowDimensions()

  const disabled = false

  const [inputValue, setInputValue] = React.useState('0')
  const [rangeValue, setRangeValue] = React.useState('0')

  const callIncreaseLockAmount = async () => {
    if (!account) return
    await increaseLockAmount(account, lock.lockID, parseUnits(inputValue, 18))
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callIncreaseLockAmount', err, FunctionName.INCREASE_LOCK_AMOUNT))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, inputValue)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return
    setRangeValue(accurateMultiply(filtered, 18))
    setInputValue(filtered)
  }

  const rangeOnChange = (value: string, convertFromSciNota = true) => {
    setInputValue(formatUnits(BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`), 18))
    setRangeValue(`${convertFromSciNota ? convertSciNotaToPrecise(value) : value}`)
  }

  const setMax = () => rangeOnChange(parseUnits(solaceBalance, 18).toString())

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      <InformationBox type={InfoBoxType.info} text="Deposit into this safe for voting power." />
      <StyledForm>
        <Flex column={(rightSidebar ? BKPT_7 : BKPT_5) > width} gap={24}>
          <Flex column gap={24}>
            <InputSection
              tab={Tab.DEPOSIT}
              value={inputValue}
              onChange={(e) => inputOnChange(e.target.value)}
              setMax={() =>
                !disabled
                  ? setMax()
                  : () => {
                      return undefined
                    }
              }
              disabled={disabled}
            />
            <StyledSlider
              value={rangeValue}
              onChange={(e) => rangeOnChange(e.target.value)}
              min={1}
              max={parseUnits(solaceBalance, 18).toString()}
              disabled={disabled}
            />
          </Flex>
        </Flex>
        <Button
          secondary
          info
          noborder
          disabled={!isAppropriateAmount(inputValue, 18, parseUnits(solaceBalance, 18))}
          onClick={callIncreaseLockAmount}
        >
          Stake
        </Button>
      </StyledForm>
    </div>
  )
}
