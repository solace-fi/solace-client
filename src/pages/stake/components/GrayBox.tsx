import React from 'react'

import Twiv from './Twiv'

export default function GrayBox({ children }: { children: React.ReactNode | string }): JSX.Element {
  return (
    <Twiv
      css="flex bg-[#fafafa] text-[#B471E1] rounded-xl items-stretch font-medium mb-8"
      style={{
        height: '64px',
      }}
    >
      <div className="py-3 px-6">{children}</div>
    </Twiv>
  )
}
