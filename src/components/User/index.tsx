import styled, { css } from 'styled-components'
import { GenericProps, handleGenericProps } from '../interfaces'

export const User = styled.div`
  display: grid;
  align-content: center;
  grid-template-columns: 34px 1fr;
  grid-template-rows: auto auto;
  gap: 4px 10px;
`

export const UserImage = styled.div<GenericProps>`
  ${() => handleGenericProps()}
  grid-column: 1/2;
  grid-row: 1/3;
  width: 30px;
  height: 30px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const UserBase = css`
  display: grid;
  grid-column: 2/3;
  min-width: 0;
  line-height: 1.4;
  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const UserName = styled.div`
  ${UserBase}
  grid-row: 2/3;
  align-items: start;
  font-size: 10px;
`

export const UserWallet = styled.div`
  ${UserBase}
  grid-row: 1/2;
  align-items: end;
  font-weight: 600;
  font-size: 12px;
`
