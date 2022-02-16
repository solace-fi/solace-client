/*************************************************************************************

    Table of Contents:

    import react
    import components
    import hooks

    CopyButton
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import components */
import { Button, ButtonProps } from '../atoms/Button'
import { StyledCheckmark, StyledCopy } from '../atoms/Icon'

/* import hooks */
import useCopyClipboard from '../../hooks/useCopyToClipboard'

interface CopyProps {
  toCopy: string
  objectName: string
}

export const CopyButton: React.FC<CopyProps & ButtonProps> = (props) => {
  /*

  hooks

  */
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <Button widthP={100} onClick={() => setCopied(props.toCopy)} {...props}>
      {isCopied ? (
        <>
          <StyledCheckmark size={30} style={{ margin: 'inherit' }} />
          Copied!
        </>
      ) : (
        <>
          <StyledCopy size={30} />
          Copy {props.objectName}
        </>
      )}
    </Button>
  )
}
