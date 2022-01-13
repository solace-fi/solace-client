import { Clock } from '@styled-icons/bootstrap'
import React from 'react'
import styled from 'styled-components'
import Twiv from '../components/Twiv'
import { Tab } from '../types/Tab'

function StyledImage({ src, alt, css }: { src: string; alt?: string; css: string }): JSX.Element {
  const Styled = styled.img`
    /* ${css} */
  `
  return <Styled className={css} src={src} alt={alt} />
}

function StyledClock({ css }: { css: string }): JSX.Element {
  const Styled = styled(Clock)`
    /* ${css} */
  `
  return <Styled className={css} />
}

function StyledInput({
  value,
  placeholder,
  onChange,
  css,
  type,
}: {
  value: string | undefined
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  css: string
  type: string
}): JSX.Element {
  const Styled = styled.input`
    background-color: inherit;
    /* ${css} */
  `
  return <Styled className={css} type={type} value={value} placeholder={placeholder} onChange={onChange} />
}

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
    <Twiv css={`flex rounded-xl border border-[#E3E4E6] bg-[#fafafa] justify-between lg:justify-start`}>
      {/* icon + text */}
      <Twiv css={`hidden lg:flex rounded-l-xl border-r border-[#E3E4E6] p-5 space-x-1 items-center w-max`}>
        {
          // switch object
          {
            [Tab.staking]: <StyledImage src={'/images/solace-token-gradient.svg'} css={`w-5 h-5 pt-px`} />,
            [Tab.unstaking]: <StyledImage src={'/images/xsolace-token-gradient.svg'} css={`w-5 h-5 pt-px`} />,
            [Tab.locking]: <StyledClock css={`w-5 h-5 pt-px`} />,
          }[tab]
        }
        <Twiv css={`font-semibold text-xs`}>
          {
            {
              [Tab.staking]: 'SOLACE',
              [Tab.unstaking]: 'xSOLACE',
              [Tab.locking]: 'Days',
            }[tab]
          }
        </Twiv>
      </Twiv>
      <StyledInput
        type="text"
        css={`py-3 lg:py-5 px-5 outline-none rounded-xl border-[#E3E4E6] lg:border-0 lg:rounded-none`}
        placeholder="0 (Max 522.2)"
        value={value}
        onChange={onChange}
        // ref={ref}
      />
      <Twiv css={`p-2`}>
        <Twiv
          css={`py-2 px-3 lg:px-7 text-base lg:text-lg rounded-xl border border-[#5E5E5E] text-[#5E5E5E] hover:bg-blue-100 active:bg-blue-200 select-none cursor-pointer duration-150`}
          onClick={setMax}
        >
          MAX
        </Twiv>
      </Twiv>
    </Twiv>
  )
}
