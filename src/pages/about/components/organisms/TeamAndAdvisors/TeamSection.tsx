import React from 'react'
import team from '../../../../../resources/team'
import { HardcodedGrid, HardcodedResponsiveFlex, TeamMember } from './commonComponents'

export const TeamSection = (
  <HardcodedResponsiveFlex>
    {/* <SectionTitle light extrabold>
      Team
    </SectionTitle> */}

    <HardcodedGrid>
      {team.map(({ name, role, twitter }) => (
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
