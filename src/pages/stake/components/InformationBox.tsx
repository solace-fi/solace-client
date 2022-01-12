import React from 'react'
import styled from 'styled-components'
import { InfoCircle } from 'styled-icons/bootstrap'
import tw, { TwStyle } from 'twin.macro'
import { InfoBoxType } from '../types/InfoBoxType'
import Twiv from './Twiv'

// const StyledInfoCircle = styled(InfoCircle)<{ css: TwStyle }>`
//   ${(css) => css}/* color: red; */
// `

function StyledInfoCircle({ css }: { css: TwStyle[] }): JSX.Element {
  const Styled = styled(InfoCircle)`
    ${css}
  `
  return <Styled />
}

export default function InformationBox({ type, text }: { type: InfoBoxType; text: string }): JSX.Element {
  return (
    <Twiv
      css={[
        tw`flex border`,
        {
          [InfoBoxType.info]: tw`border-[#5F5DF9] bg-[#F7F7FF] text-[#5F5DF9]`,
          [InfoBoxType.warning]: tw`border-[#F04D42] text-[#F04D42] bg-[#FEF6F5]`,
          [InfoBoxType.error]: tw`border-[#F04D42] text-[#F04D42] bg-[#FEF6F5]`,
        }[type],
        tw`rounded-xl items-center h-20 pr-7 text-xs font-medium`,
      ]}
    >
      {/* left icon */}
      <Twiv css={tw`flex rounded-l-xl h-full pt-5 pl-6 pr-6`}>
        <Twiv>
          <StyledInfoCircle
            css={[
              tw`h-5 w-5`,
              {
                [InfoBoxType.info]: tw`text-[#5F5DF9]`,
                [InfoBoxType.warning]: tw`text-[#F04D42]`,
                [InfoBoxType.error]: tw`text-[#F04D42]`,
              }[type],
            ]}
          />
        </Twiv>
      </Twiv>
      {/* right text */}
      <Twiv css={tw`leading-5`}>{text}</Twiv>
    </Twiv>
  )
}
