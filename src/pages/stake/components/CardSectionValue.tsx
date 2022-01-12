import tw, { TwStyle } from 'twin.macro'
import React from 'react'
import styled from 'styled-components'
import Twan from './Twan'

function isOneOf<T>(value: T, list: T[]) {
  return list.indexOf(value) > -1
}

// secondary CardSectionValue is just `font-medium mt-2`
export default function CardSectionValue({
  children,
  annotation,
  importance,
  css,
}: {
  children: string | React.ReactNode
  annotation?: string
  importance: 'primary' | 'secondary' | 'tertiary'
  css?: TwStyle
}): JSX.Element {
  /**
  secondary:
  <Twiv css={tw`font-semibold mt-2 leading`}>
    <Twiv css={tw`text-base">522.2</div> <span className="text-sm">SOLACE</spa`}>
  </div> */
  const BaseDiv = styled.div`
    ${tw`font-semibold`}
    ${css ?? ''}
  `
  const amongFirstTwo = isOneOf(importance, ['primary', 'secondary'])
  const isPrimary = importance === 'primary'
  const mainTextSize = amongFirstTwo ? tw`text-base` : tw`text-sm`
  const mainTextColor = isPrimary ? tw`text-[#5F5DF9]` : ''
  const firstInterpolation = [mainTextSize, mainTextColor] as TwStyle[]

  /*
          css={tw`
            inline
            ${amongFirstTwo ? 'text-sm' : 'text-xs'}
            ${isPrimary ? ' text-text-accent' : ''}
          `} */
  const annotationTextSize = amongFirstTwo ? tw`text-sm` : tw`text-xs`
  const annotationTextColor = isPrimary ? tw`text-[#5F5DF9]` : ''
  const secondInterpolation = [annotationTextSize, annotationTextColor] as TwStyle[]
  // const secondInterpolation = `${annotationTextSize} ${annotationTextColor}`

  return (
    <BaseDiv>
      <Twan css={firstInterpolation}>{children}</Twan>{' '}
      {annotation && (
        <>
          <Twan css={secondInterpolation}>{annotation}</Twan>
          {/* <span>{annotation}</span> */}
        </>
      )}
    </BaseDiv>
  )
}
