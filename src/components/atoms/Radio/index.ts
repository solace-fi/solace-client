import styled, { css } from 'styled-components'
import { BKPT_3 } from '../../../constants'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'

const RadioInputCss = css`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`

export const RadioLabel = styled.div`
  border: 1px solid ${({ theme }) => theme.radio.circle_color};
  border-radius: 10px;
  padding: 10px 16px;
  text-align: center;
  color: ${(props) => props.theme.radio.circle_color};
  background-color: rgba(0, 0, 0, 0);
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`

export const RadioInput = styled.input`
  ${RadioInputCss}
  &:checked {
    ~ ${RadioLabel} {
      color: ${({ theme }) => theme.radio.checked_color};
      background-color: ${({ theme }) => theme.radio.checked_bg_color};
    }
  }
`

export const RadioGroup = styled.div<GeneralElementProps>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 40px;

  @media screen and (max-width: ${BKPT_3}px) {
    grid-template-columns: none;
  }

  ${GeneralElementCss}
`

export const RadioElement = styled.label``

export const RadioCircle = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`

export const RadioCircleFigure = styled.div`
  margin-right: 5px;
  padding: 3px;
  width: 20px;
  height: 20px;
  border-radius: 100%;
  border: 1px solid ${(props) => props.theme.radio.circle_color};
`

export const RadioCircleInput = styled.input`
  ${RadioInputCss}
  &:checked {
    ~ ${RadioCircleFigure} {
      &::before {
        content: '';
        display: flex;
        border-radius: 100%;
        width: 100%;
        height: 100%;
        background-color: ${(props) => props.theme.radio.checked_circle_color};
      }
    }
  }
`
