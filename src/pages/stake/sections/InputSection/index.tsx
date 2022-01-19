import React from 'react'
import { Tab } from '../../types/Tab'
import IconAndText from './IconAndText'
import InputSectionWrapper from './InputSectionWrapper'
import MaxButton from './MaxButton'

export default function InputSection({
  tab,
  value,
  onChange,
  setMax,
  disabled,
}: // ref,
{
  tab: Tab.DEPOSIT | Tab.WITHDRAW | Tab.LOCK
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setMax: () => void
  disabled?: boolean
}): JSX.Element {
  return (
    <InputSectionWrapper>
      <IconAndText tab={tab} disabled={disabled} />
      <input
        key="mainInput"
        type="text"
        className="py-3 lg:py-5 px-5 outline-none rounded-xl border-[#E3E4E6] lg:border-0 lg:rounded-none"
        placeholder="0"
        value={value}
        onChange={onChange}
        style={{ backgroundColor: 'inherit', width: '100%' }}
      />
      <MaxButton setMax={setMax} />
    </InputSectionWrapper>
  )
}
