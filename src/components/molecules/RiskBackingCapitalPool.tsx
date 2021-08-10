/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    RiskBackingCapitalPool function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import { parseEther } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { CP_ROI, MAX_TABLET_SCREEN_WIDTH } from '../../constants'
import { FunctionName } from '../../constants/enums'

/* import components */
import { Content } from '../atoms/Layout'
import { Heading1 } from '../atoms/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'

/* import hooks */
import { useCapitalPoolSize, useUserVaultDetails } from '../../hooks/useVault'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { floatEther, truncateBalance } from '../../utils/formatting'

interface RiskBackingCapitalPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const RiskBackingCapitalPool: React.FC<RiskBackingCapitalPoolProps> = ({ openModal }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { account, errors } = useWallet()
  const { userVaultAssets, userVaultShare } = useUserVaultDetails()
  const capitalPoolSize = useCapitalPoolSize()
  const { width } = useWindowDimensions()

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Content>
      <Heading1>ETH Risk backing Capital Pool</Heading1>
      {width > MAX_TABLET_SCREEN_WIDTH ? (
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {account ? <TableHeader width={100}>Your Assets</TableHeader> : null}
              <TableHeader width={100}>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {account ? <TableHeader width={130}>Your Vault Share</TableHeader> : null}
              {account && (
                <Fragment>
                  <TableHeader width={100}></TableHeader>
                  <TableHeader width={150}></TableHeader>
                </Fragment>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {account ? <TableData width={100}>{truncateBalance(parseFloat(userVaultAssets), 2)}</TableData> : null}
              <TableData width={100}>{truncateBalance(floatEther(parseEther(capitalPoolSize)), 2)}</TableData>
              <TableData width={100}>{CP_ROI}</TableData>
              {account ? <TableData width={130}>{`${truncateBalance(userVaultShare, 2)}%`}</TableData> : null}
              {account && (
                <Fragment>
                  <TableData width={100}></TableData>
                  <TableData width={150}></TableData>
                </Fragment>
              )}
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200}>
                    <Button disabled={errors.length > 0} onClick={() => openModal(FunctionName.DEPOSIT, 'Deposit')}>
                      Deposit
                    </Button>
                    <Button disabled={errors.length > 0} onClick={() => openModal(FunctionName.WITHDRAW, 'Withdraw')}>
                      Withdraw
                    </Button>
                  </TableDataGroup>
                </TableData>
              ) : null}
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <Card>
          {account && (
            <FormRow>
              <FormCol>Your Assets:</FormCol>
              <FormCol>{truncateBalance(parseFloat(userVaultAssets), 2)}</FormCol>
            </FormRow>
          )}
          <FormRow>
            <FormCol>Total Assets:</FormCol>
            <FormCol>{truncateBalance(floatEther(parseEther(capitalPoolSize)), 2)}</FormCol>
          </FormRow>
          <FormRow>
            <FormCol>ROI:</FormCol>
            <FormCol>{CP_ROI}</FormCol>
          </FormRow>
          <FormRow>
            <FormCol>Your Vault Share:</FormCol>
            <FormCol>{`${truncateBalance(userVaultShare, 2)}%`}</FormCol>
          </FormRow>
          <ButtonWrapper isColumn>
            <Button
              widthP={100}
              disabled={errors.length > 0}
              onClick={() => openModal(FunctionName.DEPOSIT, 'Deposit')}
            >
              Deposit
            </Button>
            <Button
              widthP={100}
              disabled={errors.length > 0}
              onClick={() => openModal(FunctionName.WITHDRAW, 'Withdraw')}
            >
              Withdraw
            </Button>
          </ButtonWrapper>
        </Card>
      )}
    </Content>
  )
}
