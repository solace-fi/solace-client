/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import components
    import resources
    import hooks

    About
      hooks

  *************************************************************************************/

/* import packages */
import React, { useEffect, useState } from 'react'

/* import constants */

/* import components */
import { Flex } from '../../components/atoms/Layout'

/* import resources */

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { ScrollDot } from '../../components/atoms/Icon/ScrollDot'
import { ExploitsCoverageSection } from './components/organisms/ExploitsCoverageSection'
import { AboutFirstSection } from './components/organisms/AboutFirstSection'
import { StakingSection } from './components/organisms/StakingSection'
import { RoadmapSection } from './components/organisms/RoadmapSection'
// import { AdvisorsAndContributorsSection } from './components/organisms/TeamAndAdvisors/AdvisorsAndContributorsSection'
// import { TeamSection } from './components/organisms/TeamAndAdvisors/TeamSection'
import { Advisors, CoreContributors, Investors } from './components/organisms/Collaborators'
import { handleDesktopScrollingEvents } from './utils/handleDesktopScrollingEvents'

const AboutSections = [
  { section: AboutFirstSection, key: 'about' },
  { section: ExploitsCoverageSection, key: 'coverage' },
  { section: StakingSection, key: 'staking' },
  { section: RoadmapSection, key: 'roadmap' },
  { section: Investors, key: 'investors' },
  { section: Advisors, key: 'advisors' },
  { section: CoreContributors, key: 'team' },
] as const

const AboutContent = ({ section }: { section: number }) => <>{AboutSections[section].section}</>

function About(): JSX.Element {
  /* hooks */
  const { isMobile, height } = useWindowDimensions()
  const [section, setSection] = useState<number>(0)

  useEffect(() => {
    // desktop cannot scroll normally
    if (!isMobile) {
      window.document.body.style.overflowY = 'hidden'
    }
    if (isMobile) {
      window.document.body.style.overflowY = 'scroll'
    }
    return () => {
      window.document.body.style.overflowY = 'auto'
    }
  }, [isMobile])

  useEffect(() => {
    // note for later: these functions should use the `key` object prop instead of the number maybe
    // or some derivative for good performance

    const setPreviousSection = () => setSection((section) => (section <= 0 ? 0 : section - 1))
    const setNextSection = () => {
      console.log('next section')
      setSection((section) => (section >= AboutSections.length - 1 ? AboutSections.length - 1 : section + 1))
    }

    const { removeListeners } = handleDesktopScrollingEvents({
      onDown: setNextSection,
      onUp: setPreviousSection,
      onHome: () => setSection(0),
      onEnd: () => setSection(AboutSections.length - 1),
    })
    return removeListeners()
  }, [])

  return (
    <>
      <Flex
        itemsCenter
        justifyCenter
        col
        style={{
          height: !isMobile ? height - 100 + 'px' : '100%',
          // border: '5px solid black',
          position: 'relative',
        }}
      >
        {!isMobile ? (
          <AboutContent section={section} key={AboutSections[section].key} />
        ) : (
          <Flex col gap={81}>
            {AboutSections.map((Section, index) => (
              <React.Fragment key={'section' + index}>{Section.section}</React.Fragment>
            ))}
          </Flex>
        )}
        {!isMobile && (
          <Flex
            col
            gap={20}
            justifyCenter
            w={8}
            style={{
              position: 'absolute',
              right: '30px',
              height: '100%',
            }}
          >
            {AboutSections.map((_section, index) => (
              <ScrollDot
                hoverable
                key={_section.key + 'dot'}
                active={index === section}
                onClick={() => setSection(index)}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </>
  )
}
export default About
