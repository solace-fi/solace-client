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
}: {
  children: string | React.ReactNode
  annotation?: string
  importance: 'primary' | 'secondary' | 'tertiary'
  css?: string
}): JSX.Element {
  /**
  secondary:
  <Twiv css={`font-semibold mt-2 leading`}>
    <Twiv css={`text-base">522.2</div> <span className="text-sm">SOLACE</spa`}>
  </div> */
  const BaseDiv = styled.div`
    font-weight: 600;
  `
  const amongFirstTwo = isOneOf(importance, ['primary', 'secondary'])
  const isPrimary = importance === 'primary'
  const mainTextSize = amongFirstTwo ? `text-base` : `text-sm`
  const mainTextColor = isPrimary ? `text-[#5F5DF9]` : ''
  const firstInterpolation = [mainTextSize, mainTextColor] as string[]

  /*
          css={`
            inline
            ${amongFirstTwo ? 'text-sm' : 'text-xs'}
            ${isPrimary ? ' text-text-accent' : ''}
          `} */
  const annotationTextSize = amongFirstTwo ? `text-sm` : `text-xs`
  const annotationTextColor = isPrimary ? `text-[#5F5DF9]` : ''
  const secondInterpolation = [annotationTextSize, annotationTextColor] as string[]
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
