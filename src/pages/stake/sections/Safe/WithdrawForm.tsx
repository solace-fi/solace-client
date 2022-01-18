import React from 'react'
import styled from 'styled-components'
import { Button } from '../../../../components/atoms/Button'
import { StyledSlider } from '../../../../components/atoms/Input'
import InformationBox from '../../components/InformationBox'
import { InfoBoxType } from '../../types/InfoBoxType'
import { Tab } from '../../types/Tab'
import InputSection from '../InputSection'

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

export default function WithdrawForm(): JSX.Element {
  // const solaceBalance = useSolaceBalance()
  const solaceBalance = '123123'
  const lockTimeLeft = 157
  const [inputValue, setInputValue] = React.useState('0')
  const [rangeValue, setRangeValue] = React.useState('0')
  const setMax = () => (setRangeValue('100'), setInputValue(solaceBalance))
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('clickity click')
  }

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setRangeValue(String((parseFloat(value) / parseFloat(solaceBalance)) * 100))
  }
  const rangeOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log(value)
    // rule of 3 formula: (inputValue / 100) * solaceBalance
    const newInputValue = String((parseFloat(value) / 100) * parseFloat(solaceBalance))
    setInputValue(newInputValue)
    setRangeValue(value)
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}
    >
      {/* <InformationBox
        type={InfoBoxType.info}
        text="Withdrowal is available only when lock period ends. "
      /> */}
      <StyledForm onSubmit={onSubmit}>
        <InputSection
          tab={Tab.WITHDRAW}
          value={Number(inputValue) > 0 ? inputValue : undefined}
          onChange={inputOnChange}
          setMax={setMax}
          disabled={true}
        />
        <StyledSlider
          value={Number(rangeValue) > 0 ? rangeValue : undefined}
          onChange={rangeOnChange}
          min={0}
          max={100}
          disabled={lockTimeLeft > 0}
        />
        {/* <CardRange value={rangeValue} onChange={rangeOnChange} min="0" max="100" /> */}
        <Button secondary info noborder>
          Withdraw
        </Button>
      </StyledForm>
    </div>
  )
}
