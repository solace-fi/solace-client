import styled from 'styled-components'

export const BodyBgInput = styled.input`
  background-color: ${(props) => props.theme.body.bg_color};
`

// both of these are the same
export const BodyBgDiv = styled.div`
  background-color: ${(props) => props.theme.body.bg_color};
`
export default styled.div`
  background-color: ${(props) => props.theme.body.bg_color};
`
