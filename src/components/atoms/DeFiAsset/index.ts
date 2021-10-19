import styled from 'styled-components'
import { GeneralTextProps, GeneralTextCss } from '../Typography'
import { HeightAndWidthProps, HeightAndWidthCss, MarginProps, MarginCss } from '../../generalInterfaces'
import { SecureCircleCss } from '../User'

interface DeFiAssetProps extends HeightAndWidthProps, MarginProps {
  noborder?: boolean
  secured?: boolean
}

export const DeFiAsset = styled.div`
  display: flex;
  align-items: center;
`

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

export const ProtocolTitle = styled.div<GeneralTextProps>`
  ${GeneralTextCss}
  line-height: 19px;
`

export const PositionCardName = styled.div<GeneralTextProps>`
  margin-top: 6px;
  text-align: center;
  ${GeneralTextCss}
`

export const PositionCardText = styled.div<GeneralTextProps>`
  margin-top: 10px;
  line-height: 33px;
  ${GeneralTextCss}
`

export const PositionCardButton = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: 16px;
  width: 100%;
`
