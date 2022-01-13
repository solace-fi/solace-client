import React from 'react'
import styled from 'styled-components'

const StyledRangeInput = styled.input`
  height: 8px;
  background-color: #e3e4e6;
  border-radius: 9999px;
  &::-webkit-range-thumb,
  &::-moz-range-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    height: 24px;
    width: 24px;
    background-color: #8f85f1;
    border-width: 0;
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    border-radius: 50%;
    margin-top: 0.5rem;
  }
`

export default function CardRange({
  value,
  onChange,
  min,
  max,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  min: string
  max: string
}): JSX.Element {
  return (
    <StyledRangeInput
      type="range"
      min={min}
      max={max}
      // css={`bg-[#E3E4E6] rounded-full h-2 mt-2.5`}
      // styles={''}
      value={value}
      onChange={onChange}
    />
  )
}
