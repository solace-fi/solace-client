import styled from 'styled-components'
import { BKPT_6 } from '../../../constants'

export const GridOrRow = styled.div`
  display: flex;
  gap: 80px;
  align-items: stretch;
  @media screen and (max-width: ${BKPT_6}px) {
    margin-left: auto;
    margin-right: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 22px;
    .items-6 {
      grid-area: 1 / 1 / 3 / 4;
    }
    .items-1 {
      grid-area: 3 / 2 / 4 / 3;
    }
  }
`
