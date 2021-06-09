import React from 'react'
import { Button } from '../../components/Button'
import { formProps } from './MultiStepForm'

export const Protocol: React.FC<formProps> = ({ formData, setForm, navigation }) => {
  const { protocol } = formData

  /*
  setForm({
    target: {
      name: 'protocol', // form element
      value: result // the data/url
    }
  })
  */

  return (
    <div>
      <div>Protocol</div>
      <Button onClick={() => navigation.next()}>Next</Button>
    </div>
  )
}
