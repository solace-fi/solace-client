import React, { Fragment } from 'react'
import { Content } from '../../components/Layout'
import { Heading1 } from '../../components/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { CP_ROI } from '../../constants'
import { useWallet } from '../../context/WalletManager'
import { Button } from '../../components/Button'
import { parseEther } from '@ethersproject/units'
import { floatEther, truncateBalance } from '../../utils/formatting'
import { FunctionName } from '../../constants/enums'
import { useCapitalPoolSize, useUserVaultDetails } from '../../hooks/useVault'

interface RiskBackingCapitalPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const RiskBackingCapitalPool: React.FC<RiskBackingCapitalPoolProps> = ({ openModal }) => {
  const wallet = useWallet()
  const { userVaultAssets, userVaultShare } = useUserVaultDetails()
  const capitalPoolSize = useCapitalPoolSize()

  return (
    <Content>
      <Heading1>ETH Risk backing Capital Pool</Heading1>
      <Table isHighlight textAlignCenter>
        <TableHead>
          <TableRow>
            {wallet.account ? <TableHeader width={100}>Your Assets</TableHeader> : null}
            <TableHeader width={100}>Total Assets</TableHeader>
            <TableHeader width={100}>ROI (1Y)</TableHeader>
            {wallet.account ? <TableHeader width={130}>Your Vault Share</TableHeader> : null}
            {wallet.account && (
              <Fragment>
                <TableHeader width={100}></TableHeader>
                <TableHeader width={150}></TableHeader>
              </Fragment>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {wallet.account ? (
              <TableData width={100}>{truncateBalance(parseFloat(userVaultAssets), 2)}</TableData>
            ) : null}
            <TableData width={100}>{truncateBalance(floatEther(parseEther(capitalPoolSize)), 2)}</TableData>
            <TableData width={100}>{CP_ROI}</TableData>
            {wallet.account ? <TableData width={130}>{`${truncateBalance(userVaultShare, 2)}%`}</TableData> : null}
            {wallet.account && (
              <Fragment>
                <TableData width={100}></TableData>
                <TableData width={150}></TableData>
              </Fragment>
            )}
            {wallet.account ? (
              <TableData textAlignRight>
                <TableDataGroup width={200}>
                  <Button
                    disabled={wallet.errors.length > 0}
                    onClick={() => openModal(FunctionName.DEPOSIT, 'Deposit')}
                  >
                    Deposit
                  </Button>
                  <Button
                    disabled={wallet.errors.length > 0}
                    onClick={() => openModal(FunctionName.WITHDRAW, 'Withdraw')}
                  >
                    Withdraw
                  </Button>
                </TableDataGroup>
              </TableData>
            ) : null}
          </TableRow>
        </TableBody>
      </Table>
    </Content>
  )
}
