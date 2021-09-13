import React from 'react'
import Select from 'react-select'
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
  const { appTheme } = useGeneral()

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      styles={{
        singleValue: (provided, state) => ({
          ...provided,
          color: appTheme == 'light' ? 'black' : 'white',
        }),
        control: (provided, state) => ({
          ...provided,
          backgroundColor: appTheme == 'light' ? 'white' : 'rgb(37, 52, 97)',
          color: 'white',
          borderColor: 'transparent',
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isFocused
            ? appTheme == 'light'
              ? 'white'
              : 'rgba(11,12,15, 1)'
            : appTheme == 'light'
            ? 'white'
            : 'rgba(20, 22, 30, 1)',
          color: state.isFocused
            ? appTheme == 'light'
              ? '#3a2d40'
              : '#00ffd1'
            : appTheme == 'light'
            ? '#7c7c7c'
            : 'white',
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
