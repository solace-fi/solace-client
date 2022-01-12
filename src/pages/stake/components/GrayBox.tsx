import React from 'react'
import tw from 'twin.macro'
import Twiv from './Twiv'

export default function GrayBox({ children }: { children: React.ReactNode | string }): JSX.Element {
  return (
    <Twiv css={tw`flex bg-bg-secondary text-text-purple rounded-xl items-stretch py-3 px-6 font-medium mb-8 h-[72px]`}>
      {children}
    </Twiv>
  )
}
