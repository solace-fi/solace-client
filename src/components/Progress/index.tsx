import React from 'react'
import styled, { css } from 'styled-components'

interface props {
  step: number
}

export const StepsContainer = styled.div<props>`
  display: flex;
  flex-direction: column;

  ${(props) =>
    props.step === 2 &&
    `
  ${Step} {
    &:nth-child(2) {
      opacity: 1;
    }
  }

  ${StepsProgressBar} {
    width: 37.5%;
  }
  `}
  ${(props) =>
    props.step === 3 &&
    `
  ${Step} {
    &:nth-child(2),
    &:nth-child(3) {
      opacity: 1;
    }
  }

  ${StepsProgressBar} {
    width: 62.5%;
  }
  `}
  ${(props) =>
    props.step === 4 &&
    `
  ${Step} {
    &:nth-child(2),
    &:nth-child(3),
    &:nth-child(4) {
      opacity: 1;
    }
  }

  ${StepsProgressBar} {
    width: 87.5%;
  }
  `}
`

export const StepsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
`

export const Step = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  width: 25%;
  padding: 8px 16px 16px;
  opacity: 0.5;
  text-align: center;

  &:first-child {
    opacity: 1;
  }

  &::before {
    position: absolute;
    bottom: 0;
    left: 50%;
    content: '';
    border-radius: 1px;
    width: 1px;
    height: 10px;
    background-color: #fff;
  }
`

export const StepsProgress = styled.div`
  margin-top: 6px;
  border-radius: 10px;
  padding: 3px;
  width: 100%;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.3);
`

export const StepsProgressBar = styled.div`
  border-radius: 10px;
  height: 100%;
  width: 12.5%;
  background-color: #fff;
  transition: width 300ms linear;
`
