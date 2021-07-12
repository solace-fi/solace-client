import styled from 'styled-components'
import { TextFontCss, TextFontProps } from '../Text'
import { HeightAndWidthProps, HeightAndWidthCss, MarginProps, MarginCss } from '../generalInterfaces'

export const Protocol = styled.div`
  display: flex;
  align-items: center;
`

export const ProtocolImage = styled.div<HeightAndWidthProps & MarginProps>`
  border-radius: 100%;
  display: flex;
  align-items: flex-start;
  ${HeightAndWidthCss}
  ${(props) => !props.width && 'width: 42px;'}
  ${(props) => !props.height && 'height: 42px;'}
  overflow: hidden;
  border: 4px solid #fff;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  ${MarginCss}
`

export const ProtocolTitle = styled.div<TextFontProps>`
  ${TextFontCss}
  line-height: 19px;
`
