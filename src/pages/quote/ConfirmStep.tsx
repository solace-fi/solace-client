import React from 'react'
import { StyledLink } from '../../components/Link'
import { Button } from '../../components/Button'
import { TableDataGroup } from '../../components/Table'
import { Heading1, Heading2 } from '../../components/Text'
import { WelcomeContainer } from './index'
import { formProps } from './MultiStepForm'

export const ConfirmStep: React.FC<formProps> = ({ navigation }) => {
  return (
    <WelcomeContainer>
      <Heading1>Transaction Confirmed!</Heading1>
      <Heading2>You are now covered by Solace and can manage your policy on the dashboard.</Heading2>
      <div style={{ marginTop: '24px' }}>
        <TableDataGroup>
          <StyledLink to="/">
            <Button secondary>Go to Dashboard</Button>
          </StyledLink>
          <Button secondary onClick={() => navigation.go(0)}>
            Start New Quote
          </Button>
        </TableDataGroup>
      </div>
    </WelcomeContainer>
  )
}
