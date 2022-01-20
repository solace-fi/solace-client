import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import { useSolaceBalance } from '../../../../hooks/useBalance'
import { accurateMultiply, convertSciNotaToPrecise, filterAmount, formatAmount } from '../../../../utils/formatting'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { Tab } from '../../types/Tab'
import InputSection from '../InputSection'
import { useInputAmount } from '../../../../hooks/useInputAmount'
import { LockData } from '../../../../constants/types'
import { FunctionName } from '../../../../constants/enums'
import { useXSLocker } from '../../../../hooks/useXSLocker'
import { useWallet } from '../../../../context/WalletManager'
import { BKPT_5 } from '../../../../constants'
import { StyledForm } from '../../atoms/StyledForm'

export default function DepositForm({ lock }: { lock: LockData }): JSX.Element {
  const solaceBalance = useSolaceBalance()
  const { handleToast, handleContractCallError, isAppropriateAmount, gasConfig } = useInputAmount()
  const { increaseLockAmount } = useXSLocker()
  const { account } = useWallet()
  const [disabled, setDisabled] = React.useState(false)

  const [inputValue, setInputValue] = React.useState('0')
  const [rangeValue, setRangeValue] = React.useState('0')

  const callIncreaseLockAmount = async () => {
    if (!account) return
    await increaseLockAmount(account, lock.xsLockID, parseUnits(inputValue, 18), gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callIncreaseLockAmount', err, FunctionName.INCREASE_LOCK_AMOUNT))
  }

  const inputOnChange = (value: string) => {
    const filtered = filterAmount(value, inputValue)
    const formatted = formatAmount(filtered)
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    if (parseUnits(formatted, 18).gt(parseUnits(solaceBalance, 18))) return

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
      <InformationBox type={InfoBoxType.info} text="Stake additional SOLACE to this safe." />
      <StyledForm>
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
