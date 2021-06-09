import styled from 'styled-components'
import { Text3 } from '../Text'

export const Protocol = styled.div`
  display: flex;
  align-items: center;
`

export const ProtocolImage = styled.div`
  border-radius: 100%;
  margin-right: 10px;
  display: flex;
  align-items: flex-start;
  width: 42px;
  height: 42px;
  overflow: hidden;
  border: 4px solid #fff;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const ProtocolTitle = styled.div`
  ${Text3}
  line-height: 19px;
`
