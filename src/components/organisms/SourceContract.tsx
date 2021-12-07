/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import utils

    SourceContract
      hooks

  *************************************************************************************/

/* import packages */
import React from 'react'
import { Contract } from '@ethersproject/contracts'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { ExplorerscanApi } from '../../constants/enums'

/* import components */
import { Button } from '../atoms/Button'
import { StyledLinkExternal } from '../atoms/Icon'
import { HyperLink } from '../atoms/Link'
import { ModalAddendum } from '../molecules/Modal'

/* import utils */
import { getExplorerItemUrl } from '../../utils/explorer'

interface SourceContractProps {
  contract: Contract
}

export const SourceContract: React.FC<SourceContractProps> = ({ contract }) => {
  /*
  
    hooks

  */
  const { activeNetwork } = useNetwork()

  return (
    <ModalAddendum>
      <HyperLink
        href={getExplorerItemUrl(activeNetwork.explorer.url, contract.address, ExplorerscanApi.ADDRESS)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button>
          Source Contract <StyledLinkExternal size={20} />
        </Button>
      </HyperLink>{' '}
    </ModalAddendum>
  )
}
