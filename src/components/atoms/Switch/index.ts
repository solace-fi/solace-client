import styled from 'styled-components'
import { Text4Css } from '../Typography'

export const Switch = styled.div`
  position: relative;
  margin: 10px auto;
  height: 40px;
  width: 90px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
`

export const SwitchRadio = styled.input`
  display: none;
`

export const SwitchSelection = styled.span`
  display: block;
  position: absolute;
  z-index: 1;
  top: 0px;
  left: 0px;
  width: 45px;
  height: 40px;
  background: ${({ theme }) => theme.card.bg_color_1};
  border-radius: 10px;
  transition: left 0.25s ease-out;
`

export const SwitchLabel = styled.label`
  position: relative;
  z-index: 2;
  float: left;
  width: 45px;
  line-height: 36px;
  font-weight: 600;
  color: ${({ theme }) => theme.typography.med_emphasis};
  text-align: center;
  cursor: pointer;
  ${Text4Css}

  ${SwitchRadio}:checked + & {
    transition: 0.15s ease-out;
    color: ${({ theme }) => theme.typography.high_emphasis};
  }
`
