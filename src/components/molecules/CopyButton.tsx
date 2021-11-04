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
import { Button } from '../atoms/Button'
import { StyledCheckmark, StyledCopy } from '../atoms/Icon'

/* import hooks */
import useCopyClipboard from '../../hooks/useCopyToClipboard'

interface CopyProps {
  toCopy: string
}

export const CopyButton: React.FC<CopyProps> = (props) => {
  /*

  hooks

  */
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <Button widthP={100} light onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <>
          <StyledCheckmark size={30} style={{ margin: 'inherit' }} />
          Copied!
        </>
      ) : (
        <>
          <StyledCopy size={30} />
          Copy Address
        </>
      )}
    </Button>
  )
}
