import styled from 'styled-components'
import { Box as RebassBox } from 'rebass/styled-components'
import { TextProps, handleTextProps } from '../Text'

interface BoxProps {
  purple?: boolean
}

const BoxBase = styled(RebassBox)<{ width?: string; padding?: string; border?: string; borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`

export default BoxBase

export const BoxRow = styled(BoxBase)`
  display: grid;
  grid-auto-flow: column;
  gap: 24px;
`

export const Box = styled(BoxRow)<BoxProps>`
  align-items: center;
  border-radius: 10px;
  padding: 24px;
  background-color: ${(props) => (props.purple ? 'rgba(250, 0, 255, 0.3)' : 'rgba(0, 255, 209, 0.3)')};
`

export const BoxItem = styled.div``

export const BoxItemTitle = styled.div<TextProps>`
  ${(props) => handleTextProps(props)}
  margin-bottom: 4px;
`

export const BoxItemValue = styled.div<TextProps>`
  ${(props) => handleTextProps(props)}
`

export const BoxItemUnits = styled.span<TextProps>`
  ${(props) => handleTextProps(props)}
`
