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
      <Heading1>Transaction Submitted! Your Solace coverage is on the way!</Heading1>
      <Heading2>You can manage your policies on the dashboard or start a new one.</Heading2>
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
