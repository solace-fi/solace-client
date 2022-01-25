import styled from 'styled-components'

export const Separator = styled.div<{
  horizontal?: boolean
  theme: any
}>`
  ${(props) => (props.horizontal ? 'height' : 'width')}: 1px;
  background-color: ${({ theme }) => theme.separator.bg_color};
`

// export HorizontalSeparator and VerticalSeparator by passing the horizontal or vertical props to the Separator component
export const HorizontalSeparator = styled(Separator).attrs({
  horizontal: true,
})``

export const VerticalSeparator = styled(Separator).attrs({
  vertical: true,
})``
