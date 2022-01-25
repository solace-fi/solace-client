import styled from 'styled-components'

const Checkbox = styled.input`
  appearance: none;
  border: 1px solid ${({ theme }) => theme.v2.primary};
  border-radius: 5px;
  width: 20px;
  height: 20px;
  padding: 0;
  margin: 0;
  background-color: transparent;
  position: relative;
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.v2.primary};
  }
  &:checked {
    border-color: ${({ theme }) => theme.v2.primary};
  }
  &:checked::after {
    background-color: ${({ theme }) => theme.v2.primary};
    margin: 1px;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    text-align: center;
    /* line-height: 20px; */
    font-size: 6px;
    color: blue;
    /* animate with ease-in-out duration 200ms */
  }
`

export default Checkbox
