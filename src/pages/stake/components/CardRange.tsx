import React from 'react'
import styled from 'styled-components'
import tw, { TwStyle } from 'twin.macro'

const StyledRangeInput = styled.input<{ css: string | TwStyle }>`
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
      css={tw`bg-gray-200 rounded-full h-2 mt-2.5`}
      value={value}
      onChange={onChange}
    />
  )
}
