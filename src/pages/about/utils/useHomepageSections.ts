import { useRef } from 'react'
import { AboutFirstSection } from '../components/organisms/AboutFirstSection'
import { Advisors, CoreContributors, Investors } from '../components/organisms/Collaborators'
import { ExploitsCoverageSection } from '../components/organisms/ExploitsCoverageSection'
import { RoadmapSection } from '../components/organisms/RoadmapSection'
import { StakingSection } from '../components/organisms/StakingSection'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useHomepageSections() {
  const HomepageSections = [
    { Section: AboutFirstSection, key: 'about', ref: useRef(null) },
    { Section: ExploitsCoverageSection, key: 'coverage', ref: useRef(null) },
    { Section: StakingSection, key: 'staking', ref: useRef(null) },
    { Section: RoadmapSection, key: 'roadmap', ref: useRef(null) },
    { Section: Investors, key: 'investors', ref: useRef(null) },
    { Section: Advisors, key: 'advisors', ref: useRef(null) },
    { Section: CoreContributors, key: 'team', ref: useRef(null) },
  ] as const
  return { HomepageSections }
}

export type HomepageSections = ReturnType<typeof useHomepageSections>['HomepageSections']
