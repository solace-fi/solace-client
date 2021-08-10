import styled from 'styled-components'
import { MAX_TABLET_SCREEN_WIDTH } from '../../../constants'
import { FlexCol } from '../Layout'

interface ProgressProps {
  step: number
}

export const StepsContainer = styled(FlexCol)<ProgressProps>`
  ${(props) =>
    props.step === 2 &&
    `
  ${Step} {
    &:nth-child(2) {
      opacity: 1;
    }
  }

  ${StepsProgressBar} {
    width: 50%;
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
    width: 75%;
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
    width: 100%;
  }
  `}

  padding: 10px;
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

  &::after {
    position: absolute;
    bottom: 0;
    left: 100%;
    content: '';
    border-radius: 1px;
    width: 1px;
    height: 10px;
    background-color: #fff;
  }

  &:last-child {
    &::after {
      position: absolute;
      bottom: 0;
      left: 100%;
      content: '';
      border-radius: 1px;
      width: 1px;
      height: 10px;
      background-color: #fff;
    }
  }
`

export const StepsProgress = styled.div`
  margin-top: 6px;
  border-radius: 10px;
  padding: 3px;
  width: 100%;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.3);
`

export const StepsProgressBar = styled.div`
  border-radius: 10px;
  height: 100%;
  width: 25%;
  background-color: #fff;
  transition: width 300ms linear;
`
