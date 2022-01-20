import styled from 'styled-components'
import { GeneralTextCss } from '../../../../components/atoms/Typography'
import { BKPT_5 } from '../../../../constants'

export default styled.div`
  /* flex rounded-xl border border-[#E3E4E6] bg-[#fafafa] justify-between lg:justify-start */
  display: flex;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.input.bg_color};
  border: 1px solid ${({ theme }) => theme.input.border_color};
  outline: none;
  justify-content: space-between;
  width: 300px;
  /* for screens bigger than BKPT_5 */
  @media (min-width: ${BKPT_5}px) {
    width: 521px;
  }
  ${GeneralTextCss}
`
