import React from 'react'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'

export const Coverage: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { coverage } = formData

  return (
    <div>
      <div>Coverage</div>
      <Button onClick={() => navigation.previous()}>Prev</Button>
      <Button onClick={() => navigation.next()}>Next</Button>
    </div>
  )
}
