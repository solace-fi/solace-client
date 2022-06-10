import { css } from 'styled-components'
import Theme from '../../../styles/themes'

export const ThinScrollbarCss = css`
  ::-webkit-scrollbar {
    width: 0.5em;
  }
  ::-webkit-scrollbar-track {
    background-color: ${({ theme }) => (theme as Theme).separator.bg_color};
  }
  ::-webkit-scrollbar-thumb {
    height: 2em;
    background-image: linear-gradient(
      to bottom right,
      ${({ theme }) => (theme as Theme).typography.warmGradientA},
      ${({ theme }) => (theme as Theme).typography.warmGradientB}
    );
  }
`
