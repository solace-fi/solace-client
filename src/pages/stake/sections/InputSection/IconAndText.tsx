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

const StyledWords = styled.div<{ disabled?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ disabled }) => disabled && '#979797'};
`
export default function IconAndText({
  tab,
  disabled,
}: {
  tab: Tab.DEPOSIT | Tab.LOCK | Tab.WITHDRAW
  disabled?: boolean
}): JSX.Element {
  const className = 'w-5 h-5 pt-px'
  const disabledClassName = 'w-5 h-5 pt-px opacity-50'
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
          [Tab.DEPOSIT]: (
            <StyledImage src="/images/solace-token-gradient.svg" css={disabled ? disabledClassName : className} />
          ),
          [Tab.WITHDRAW]: (
            <StyledImage src="/images/solace-token-gradient.svg" css={disabled ? disabledClassName : className} />
          ),
          [Tab.LOCK]: <StyledClock css={disabled ? disabledClassName : className} />,
        }[tab]
      }
      <StyledWords disabled={disabled}>
        {
          {
            [Tab.DEPOSIT]: 'SOLACE',
            [Tab.WITHDRAW]: 'SOLACE',
            [Tab.LOCK]: 'Days',
          }[tab]
        }
      </StyledWords>
    </Twiv>
  )
}
