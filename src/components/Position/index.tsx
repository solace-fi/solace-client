import styled from 'styled-components'

export const PositionCardLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const PositionCardName = styled.div`
  margin-top: 6px;
  font-weight: 600;
  text-align: center;
`

export const PositionCardCount = styled.div`
  margin-top: 10px;
  font-size: 24px;
  line-height: 33px;
`

export const PositionCardButton = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: 16px;
`
