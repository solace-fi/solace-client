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

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 30px;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  width: 521px;
`

export default function DepositForm({ lock }: { lock: LockData }): JSX.Element {
  const solaceBalance = useSolaceBalance()
  const { handleToast, handleContractCallError, isAppropriateAmount, gasConfig } = useInputAmount()
  const { increaseLockAmount } = useXSLocker()
  const { account } = useWallet()

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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    callIncreaseLockAmount()
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
        text="New deposit will be added to current locked amount locked for the same time. "
      />
      <StyledForm onSubmit={onSubmit}>
        <InputSection
          tab={Tab.DEPOSIT}
<<<<<<< HEAD
          value={Number(inputValue) > 0 ? inputValue : undefined}
          onChange={inputOnChange}
          setMax={setMax}
        />
        <StyledSlider
          value={Number(rangeValue) > 0 ? rangeValue : undefined}
          onChange={rangeOnChange}
          min={0}
          max={100}
        />
        {/* <CardRange value={rangeValue} onChange={rangeOnChange} min="0" max="100" /> */}
        <Button secondary info noborder>
=======
          value={inputValue}
          onChange={(e) => inputOnChange(e.target.value)}
          setMax={setMax}
        />
        <StyledSlider
          value={rangeValue}
          onChange={(e) => rangeOnChange(e.target.value)}
          min={1}
          max={parseUnits(solaceBalance, 18).toString()}
        />
        <Button secondary info noborder disabled={!isAppropriateAmount(inputValue, 18, parseUnits(solaceBalance, 18))}>
>>>>>>> 2f69d3337b1aa22dfd1da0d11194a5a864f06532
          Stake
        </Button>
      </StyledForm>
    </div>
  )
}
