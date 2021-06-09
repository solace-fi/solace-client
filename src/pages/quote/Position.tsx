import React from 'react'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'

export const Position: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { position } = formData

  return (
    <div>
      <div>Position</div>
      <Button onClick={() => navigation.previous()}>Prev</Button>
      <Button onClick={() => navigation.next()}>Next</Button>
    </div>
  )
}
