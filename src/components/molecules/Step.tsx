import React from 'react'
import { Step, StepsContainer, StepsWrapper, StepsProgress, StepsProgressBar } from '../../components/atoms/Progress'

interface StyledStepComponentProps {
  stepSections: {
    name: string
    description: string
  }[]
  currentStep: number
}

export const StyledStepComponent: React.FC<StyledStepComponentProps> = ({ stepSections, currentStep }) => {
  return (
    <StepsContainer step={currentStep}>
      <StepsWrapper>
        {stepSections.map((section) => (
          <Step key={section.name}>{section.name}</Step>
        ))}
      </StepsWrapper>
      <StepsProgress>
        <StepsProgressBar></StepsProgressBar>
      </StepsProgress>
    </StepsContainer>
  )
}
