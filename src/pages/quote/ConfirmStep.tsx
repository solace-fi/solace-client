/*************************************************************************************

    Table of Contents:

    import packages
    import components

    ConfirmStep

  *************************************************************************************/

/* import packages */
import React from 'react'

/* import components */
import { StyledNavLink } from '../../components/atoms/Link'
import { Button } from '../../components/atoms/Button'
import { TableDataGroup } from '../../components/atoms/Table'
import { Text } from '../../components/atoms/Typography'
import { HeroContainer } from '../../components/atoms/Layout'
import { formProps } from './MultiStepForm'

interface ConfirmStepProp extends formProps {
  resetForm: () => void
}

export const ConfirmStep: React.FC<ConfirmStepProp> = ({ resetForm }) => {
  return (
    <HeroContainer>
      <Text t1 textAlignCenter mb={20}>
        Transaction Submitted!
      </Text>
      <Text t1 textAlignCenter mb={10}>
        Your Solace coverage is on the way!
      </Text>
      <Text t3 textAlignCenter>
        View and manage policies on the dashboard or start a new one.
      </Text>
      <div style={{ marginTop: '24px' }}>
        <TableDataGroup>
          <StyledNavLink to="/dashboard">
            <Button secondary info>
              Go to Dashboard
            </Button>
          </StyledNavLink>
          <Button
            secondary
            info
            onClick={() => {
              resetForm()
            }}
          >
            Start New Quote
          </Button>
        </TableDataGroup>
      </div>
    </HeroContainer>
  )
}
