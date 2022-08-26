import React from 'react'
import styled from 'styled-components'
import { Clock } from '@styled-icons/bootstrap/Clock'
import { GrayBgDiv } from '../atoms/Layout'
import { Tab } from '../../constants/enums'
import { BKPT_5 } from '../../constants'

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

export const GenericIconAndText = ({
  icon,
  text,
  disabled,
  displayOnMobile,
  width,
}: {
  icon: JSX.Element
  text?: string
  disabled?: boolean
  displayOnMobile?: boolean
  width?: number
}): JSX.Element => {
  return (
    <StyledGenericIconAndText disabled={disabled} displayOnMobile={displayOnMobile} width={width}>
      {icon}
      {text && <div>{text}</div>}
    </StyledGenericIconAndText>
  )
}

export const IconAndText = ({
  tab,
  disabled,
}: {
  tab: Tab.DEPOSIT | Tab.LOCK | Tab.WITHDRAW
  disabled?: boolean
}): JSX.Element => {
  const className = 'w-5 h-5 pt-px'
  const disabledClassName = 'w-5 h-5 pt-px opacity-50'
  return (
    <StyledGrayBox
      className="hidden lg:flex rounded-l-xl border-r p-5 space-x-1 items-center"
      style={{
        flexShrink: '0',
        gap: '4px',
      }}
    >
      {
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
      <StyledWords
        disabled={disabled}
        style={{
          marginTop: '2px',
        }}
      >
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
