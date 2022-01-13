import React from 'react'
import styled from 'styled-components'
import { InfoCircle } from 'styled-icons/bootstrap'
import { InfoBoxType } from '../types/InfoBoxType'
import Twiv from './Twiv'

// const StyledInfoCircle = styled(InfoCircle)<{ css: string }>`
//   ${(css) => css}/* color: red; */
// `

function StyledInfoCircle({ css }: { css: string[] }): JSX.Element {
  const Styled = styled(InfoCircle)`
    ${css}
  `
  return <Styled />
}

export default function InformationBox({ type, text }: { type: InfoBoxType; text: string }): JSX.Element {
  return (
    <Twiv
      css={[
        `flex border`,
        {
          [InfoBoxType.info]: `border-[#5F5DF9] bg-[#F7F7FF] text-[#5F5DF9]`,
          [InfoBoxType.warning]: `border-[#F04D42] text-[#F04D42] bg-[#FEF6F5]`,
          [InfoBoxType.error]: `border-[#F04D42] text-[#F04D42] bg-[#FEF6F5]`,
        }[type],
        `rounded-xl items-center h-20 pr-7 text-xs font-medium`,
      ]}
    >
      {/* left icon */}
      <Twiv css={`flex rounded-l-xl h-full pt-5 pl-6 pr-6`}>
        <Twiv>
          <StyledInfoCircle
            css={[
              `h-5 w-5`,
              {
                [InfoBoxType.info]: `text-[#5F5DF9]`,
                [InfoBoxType.warning]: `text-[#F04D42]`,
                [InfoBoxType.error]: `text-[#F04D42]`,
              }[type],
            ]}
          />
        </Twiv>
      </Twiv>
      {/* right text */}
      <Twiv css={`leading-5`}>{text}</Twiv>
    </Twiv>
  )
}
