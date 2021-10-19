import styled from 'styled-components'
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
      color: ${props.theme.progress.step_completed_color};
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
      color: ${props.theme.progress.step_completed_color};
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
      color: ${props.theme.progress.step_completed_color};
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
  font-weight: 600;
  display: flex;
  justify-content: center;
  width: 25%;
  padding: 8px 16px 16px;
  color: ${({ theme }) => theme.progress.step_color};
  opacity: 0.5;
  text-align: center;

  &:first-child {
    color: ${({ theme }) => theme.progress.step_completed_color};
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
    background-color: ${({ theme }) => theme.progress.step_completed_color};
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
      background-color: ${({ theme }) => theme.progress.step_completed_color};
    }
  }
`

export const StepsProgress = styled.div`
  margin-top: 6px;
  border-radius: 10px;
  padding: 3px;
  width: 100%;
  height: 5px;
  background-color: ${({ theme }) => theme.progress.progress_bg_color};
`

export const StepsProgressBar = styled.div`
  border-radius: 10px;
  height: 100%;
  width: 25%;
  background-color: ${({ theme }) => theme.progress.bar_bg_color};
  transition: width 300ms linear;
`
