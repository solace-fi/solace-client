/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import components
    styled components

    AssetsModal function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useCallback } from 'react'

/* import packages */
import styled from 'styled-components'

/* import constants */
import { MAX_MOBILE_SCREEN_WIDTH } from '../../constants'

/* import components */
import { Modal } from '../molecules/Modal'
import { CustomScrollbar } from '../atoms/Layout'
import { PositionCardLogo } from '../atoms/Position'
import { Table, TableRow, TableBody, TableData } from '../atoms/Table'

/*************************************************************************************

  styled components

  *************************************************************************************/

const Scrollable = styled.div`
  max-height: 60vh;
  overflow-y: scroll;
  ${CustomScrollbar}
  padding: 10px;

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    max-height: 85vh;
  }
`

type AssetsModalProps = {
  isOpen: boolean
  closeModal: () => void
  assets: any[]
  modalTitle: string
}

export const AssetsModal: React.FC<AssetsModalProps> = ({ closeModal, isOpen, assets, modalTitle }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={modalTitle} disableCloseButton={false}>
      <Scrollable>
        <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.underlying.address}>
                <TableData>
                  <PositionCardLogo width={45} height={45}>
                    <img src={`https://assets.solace.fi/${asset.underlying.address.toLowerCase()}`} />
                  </PositionCardLogo>
                </TableData>
                <TableData>{asset.underlying.name}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollable>
    </Modal>
  )
}
