import styled from 'styled-components'
import { BKPT_5 } from '../../../constants'

export const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 30px;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  width: 300px;
  /* for screens bigger than BKPT_5 */
  @media (min-width: ${BKPT_5}px) {
    width: 521px;
  }
`
