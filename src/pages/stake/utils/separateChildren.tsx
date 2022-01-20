import React, { Fragment } from 'react'
import { VerticalSeparator } from '../components/VerticalSeparator'

export default function separateChildren(children: React.ReactNode[]): JSX.Element[] {
  const len = children.length
  return children.map((child, i) => {
    return (
      <Fragment key={i}>
        {child}
        {i !== len - 1 && <VerticalSeparator />}
      </Fragment>
    )
  })
}
