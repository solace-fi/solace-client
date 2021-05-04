import React from 'react'
import styled from 'styled-components'

export const Input = styled.input`
  border: 1px solid #fff;
  outline: none;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 19px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0);
  &:read-only {
    border-color: rgba(0, 0, 0, 0);
  }
`
