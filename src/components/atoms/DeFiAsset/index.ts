import styled from 'styled-components'
import { HeightAndWidthProps, HeightAndWidthCss, MarginProps, MarginCss } from '../../generalInterfaces'
import { SecureCircleCss } from '../User'

interface DeFiAssetProps extends HeightAndWidthProps, MarginProps {
  noborder?: boolean
  secured?: boolean
}

export const DeFiAssetImage = styled.div<DeFiAssetProps>`
  display: flex;
  align-items: center;
  ${HeightAndWidthCss}
  ${(props) => !props.width && 'width: 40px;'}
  ${(props) => !props.height && 'height: 40px;'}
  overflow: hidden;
  ${(props) =>
    !props.noborder ? (props.secured ? SecureCircleCss : `border: 4px solid #fff; border-radius: 100%;`) : null}
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  ${MarginCss}
`
