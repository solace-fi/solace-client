import React, { Ref, RefObject, useEffect, useMemo } from 'react'
import { Flex, Grid } from '../../../../../components/atoms/Layout'
import { Text } from '../../../../../components/atoms/Typography'
import { useWindowDimensions } from '../../../../../hooks/internal/useWindowDimensions'
import { SectionTitle } from '../../../../../components/atoms/Typography'
import collectiveInvestors from '../../../../../resources/collaborators/assets/lists/collectiveInvestors'
// import individualInvestors from '../../../../../resources/collaborators/assets/lists/individualInvestors'
// import advisors from '../../../../../resources/collaborators/assets/lists/advisors'
import { peeps } from '../../../../../resources/collaborators/assets/lists/addPfpUtility'
import coreContributors from '../../../../../resources/collaborators/assets/lists/coreContributors'
import { Collective, Person } from '../../../../../resources/collaborators/types'

const { pfpdAdvisors, pfpdIndividualInvestors } = peeps
const advisors = pfpdAdvisors
const individualInvestors = pfpdIndividualInvestors

// profilePic is div h&w=60px > div borderWidth=5px padding=5px borderRadius=100% > div borderRadius=100% overflow=hidden > img objectFit=cover
function ProfilePic({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <div
      style={{
        width: '60px',
        height: '60px',
      }}
    >
      <div
        style={{
          padding: '5px',
          borderRadius: '100%',
          border: '5px solid #fff',
        }}
      >
        <div
          style={{
            borderRadius: '100%',
            overflow: 'hidden',
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            height={40}
            width={40}
          />
        </div>
      </div>
    </div>
  )
}

export function TeamMemberComponent({
  name,
  role,
  twitterUsername,
  profilePic,
}: {
  name: string
  role: string
  twitterUsername?: string
  profilePic?: string
}): JSX.Element {
  const twitterUrl = `https://twitter.com/${twitterUsername}`
  const atUsername = `@${twitterUsername}`
  return (
    <Flex gap={10}>
      {profilePic ? <ProfilePic src={profilePic} alt={name} /> : null}
      <Flex column gap={3}>
        <Text extrabold light mont t2_5s lineHeight={1.2}>
          {name}
        </Text>
        <Text t3s regular light>
          {role}
        </Text>
        {twitterUsername && (
          <Text t5s underline regular mt={3} light>
            <a href={twitterUrl} target="_blank" rel="noreferrer">
              {atUsername}
            </a>
          </Text>
        )}
      </Flex>
    </Flex>
  )
}

// This element exists for the simple reason that dynamically loading images requires to add a `.default`
// at the end, since it is not possible to dynamically load with the `import` syntax, and it is not possible
// to add `.default` to the require statement itself without causing a TypeScript error.
function HijackedImg({ src, alt }: { src: { default: string }; alt: string }): JSX.Element {
  return (
    <img
      src={src.default}
      alt={alt}
      width={221}
      style={{
        objectFit: 'contain',
        objectPosition: 'top',
      }}
    />
  )
}

export function CollectiveComponent({ altName, fileName }: Collective): JSX.Element {
  // path = /resources/collaborators/assets/collectiveImages/${fileName}
  return (
    <Flex
      style={{
        justifyContent: 'flex-start',
      }}
    >
      <HijackedImg
        src={require(`../../../../../resources/collaborators/assets/collectiveImages/${fileName}`)}
        alt={altName}
      />
    </Flex>
  )
}

function ReactCollective({ collectiveList, isMobile }: { collectiveList: Collective[]; isMobile: boolean }) {
  return (
    <Flex col gap={isMobile ? 30 : undefined} between={!isMobile}>
      {collectiveList.map((collective) => {
        return (
          <CollectiveComponent altName={collective.altName} fileName={collective.fileName} key={collective.altName} />
        )
      })}
    </Flex>
  )
}

export function ListOfPeople({
  peopleList, // array of { name, role, twitter }
  collectiveList,
  title, // string
  direction, // 'row' or 'column'
  columns, // number
  mobileColumns,
  desktopColumns,
  sectionRef,
}: {
  peopleList: Person[]
  // if there's a collective list, the first column will be the collective, and the optional second and third will be the people
  collectiveList?: Collective[]
  title: string
  logoList?: string[]
  direction?: 'row' | 'column'
  columns?: number
  mobileColumns?: number
  desktopColumns?: number
  sectionRef?: Ref<HTMLDivElement>
}): JSX.Element {
  const { isMobile } = useWindowDimensions()
  const reactTeam = peopleList.map(({ name, role, twitter, profilePic }) => (
    <TeamMemberComponent key={name} name={name} role={role} twitterUsername={twitter} profilePic={profilePic} />
  ))

  const teamLength = reactTeam.length
  const collectiveLength = collectiveList?.length || 0
  const addedLength = teamLength + collectiveLength

  const gridColumns = isMobile ? mobileColumns : desktopColumns
  const maxColumns = 3
  const wantedColumns = Math.ceil(addedLength / 2)
  const actualColumns = gridColumns ?? columns ?? Math.min(wantedColumns, maxColumns)

  // if we want the first column to be the collectiveList and the other 2 columns to be the peopleList
  // then the first column should reduce total columns by 1
  // therefore, when reactCollective is true, gridColumns is reduced by one.
  // Then in the JSX we add <Parent><Collective><People></Parent>

  const maybeReducedColumns = collectiveList ? actualColumns - 1 : actualColumns

  return (
    <Flex
      col
      stretch
      pr={isMobile ? 40 : 150}
      pl={isMobile ? 40 : 150}
      // pr={isMobile ? 20 : 70}
      gap={isMobile ? 50 : 70}
      // pl={isMobile ? 60 : 50}
      justifyCenter
      ref={sectionRef}
    >
      <SectionTitle light extrabold isMobile={isMobile}>
        {title}
      </SectionTitle>

      <Flex gap={isMobile ? 30 : 60} col={isMobile}>
        {collectiveList && <ReactCollective collectiveList={collectiveList} isMobile={isMobile} />}
        <Grid
          columnGap={60}
          rowGap={30}
          // columns={isMobile ? 1 : undefined}
          style={{
            gridAutoFlow: direction ?? 'row',
            // gridTemplateRows: reactCollective ? `repeat(${rows}, auto)` : undefined,
            gridTemplateColumns: `repeat(${maybeReducedColumns}, auto)`,
          }}
        >
          {reactTeam}
        </Grid>
      </Flex>
    </Flex>
  )
}

export function Investors({
  sectionRef: ref,
  getScrollerForThisRef,
  isVisible,
}: {
  sectionRef?: React.Ref<HTMLDivElement>
  getScrollerForThisRef?: (ref: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement>) => () => void
  isVisible?: boolean
}): JSX.Element {
  const scroller = useMemo(
    () => (ref && getScrollerForThisRef ? getScrollerForThisRef(ref) : () => console.log('no ref')),
    [ref, getScrollerForThisRef]
  )
  useEffect(() => {
    if (isVisible) scroller()
  }, [isVisible, scroller, ref])
  return (
    <ListOfPeople
      sectionRef={ref}
      collectiveList={collectiveInvestors}
      peopleList={individualInvestors}
      title="Investors"
      mobileColumns={1}
      direction="row"
    />
  )
}

export function Advisors({
  sectionRef: ref,
  getScrollerForThisRef,
  isVisible,
}: {
  sectionRef?: React.Ref<HTMLDivElement>
  getScrollerForThisRef?: (ref: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement>) => () => void
  isVisible?: boolean
}): JSX.Element {
  const scroller = useMemo(
    () => (ref && getScrollerForThisRef ? getScrollerForThisRef(ref) : () => console.log('no ref')),
    [ref, getScrollerForThisRef]
  )
  useEffect(() => {
    if (isVisible) console.log("advisors is visible! here's the ref: ", ref)
    if (isVisible) scroller()
  }, [isVisible, scroller, ref])
  return <ListOfPeople sectionRef={ref} peopleList={advisors} title="Advisors" mobileColumns={1} desktopColumns={2} />
}

export function CoreContributors({
  sectionRef: ref,
  getScrollerForThisRef,
  isVisible,
}: {
  sectionRef?: React.Ref<HTMLDivElement>
  getScrollerForThisRef?: (ref: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement>) => () => void
  isVisible?: boolean
}): JSX.Element {
  const scroller = useMemo(
    () => (ref && getScrollerForThisRef ? getScrollerForThisRef(ref) : () => console.log('no ref')),
    [ref, getScrollerForThisRef]
  )
  useEffect(() => {
    if (isVisible) scroller()
  }, [isVisible, scroller, ref])

  return (
    <ListOfPeople
      sectionRef={ref}
      peopleList={coreContributors}
      title="Core contributors"
      mobileColumns={1}
      desktopColumns={3}
    />
  )
}
