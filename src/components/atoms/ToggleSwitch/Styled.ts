import styled from 'styled-components'

export const SwitchInput = styled.input`
  height: 0;
  width: 0;
  visibility: hidden;
`

const ifUndefined = <T>(value: T | undefined, defaultValue: T): T => (value === undefined ? defaultValue : value)

export const SwitchLabel = styled.label<{
  checked: boolean
  width?: number
  height?: number
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: ${({ width }) => `${ifUndefined(width, 44)}px`};
  height: ${({ height }) => `${ifUndefined(height, 22)}px`};
  border-radius: 100px;
  /* border: 2px solid ${({ theme }) => theme.typography.infoText}; */
  position: relative;
  transition: background-color 0.2s;
  background-color: ${({ theme, checked }) => (checked ? theme.typography.infoText : theme.separator.bg_color)};
`

export const SwitchButton = styled.span<{ buttonSize?: number }>`
  content: '';
  position: absolute;
  left: 2px;
  width: ${({ buttonSize }) => `${ifUndefined(buttonSize, 18)}px`};
  height: ${({ buttonSize }) => `${ifUndefined(buttonSize, 18)}px`};
  border-radius: 45px;
  transition: 0.2s;
  background: ${({ theme }) => theme.body.bg_color};
  box-shadow: 0 0 2px 0 rgba(10, 10, 10, 0.29);
  ${SwitchInput}:checked + ${SwitchLabel} & {
    left: calc(100% - 2px);
    transform: translateX(-100%);
  }

  ${SwitchLabel}:active & {
    width: ${({ buttonSize }) => `${ifUndefined(buttonSize, 18) * 1.25}px`};
  }
`
