import styled from 'styled-components'
import { InputBase } from './index'

export const ActionRadios = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-auto-flow: column;
  justify-content: end;
  gap: 24px;
  flex-grow: 1;
`

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
  ${InputBase}
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
