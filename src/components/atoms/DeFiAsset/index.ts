import styled from 'styled-components'
import { GeneralTextProps, GeneralTextCss } from '../Typography'
import { HeightAndWidthProps, HeightAndWidthCss, MarginProps, MarginCss } from '../../generalInterfaces'

interface DeFiAssetProps extends HeightAndWidthProps, MarginProps {
  borderless?: boolean
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
  ${(props) => !props.borderless && `border: 4px solid #fff; border-radius: 100%;`}
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
  font-weight: 600;
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
