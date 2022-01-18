import React from 'react'
import Twiv from '../../components/Twiv'

export default function MaxButton({ setMax }: { setMax: () => void }): JSX.Element {
  return (
    <Twiv css="p-2">
      <Twiv
        css="py-2 px-3 lg:px-7 text-base lg:text-lg rounded-xl border border-[#5E5E5E] text-[#5E5E5E] hover:bg-blue-100 active:bg-blue-200 select-none cursor-pointer duration-150"
        onClick={setMax}
      >
        MAX
      </Twiv>
    </Twiv>
  )
}