import React from 'react'
import styled from 'styled-components'
import { InfoCircle } from 'styled-icons/bootstrap'
import tw from 'twin.macro'
import { InfoBoxType } from '../types/InfoBoxType'
import Twiv from './Twiv'

const StyledInfoCircle = styled(InfoCircle)`
  /* color: red; */
`
export default function InformationBox({ type, text }: { type: InfoBoxType; text: string }): JSX.Element {
  return (
    <div
      className={`flex border ${
        {
          [InfoBoxType.info]: 'border-text-accent bg-bg-accent text-text-accent',
          [InfoBoxType.warning]: 'border-text-warning text-text-warning bg-bg-warning',
          [InfoBoxType.error]: 'border-text-warning text-text-warning bg-bg-warning',
        }[type]
      } rounded-xl items-center h-20 pr-7 text-xs font-medium`}
    >
      {/* left icon */}
      <Twiv css={tw`flex rounded-l-xl h-full pt-5 pl-6 pr-6`}>
        <div>
          <StyledInfoCircle
            className={`h-5 w-5 ${
              {
                [InfoBoxType.info]: 'text-text-accent',
                [InfoBoxType.warning]: 'text-text-warning',
                [InfoBoxType.error]: 'text-text-warning',
              }[type]
            }`}
          />
        </div>
      </Twiv>
      {/* right text */}
      <Twiv css={tw`leading-5`}>{text}</Twiv>
    </div>
  )
}
