import React from 'react'
import { LoadingIcon } from '.'
import { HeightAndWidthProps } from '../generalInterfaces'

export const Loader: React.FC<HeightAndWidthProps> = ({ width, height }) => {
  return <LoadingIcon width={width} height={height} />
}
