/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import constants
    import hooks

    ScaledContainer component
    NftPosition function
      custom hooks
      useEffect hook
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useState } from 'react'

/* import packages */
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

  custom hooks

  *************************************************************************************/
  const { width } = useWindowDimensions()
  const { lpToken } = useContracts()
  const [image, setImage] = useState<any>(null)

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/
  useEffect(() => {
    const getUri = async () => {
      if (!lpToken || tokenId.eq(ZERO)) return
      const uri = await lpToken.tokenURI(tokenId)
      const newUri = uri.replace('data:application/json;base64,', '')
      const json = JSON.parse(atob(newUri))
      setImage(json.image)
    }
    getUri()
  }, [lpToken, tokenId])

  /*************************************************************************************

  Render
  
  *************************************************************************************/

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
