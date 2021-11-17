/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import context
    import components
    import hooks
    import utils

    styled components

    ProtocolStep
      hooks
      local functions
      Render

  *************************************************************************************/

/* import packages */
import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import useDebounce from '@rooks/use-debounce'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, BKPT_3 } from '../../constants'
import { ProductContract } from '../../constants/types'
import { ExplorerscanApi } from '../../constants/enums'

/* import context */
import { useContracts } from '../../context/ContractsManager'
import { useGeneral } from '../../context/GeneralProvider'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Button } from '../../components/atoms/Button'
import { Table, TableData, TableHead, TableHeader, TableRow, TableBody } from '../../components/atoms/Table'
import { Search } from '../../components/atoms/Input'
import { DeFiAsset, DeFiAssetImage, ProtocolTitle } from '../../components/atoms/DeFiAsset'
import { Card, CardContainer } from '../../components/atoms/Card'
import { FormRow, FormCol } from '../../components/atoms/Form'
import { FlexCol, FlexRow, Scrollable } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { HyperLink } from '../../components/atoms/Link'
import { StyledLinkExternal } from '../../components/atoms/Icon'

/* import hooks */
import { useGetAvailableCoverages, useGetYearlyCosts } from '../../hooks/usePolicy'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixed, truncateBalance } from '../../utils/formatting'
import { getExplorerItemUrl } from '../../utils/explorer'

function Bond(): any {
  const { haveErrors } = useGeneral()
  const { width } = useWindowDimensions()

  return (
    <Fragment>
      {width > BKPT_3 ? (
        <Scrollable style={{ padding: '0 10px 0 10px' }}>
          <Table canHover style={{ borderSpacing: '0px 7px' }}>
            <TableHead sticky>
              <TableRow>
                <TableHeader>Bond</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>ROI</TableHeader>
                <TableHeader>Purchased</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableData>
                  <FlexRow>
                    <DeFiAssetImage mr={10}></DeFiAssetImage>
                    <FlexCol style={{ justifyContent: 'center' }}>
                      <FlexRow></FlexRow>
                    </FlexCol>
                  </FlexRow>
                </TableData>
                <TableData></TableData>
                <TableData></TableData>
                <TableData></TableData>
                <TableData textAlignRight>
                  <Button disabled={haveErrors} info>
                    Bond
                  </Button>
                </TableData>
              </TableRow>
            </TableBody>
          </Table>
        </Scrollable>
      ) : (
        // mobile version
        <Scrollable maxMobileHeight={65}>
          <CardContainer cardsPerRow={2}>
            <Card>
              <FormRow>
                <FormCol></FormCol>
                <FormCol style={{ display: 'flex', alignItems: 'center' }}>
                  <Text bold t2></Text>
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol></FormCol>
                <FormCol>
                  <Text bold t2></Text>
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol></FormCol>
                <FormCol>
                  <Text bold t2></Text>
                </FormCol>
              </FormRow>
            </Card>
          </CardContainer>
        </Scrollable>
      )}
    </Fragment>
  )
}

export default Bond
