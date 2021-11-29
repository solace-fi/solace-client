/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import components

    GasRadioGroup

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import constants */
import { GasFeeListState, GasFeeOption } from '../../constants/types'

/* import components */
import { GeneralElementProps } from '../generalInterfaces'
import { Card } from '../atoms/Card'
import { RadioGroup, RadioElement, RadioInput, RadioLabel } from '../atoms/Radio'
import { Loader } from '../atoms/Loader'

interface GasRadioGroupProps {
  gasPrices: GasFeeListState
  selectedGasOption: GasFeeOption | undefined
  handleSelectGasChange: (option: GasFeeOption) => void
}

export const GasRadioGroup: React.FC<GasRadioGroupProps & GeneralElementProps> = ({
  gasPrices,
  selectedGasOption,
  handleSelectGasChange,
  ...props
}) => (
  <Card {...props}>
    <RadioGroup m={0}>
      {!gasPrices.loading ? (
        gasPrices.options.map((option: GasFeeOption) => (
          <RadioElement key={option.key}>
            <RadioInput
              type="radio"
              value={option.value}
              checked={selectedGasOption == option}
              onChange={() => handleSelectGasChange(option)}
            />
            <RadioLabel>
              <div>{option.name}</div>
              <div>{option.value}</div>
            </RadioLabel>
          </RadioElement>
        ))
      ) : (
        <Loader />
      )}
    </RadioGroup>
  </Card>
)
