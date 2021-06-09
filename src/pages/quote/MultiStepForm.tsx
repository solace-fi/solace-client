import React from 'react'
import { SetForm, useForm, useStep } from 'react-hooks-helper'
import { Protocol } from './Protocol'
import { Position } from './Position'
import { Coverage } from './Coverage'
import { Confirm } from './Confirm'

interface useStepType {
  step: any
  navigation: any
}

export interface formProps {
  formData: any
  setForm: SetForm
  navigation: any
}

const defaultData = {
  protocol: '',
  position: '',
  coverage: '',
}

enum StepNumber {
  'protocol' = 0,
  'position' = 1,
  'coverage' = 2,
  'confirm' = 3,
}

const steps = [{ id: 'protocol' }, { id: 'position' }, { id: 'coverage' }, { id: 'confirm' }]

export const MultiStepForm = () => {
  const [formData, setForm] = useForm(defaultData)
  const { step, navigation }: useStepType = useStep({
    steps,
    initialStep: 0,
  })

  const props = { formData, setForm, navigation }

  const getForm = () => {
    switch (step.id) {
      case 'protocol':
        return <Protocol {...props} />
      case 'position':
        return <Position {...props} />
      case 'coverage':
        return <Coverage {...props} />
      default:
        return <Confirm {...props} />
    }
  }

  return (
    <div>
      <div>{StepNumber[step.id]}</div>
      <div>{getForm()}</div>
    </div>
  )
}
