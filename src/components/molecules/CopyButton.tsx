/*************************************************************************************

    Table of Contents:

    import react
    import components
    import hooks

    CopyButton
      hooks

  *************************************************************************************/

/* import packages */
import React, { DOMAttributes } from 'react'

/* import components */
import { Button, ButtonProps } from '../atoms/Button'
import { StyledCheckmark, StyledCopy } from '../atoms/Icon'
import { GeneralElementProps } from '../generalInterfaces'

/* import hooks */
import useCopyClipboard from '../../hooks/internal/useCopyToClipboard'
import { Text } from '../atoms/Typography'

interface CopyProps extends DOMAttributes<HTMLButtonElement> {
  toCopy: string
  objectName?: string
}

export const CopyButton: React.FC<CopyProps & ButtonProps & GeneralElementProps> = (props) => {
  /*

  hooks

  */
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <Button onClick={() => setCopied(props.toCopy)} {...props}>
      {isCopied ? (
        <Text>
          <StyledCheckmark size={20} style={{ margin: 'inherit' }} />
        </Text>
      ) : (
        <Text>
          <StyledCopy size={20} />
          {props.objectName && `Copy ${props.objectName}`}
        </Text>
      )}
      {props.children}
    </Button>
  )
}
