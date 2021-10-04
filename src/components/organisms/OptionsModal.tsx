/*************************************************************************************

    Table of Contents:

    import react
    import components
    import constants

    OptionsModal function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useCallback } from 'react'

/* import components */
import { Modal } from '../molecules/Modal'
import { Scrollable } from '../atoms/Layout'
import { Table, TableRow, TableBody, TableData } from '../atoms/Table'
import { Button } from '../atoms/Button'

/* import constants */
import { Option } from '../../constants/types'

type OptionsModalProps = {
  isOpen: boolean
  closeModal: () => void
  options: Option[]
  modalTitle: string
}

export const OptionsModal: React.FC<OptionsModalProps> = ({ closeModal, isOpen, options, modalTitle }) => {
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
            {options.map((option) => (
              <TableRow key={option.id}>
                <TableData>{option.id}</TableData>
                <TableData>{option.rewardAmount}</TableData>
                <TableData>{option.strikePrice}</TableData>
                <TableData>{option.expiry}</TableData>
                <TableData>
                  <Button>Exercise Option</Button>
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollable>
    </Modal>
  )
}
