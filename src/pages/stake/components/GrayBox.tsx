import React from 'react'
import GrayBgDiv from '../atoms/BodyBgCss'

export default function GrayBox({ children }: { children: React.ReactNode | string }): JSX.Element {
  return (
    <GrayBgDiv
      className="flex text-[#B471E1] rounded-xl items-stretch font-medium mb-8"
      style={{
        height: '64px',
      }}
    >
      <div className="py-3 px-6">{children}</div>
    </GrayBgDiv>
  )
}
