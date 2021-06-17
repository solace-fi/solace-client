import React from 'react'
import styled, { css } from 'styled-components'

interface props {
  disabled?: boolean
  children?: React.ReactNode
  onClick?: any
  secondary?: boolean
  hidden?: boolean
}

export const ButtonBaseCss = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: 1px solid #fff;
  border-radius: 10px;
  padding: 4px 16px;
  min-width: 90px;
  min-height: 34px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  transition: all 0.2s, color 0.2s;
  cursor: pointer;
`

const ButtonBase = styled.button<props>`
  ${ButtonBaseCss}
  ${() => handleButtonProps()}
`

export const handleButtonProps = (): any => {
  return css<props>`
    visibility: ${(props) => (props.hidden ? 'hidden;' : 'visible;')};
    ${(props) =>
      props.disabled
        ? 'color: #fff; background-color: rgba(0, 0, 0, 0); opacity: 0.5; transform: scale(.9);'
        : props.secondary
        ? 'color: #7c7c7c; background-color: #fff; &:hover { opacity: 0.8; }'
        : 'color: #fff; background-color: rgba(0, 0, 0, 0); &:hover { color: #7c7c7c; background-color: #fff; }'};
  `
}

export const Button: React.FC<props> = ({ onClick, disabled, secondary, hidden, children }) => {
  return (
    <ButtonBase onClick={onClick} disabled={disabled} secondary={secondary} hidden={hidden}>
      {children}
    </ButtonBase>
  )
}
