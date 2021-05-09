import React from 'react'
import styled from 'styled-components'

export const RadioElement = styled.div`
  border: 1px solid #fff;
  border-radius: 10px;
  padding: 10px 16px;
  text-align: center;
  color: #fff;
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: rgba(#fff, 0.2);
  }
`
export const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
  &:checked {
    ~ ${RadioElement} {
      color: #7c7c7c;
      background-color: #fff;
    }
  }
`

export const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-top: 40px;
`

export const RadioLabel = styled.label``
