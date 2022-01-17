import React from 'react'
import styled from 'styled-components'
import { Clock } from 'styled-icons/bootstrap'
import Twiv from '../../components/Twiv'
import { Tab } from '../../types/Tab'

function StyledImage({ src, alt, css }: { src: string; alt?: string; css: string }): JSX.Element {
  const Styled = styled.img``
  return <Styled className={css} src={src} alt={alt} />
}

function StyledClock({ css }: { css: string }): JSX.Element {
  const Styled = styled(Clock)``
  return <Styled className={css} />
}

export default function IconAndText({ tab }: { tab: Tab.DEPOSIT | Tab.LOCK | Tab.WITHDRAW }): JSX.Element {
  return (
    <Twiv
      css="hidden lg:flex rounded-l-xl border-r border-[#E3E4E6] p-5 space-x-1 items-center"
      style={{
        flexShrink: '0',
      }}
    >
      {
        // switch object
        {
          [Tab.DEPOSIT]: <StyledImage src="/images/solace-token-gradient.svg" css="w-5 h-5 pt-px" />,
          [Tab.WITHDRAW]: <StyledImage src="/images/xsolace-token-gradient.svg" css="w-5 h-5 pt-px" />,
          [Tab.LOCK]: <StyledClock css="w-5 h-5 pt-px" />,
        }[tab]
      }
      <Twiv css="font-semibold text-xs">
        {
          {
            [Tab.DEPOSIT]: 'SOLACE',
            [Tab.WITHDRAW]: 'xSOLACE',
            [Tab.LOCK]: 'Days',
          }[tab]
        }
      </Twiv>
    </Twiv>
  )
}
