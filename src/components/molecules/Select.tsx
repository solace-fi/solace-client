/*************************************************************************************

    Table of Contents:

    import packages
    import context

    StyledSelect
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'
import Select from 'react-select'

/* import context */
import { useGeneral } from '../../context/GeneralProvider'

interface StyledSelectProps {
  value: {
    value: string
    label: string
  }
  onChange: any
  options: {
    value: string
    label: string
  }[]
}

export const StyledSelect: React.FC<StyledSelectProps> = ({ value, onChange, options }) => {
  /*

  hooks

  */
  const { appTheme } = useGeneral()

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      styles={{
        dropdownIndicator: (provided, state) => ({
          ...provided,
          color: 'rgb(250, 250, 250)',
        }),
        singleValue: (provided, state) => ({
          ...provided,
          color: 'rgb(250, 250, 250)',
        }),
        control: (provided, state) => ({
          ...provided,
          backgroundColor: appTheme == 'light' ? 'rgb(95, 93, 249)' : 'rgb(20, 19, 51)',
          color: 'rgb(250, 250, 250)',
          borderColor: 'transparent',
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isFocused
            ? appTheme == 'light'
              ? 'rgb(95, 93, 249)'
              : 'rgb(20, 19, 51)'
            : appTheme == 'light'
            ? 'white'
            : 'rgb(37, 52, 97)',
          color: state.isFocused ? 'rgb(250, 250, 250)' : appTheme == 'light' ? 'rgb(94, 94, 94)' : 'white',
        }),
        menuList: (base) => ({
          ...base,
          // kill the white space on first and last option
          padding: 0,
        }),
      }}
    />
  )
}
