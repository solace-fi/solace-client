import React from 'react'
import { SectionTitle } from '../../../../../components/atoms/Typography'
import advisorsAndContributors from '../../../../../resources/advisorsAndContributors'
import { HardcodedGrid, HardcodedResponsiveFlex, TeamMember } from './commonComponents'

export const AdvisorsAndContributorsSection = (
  <HardcodedResponsiveFlex>
    <SectionTitle light extrabold>
      Advisors &amp; Contributors
    </SectionTitle>
    <HardcodedGrid>
      {advisorsAndContributors.map(({ name, role, twitter }) => (
        <TeamMember
          key={name}
          name={name}
          role={role}
          twitter={
            twitter
              ? {
                  username: twitter,
                  url: `https://twitter.com/${twitter}`,
                }
              : undefined
          }
        />
      ))}
    </HardcodedGrid>
  </HardcodedResponsiveFlex>
)
