import styled, { css } from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'

interface UserImageProps {
  secureCircle?: boolean
}

export const SecureCircleCss = css`
  border: 4px solid;
  border-radius: 100%;
  border-color: rgba(243, 211, 126, 1) rgba(240, 77, 66, 1) rgba(240, 77, 66, 1) rgba(243, 211, 126, 1);
  filter: drop-shadow(0px 0px 22px rgba(255, 255, 255, 0.3)) drop-shadow(0px 0px 100px rgba(255, 255, 255, 0.3));
`

export const UserImage = styled.div<GeneralElementProps & UserImageProps>`
  width: 30px;
  height: 30px;
  ${(props) => props.secureCircle && SecureCircleCss}
  img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  ${GeneralElementCss}
`
