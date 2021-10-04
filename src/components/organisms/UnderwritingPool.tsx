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
import React from 'react'

/* import packages */
import { parseUnits } from '@ethersproject/units'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

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
import { StyledTooltip } from '../molecules/Tooltip'

/* import hooks */
import { useCapitalPoolSize, useUserVaultDetails } from '../../hooks/useVault'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { floatUnits, truncateBalance } from '../../utils/formatting'

interface RiskBackingCapitalPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const RiskBackingCapitalPool: React.FC<RiskBackingCapitalPoolProps> = ({ openModal }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { errors } = useGeneral()
  const { account } = useWallet()
  const { userVaultAssets, userVaultShare } = useUserVaultDetails()
  const capitalPoolSize = useCapitalPoolSize()
  const { width } = useWindowDimensions()
  const { currencyDecimals } = useNetwork()

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Content>
      <Heading1>
        Underwriting Pool{' '}
        <StyledTooltip
          id={'underwriting-pool'}
          tip={'Provide capital here for Solace to underwrite the risks and fulfill claims for policies'}
        />{' '}
      </Heading1>
      {width > MAX_TABLET_SCREEN_WIDTH ? (
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {account ? <TableHeader width={100}>Your Assets</TableHeader> : null}
              <TableHeader width={100}>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {account ? <TableHeader width={130}>Your Vault Share</TableHeader> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {account ? (
                <TableData h3 high_em width={100}>
                  {truncateBalance(userVaultAssets, 2)}
                </TableData>
              ) : null}
              <TableData h3 high_em width={100}>
                {truncateBalance(floatUnits(parseUnits(capitalPoolSize, currencyDecimals), currencyDecimals), 2)}
              </TableData>
              <TableData h3 high_em width={100}>
                {CP_ROI}
              </TableData>
              {account ? (
                <TableData h3 high_em width={130}>{`${truncateBalance(userVaultShare, 2)}%`}</TableData>
              ) : null}
              {account ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200} style={{ float: 'right' }}>
                    <Button disabled={errors.length > 0} onClick={() => openModal(FunctionName.DEPOSIT_ETH, 'Deposit')}>
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.WITHDRAW_ETH, 'Withdraw')}
                    >
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
              <FormCol h2 high_em>
                {truncateBalance(userVaultAssets, 2)}
              </FormCol>
            </FormRow>
          )}
          <FormRow>
            <FormCol>Total Assets:</FormCol>
            <FormCol h2 high_em>
              {truncateBalance(floatUnits(parseUnits(capitalPoolSize, currencyDecimals), currencyDecimals), 2)}
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol>ROI:</FormCol>
            <FormCol h2 high_em>
              {CP_ROI}
            </FormCol>
          </FormRow>
          <FormRow>
            <FormCol>Your Vault Share:</FormCol>
            <FormCol h2 high_em>{`${truncateBalance(userVaultShare, 2)}%`}</FormCol>
          </FormRow>
          <ButtonWrapper isColumn>
            <Button
              widthP={100}
              disabled={errors.length > 0}
              onClick={() => openModal(FunctionName.DEPOSIT_ETH, 'Deposit')}
            >
              Deposit
            </Button>
            <Button
              widthP={100}
              disabled={errors.length > 0}
              onClick={() => openModal(FunctionName.WITHDRAW_ETH, 'Withdraw')}
            >
              Withdraw
            </Button>
          </ButtonWrapper>
        </Card>
      )}
    </Content>
  )
}
