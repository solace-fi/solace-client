import React, { Fragment } from 'react'

import { CardContainer, Card, CardHeader, CardTitle, CardBlock, CardActions } from '../../components/ui/Card'
import { Heading1, Heading2 } from '../../components/ui/Text'
import { Statistics } from '../../components/ui/Box/Statistics'
import { Button } from '../../components/ui/Button'
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableData,
  TableDataGroup,
} from '../../components/ui/Table'

function Dashboard(): any {
  const sampleHeaders = ['Id', 'Status', 'Product', 'Expiration Date', 'Amount']

  const sampleBody = [
    { data: ['23', 'Uniswap', '1-6-2021', '3000 ETH'], status: true },
    { data: ['20', 'Badger DAO', '1-4-2021', '5 ETH'], status: false },
  ]

  const sampleInvestments = [
    {
      name: 'Risk-backing Capital Pool',
      amount: '138',
      yield: '287',
      earnings: '2900',
    },
    {
      name: 'SOLACE-ETH Liquidity',
      amount: '420',
      yield: '287',
      earnings: '69',
    },
  ]

  return (
    <Fragment>
      {/* <Statistics /> */}
      <Heading1>Your Policies</Heading1>
      <Table>
        <TableHead>
          <TableRow>
            {sampleHeaders.map((header: string) => {
              return <TableHeader key={header}>{header}</TableHeader>
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {sampleBody.map((row: { data: string[]; status: boolean }, i: number) => {
            return (
              <TableRow key={i}>
                <TableData>{row.data[0]}</TableData>
                <TableData>{row.status ? 'Active' : 'Expired'}</TableData>
                <TableData>{row.data[1]}</TableData>
                <TableData>{row.data[2]}</TableData>
                <TableData>{row.data[3]}</TableData>
                <TableData cellAlignRight>
                  {row.status ? (
                    <TableDataGroup>
                      <Button>Claim</Button>
                      <Button>Edit</Button>
                      <Button>Renew</Button>
                    </TableDataGroup>
                  ) : (
                    <TableDataGroup>
                      <Button>View</Button>
                    </TableDataGroup>
                  )}
                </TableData>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <Heading1>Investments</Heading1>
      <CardContainer>
        {sampleInvestments.map((investment: any, i: number) => {
          return (
            <Card key={i}>
              <CardHeader>
                <CardTitle h2>{investment.name}</CardTitle>
                <Heading2>{`${investment.amount} ETH`}</Heading2>
              </CardHeader>
              <CardBlock>
                <CardTitle text>Yield:</CardTitle>
                <CardTitle>{investment.yield}</CardTitle>
              </CardBlock>
              <CardBlock>
                <CardTitle text>Earnings:</CardTitle>
                <CardTitle>{investment.earnings}</CardTitle>
              </CardBlock>
              <CardActions>
                <Button>Manage</Button>
              </CardActions>
            </Card>
          )
        })}
      </CardContainer>
    </Fragment>
  )
}

export default Dashboard
