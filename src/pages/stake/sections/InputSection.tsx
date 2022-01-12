import { Clock } from '@styled-icons/bootstrap'
import React from 'react'
import tw from 'twin.macro'
import Twiv from '../components/Twiv'
import { Tab } from '../types/Tab'

export default function InputSection({
  tab,
  value,
  onChange,
  setMax,
}: // ref,
{
  tab: Tab.staking | Tab.unstaking | Tab.locking
  value: string | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setMax: () => void
  // ref: React.RefObject<HTMLInputElement>;
}): JSX.Element {
  return (
    <Twiv css={tw`flex rounded-xl border border-util-separator bg-bg-secondary justify-between lg:justify-start`}>
      {/* icon + text */}
      <Twiv css={tw`hidden lg:flex rounded-l-xl border-r border-util-separator p-5 space-x-1 items-center w-max`}>
        {
          // switch object
          {
            [Tab.staking]: <img src={'/solace-token-gradient.svg'} className="w-5 h-5 pt-px" />,
            [Tab.unstaking]: <img src={'/xsolace-token-gradient.svg'} className="w-5 h-5 pt-px" />,
            [Tab.locking]: <Clock className="w-5 h-5 pt-px" />,
          }[tab]
        }
        <Twiv css={tw`font-semibold text-xs`}>
          {
            {
              [Tab.staking]: 'SOLACE',
              [Tab.unstaking]: 'xSOLACE',
              [Tab.locking]: 'Days',
            }[tab]
          }
        </Twiv>
      </Twiv>
      <input
        type="text"
        className="py-3 lg:py-5 px-5 bg-inherit outline-none rounded-xl border-util-separator lg:border-0 lg:rounded-none"
        placeholder="0 (Max 522.2)"
        value={value}
        onChange={onChange}
        // ref={ref}
      />
      <Twiv css={tw`p-2`}>
        <div
          className="py-2 px-3 lg:px-7 text-base lg:text-lg rounded-xl border border-text-secondary text-text-secondary hover:bg-blue-100 active:bg-blue-200 select-none cursor-pointer duration-150"
          onClick={setMax}
        >
          MAX
        </div>
      </Twiv>
    </Twiv>
  )
}
