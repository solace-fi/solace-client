import React from 'react'
import useCopyClipboard from '../../hooks/useCopyToClipboard'
import { Button } from '../atoms/Button'
import { StyledCheckmark, StyledCopy } from '../atoms/Icon'

interface CopyProps {
  toCopy: string
}

export const CopyButton: React.FC<CopyProps> = (props) => {
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
