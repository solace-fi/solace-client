import styled, { css } from 'styled-components'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../../constants'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'

const RadioInputCss = css`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`

export const RadioElement = styled.div`
  border: 1px solid #fff;
  border-radius: 10px;
  padding: 10px 16px;
  text-align: center;
  color: #fff;
  background-color: rgba(0, 0, 0, 0);
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`

export const RadioInput = styled.input`
  ${RadioInputCss}
  &:checked {
    ~ ${RadioElement} {
      color: #7c7c7c;
      background-color: #fff;
    }
  }
`

export const RadioGroup = styled.div<GeneralElementProps>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 40px;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    grid-template-columns: none;
  }

  ${GeneralElementCss}
`

export const RadioLabel = styled.label``

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
  border: 1px solid #fff;
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
        background-color: #fff;
      }
    }
  }
`
