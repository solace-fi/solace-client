import React from 'react'
import { Loader } from '../atoms/Loader'
import { GeneralTextProps, Text } from '../atoms/Typography'

export const LoaderText: React.FC<
  { text?: string; loaderWidth?: number; loaderHeight?: number } & GeneralTextProps
> = ({ text, loaderWidth, loaderHeight, ...props }): JSX.Element => {
  return (
    <div style={{ position: 'relative' }}>
      <Loader width={loaderWidth} height={loaderHeight} />
      {text && (
        <Text
          textAlignCenter
          autoAlignVertical
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          {...props}
        >
          {text}
        </Text>
      )}
    </div>
  )
}
