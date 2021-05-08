import React, { Fragment } from 'react'

import { Content } from '../App'
import { CardContainer, Card, CardHeader, CardTitle, CardBlock, CardActions } from '../../components/ui/Card'
import { Heading1, Heading2 } from '../../components/ui/Text'
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
  return (
    <Fragment>
      <Content>
        <Heading1>Your Policies</Heading1>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>{'Id'}</TableHeader>
              <TableHeader>{'Status'}</TableHeader>
              <TableHeader>{'Product'}</TableHeader>
              <TableHeader>{'Expiration Date'}</TableHeader>
              <TableHeader>{'Amount'}</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableData>{'23'}</TableData>
              <TableData>{'Active'}</TableData>
              <TableData>{'Uniswap'}</TableData>
              <TableData>{'1-6-2021'}</TableData>
              <TableData>{'3000 ETH'}</TableData>
              <TableData cellAlignRight>
                <TableDataGroup>
                  <Button>Claim</Button>
                  <Button>Edit</Button>
                  <Button>Renew</Button>
                </TableDataGroup>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>{'20'}</TableData>
              <TableData>{'Expired'}</TableData>
              <TableData>{'Badger DAO'}</TableData>
              <TableData>{'1-5-2021'}</TableData>
              <TableData>{'30 ETH'}</TableData>
              <TableData cellAlignRight>
                <TableDataGroup>
                  <Button>View</Button>
                </TableDataGroup>
              </TableData>
            </TableRow>
          </TableBody>
        </Table>
      </Content>
      <Content>
        <Heading1>Investments</Heading1>
        <CardContainer>
          <Card>
            <CardHeader>
              <CardTitle h2>{23}</CardTitle>
              <Heading2>{`3000 ETH`}</Heading2>
            </CardHeader>
            <CardBlock>
              <CardTitle t2>Yield:</CardTitle>
              <CardTitle>{'287'}</CardTitle>
            </CardBlock>
            <CardBlock>
              <CardTitle t2>Earnings:</CardTitle>
              <CardTitle>{'69'}</CardTitle>
            </CardBlock>
            <CardActions>
              <Button>Manage</Button>
            </CardActions>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle h2>{21}</CardTitle>
              <Heading2>{`423 ETH`}</Heading2>
            </CardHeader>
            <CardBlock>
              <CardTitle t2>Yield:</CardTitle>
              <CardTitle>{'222'}</CardTitle>
            </CardBlock>
            <CardBlock>
              <CardTitle t2>Earnings:</CardTitle>
              <CardTitle>{'5444'}</CardTitle>
            </CardBlock>
            <CardActions>
              <Button>Manage</Button>
            </CardActions>
          </Card>
        </CardContainer>
      </Content>
    </Fragment>
  )
}

export default Dashboard
