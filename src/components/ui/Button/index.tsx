import React from 'react'
import styled from 'styled-components'

interface props {
  disabled?: boolean
  children?: React.ReactNode
  onClick?: any
}

const ButtonBase = styled.button`
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
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;

  &:hover {
    color: #7c7c7c;
    background-color: #fff;
  }
`

export const Button: React.FC<props> = ({ disabled, children, onClick }) => {
  return (
    <ButtonBase onClick={onClick} disabled={disabled}>
      {children}
    </ButtonBase>
  )
}
