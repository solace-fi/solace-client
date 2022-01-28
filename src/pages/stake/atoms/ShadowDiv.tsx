import styled, { css } from 'styled-components'

export default styled.div<{
  stretch?: boolean
}>`
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  ${(props) =>
    props.stretch &&
    css`
      display: flex;
      /* align-items: stretch; */
      flex-direction: column;
      /* flex: 1; */
      & > * {
        height: 100%;
        /* flex: 1; */
        display: flex;
        flex-direction: column;
    `}
`
