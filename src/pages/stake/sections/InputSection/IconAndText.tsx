import React from 'react'
import styled from 'styled-components'
import { Clock } from 'styled-icons/bootstrap'
import GrayBgDiv from '../../atoms/BodyBgCss'
import Twiv from '../../components/Twiv'
import { Tab } from '../../types/Tab'
import { BKPT_5 } from '../../../../constants'

const StyledImg = styled.img``
function StyledImage({ src, alt, css }: { src: string; alt?: string; css: string }): JSX.Element {
  return <StyledImg className={css} src={src} alt={alt} />
}

const StyledClk = styled(Clock)``
function StyledClock({ css }: { css: string }): JSX.Element {
  return <StyledClk className={css} />
}

const StyledWords = styled.div<{ disabled?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ disabled }) => disabled && '#979797'};
`

const StyledGrayBox = styled(GrayBgDiv)`
  border-color: ${({ theme }) => theme.separator.bg_color};
`

// hidden 1024px:flex rounded-l-xl border-r p-5 space-x-1 items-center
const StyledGenericIconAndText = styled.div<{ disabled?: boolean; displayOnMobile?: boolean; width?: number }>`
  display: hidden;
  @media (min-width: ${({ displayOnMobile }) => (displayOnMobile ? 0 : BKPT_5)}px) {
    display: flex;
    align-items: center;
    border-right: 1px solid ${({ theme }) => theme.separator.bg_color};
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    padding: 20px;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    ${({ width }) => width && `width: ${width}px`};
    color: ${({ disabled, theme }) => (disabled ? '#979797' : theme.typography.contrastText)};
  }
`

export function GenericIconAndText({
  icon,
  text,
  disabled,
  displayOnMobile,
  width,
}: {
  icon: JSX.Element
  text: string
  disabled?: boolean
  displayOnMobile?: boolean
  width?: number
}): JSX.Element {
  return (
    <StyledGenericIconAndText disabled={disabled} displayOnMobile={displayOnMobile} width={width}>
      {icon}
      <div>{text}</div>
    </StyledGenericIconAndText>
  )
}

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
    <StyledGrayBox
      className="hidden lg:flex rounded-l-xl border-r p-5 space-x-1 items-center"
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
    </StyledGrayBox>
  )
}
