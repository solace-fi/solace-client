import React from 'react'
import styled from 'styled-components'

const StyledRangeInput = styled.input<{ css: string | string }>`
  &::-webkit-range-thumb,
  &::-moz-range-thumb {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 0;
    background-color: #5f5df9;
    background-image: "url('/solace-token-gradient.svg')";
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    overflow: hidden;
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
      css={'background-color: #E3E4E6; border-radius: 50%; height: 2.5rem; margin-top: 0.5rem;'}
      value={value}
      onChange={onChange}
    />
  )
}
