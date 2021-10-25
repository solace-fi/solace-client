/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import constants
    import hooks

    ScaledContainer

    NftPosition
      hooks

  *************************************************************************************/

/* import packages */
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BigNumber } from 'ethers'
import Tilt from 'react-parallax-tilt'

/* import managers */
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Loader } from '../atoms/Loader'

/* import constants */
import { BKPT_3, ZERO } from '../../constants'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

interface NftPositionProps {
  tokenId: BigNumber
}

const ScaledContainer = styled.div`
  transition: all 600ms ease;
  &:hover {
    transform: scale(1.2);
  }
`

export const NftPosition: React.FC<NftPositionProps> = ({ tokenId }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()
  const { lpToken } = useContracts()
  const [image, setImage] = useState<any>(null)

  useEffect(() => {
    const getUri = async () => {
      if (!lpToken || tokenId.eq(ZERO)) return
      await lpToken
        .tokenURI(tokenId)
        .then((uri: string) => {
          const newUri = uri.replace('data:application/json;base64,', '')
          const json = JSON.parse(atob(newUri))
          setImage(json.image)
        })
        .catch((err: any) => console.log(err))
    }
    getUri()
  }, [lpToken, tokenId])

  return (
    <>
      {image ? (
        <Tilt style={{ textAlign: 'center' }}>
          {width > BKPT_3 ? (
            <ScaledContainer>
              <img src={image} style={{ width: '80%' }} />
            </ScaledContainer>
          ) : (
            // mobile version
            <img src={image} style={{ width: '80%' }} />
          )}
        </Tilt>
      ) : (
        <Loader />
      )}
    </>
  )
}
