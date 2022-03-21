import React, { useEffect, useState, useMemo } from 'react'
import { Content, Flex, GrayBgDiv, HeroContainer, HorizRule } from '../../components/atoms/Layout'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableData } from '../../components/atoms/Table'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { SolaceRiskProtocol, SolaceRiskScore } from '../../constants/types'
import { accurateMultiply, capitalizeFirstLetter, filterAmount, floatUnits, formatAmount } from '../../utils/formatting'
import { Loader } from '../../components/atoms/Loader'
import { Text } from '../../components/atoms/Typography'
import { useTierColors } from '../../hooks/internal/useTierColors'
import { Input, Search } from '../../components/atoms/Input'
import useDebounce from '@rooks/use-debounce'
import { getSolaceRiskScores, getSolaceRiskSeries } from '../../utils/api'
import { Button, GraySquareButton } from '../../components/atoms/Button'
import { GenericInputSection } from '../../components/molecules/InputSection'
import {
  StyledArrowIosBackOutline,
  StyledArrowIosForwardOutline,
  StyledRemoveCircleOutline,
} from '../../components/atoms/Icon'
import { BigNumber } from 'ethers'
import { useWallet } from '../../context/WalletManager'

type EditableProtocol = {
  appId: string
  balanceUSD: string
  category: string
  network: string
  tier: number
  erroneous: boolean
}

export function PortfolioEditor({
  portfolio,
  loading,
}: {
  portfolio: SolaceRiskScore | undefined
  loading: boolean
}): JSX.Element {
  const { account } = useWallet()
  const { isDesktop, isMobile } = useWindowDimensions()
  const [searchValue, setSearchValue] = useState<string>('')
  const [editableProtocols, setEditablePortfolio] = useState<EditableProtocol[]>([])
  const [protocolMap, setProtocolMap] = useState<{ appId: string; category: string; tier: number }[]>([])
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [score, setScore] = useState<SolaceRiskScore | undefined>(undefined)

  const protocolMapSorted = useMemo(
    () =>
      protocolMap.sort((a, b) => {
        const appId_A = a.appId.toUpperCase()
        const appId_B = b.appId.toUpperCase()
        if (appId_A < appId_B) {
          return -1
        }
        if (appId_A > appId_B) {
          return 1
        }
        return 0
      }),
    [protocolMap]
  )

  const protocolMapFiltered = useMemo(
    () => protocolMapSorted.filter((protocol) => protocol.appId.includes(searchValue.toLowerCase())),
    [protocolMapSorted, searchValue]
  )

  const numResultsPerPage = 10
  const numPages = useMemo(() => Math.ceil(protocolMapFiltered.length / numResultsPerPage), [protocolMapFiltered])

  const protocolMapPaginated = useMemo(
    () => protocolMapFiltered.slice(currentPage * numResultsPerPage, (currentPage + 1) * numResultsPerPage),
    [currentPage, protocolMapFiltered]
  )

  const editablePortfolioSelectiveBalance = useMemo(
    () =>
      editableProtocols.reduce(
        (total, protocol) =>
          (total +=
            protocol.balanceUSD.length == 0 || protocol.erroneous ? 0 : parseFloat(formatAmount(protocol.balanceUSD))),
        0
      ),
    [editableProtocols]
  )

  const editablePortfolioTotalBalance = useMemo(
    () =>
      editableProtocols.reduce(
        (total, protocol) =>
          (total += protocol.balanceUSD.length == 0 ? 0 : parseFloat(formatAmount(protocol.balanceUSD))),
        0
      ),
    [editableProtocols]
  )

  const largestPosition = useMemo(
    () =>
      editableProtocols.length > 0
        ? editableProtocols.reduce((pn, cn) => (parseFloat(cn.balanceUSD) > parseFloat(pn.balanceUSD) ? cn : pn))
        : undefined,
    [editableProtocols]
  )

  const estimatedAnnualPrice = useMemo(() => {
    if (score && largestPosition) {
      return score.address_rp * parseFloat(largestPosition.balanceUSD)
    } else {
      return 0
    }
  }, [largestPosition, score])

  const dailyRate = useMemo(() => estimatedAnnualPrice / 365.25, [estimatedAnnualPrice])

  const tierColors = useTierColors(protocolMapSorted.map((p) => p.tier))

  const getColorByTier = (tier: number) => {
    const index = tier - 1
    if (index < 0) {
      return tierColors[tierColors.length - 1]
    } else {
      return tierColors[index]
    }
  }

  const handleSearch = (searchValue: string) => {
    setCurrentPage(0)
    setSearchValue(searchValue)
  }

  const getScores = useDebounce(async () => {
    if (!account) return
    const acceptableProtocols = editableProtocols.filter((p) => !p.erroneous)
    const acceptableRiskBalances = acceptableProtocols.map((p) => {
      return {
        network: p.network,
        appId: p.appId,
        balanceUSD: parseFloat(p.balanceUSD),
      }
    })
    const scores = await getSolaceRiskScores(account, acceptableRiskBalances)
    if (scores) setScore(scores)
  }, 300)

  const addPosition = (protocol?: { appId: string; category: string; tier: number }) => {
    const appId = protocol ? protocol.appId : ''
    const balanceUSD = ''
    const category = protocol ? protocol.category : 'unknown'
    const tier = protocol ? protocol.tier : 0
    setEditablePortfolio((editableProtocols) => [
      ...editableProtocols,
      {
        appId,
        balanceUSD,
        category,
        network: '',
        tier,
        erroneous: protocol == undefined,
      },
    ])
  }

  const changeAppId = (appId: string, newAppId: string) => {
    const newFoundApp = protocolMapSorted.find((p) => p.appId.toLowerCase() == newAppId.toLowerCase())
    if (newFoundApp) {
      setEditablePortfolio((editableProtocols) =>
        editableProtocols.map((p) => {
          if (p.appId.toLowerCase() == appId.toLowerCase()) {
            return {
              ...p,
              appId: newFoundApp.appId,
              category: newFoundApp.category,
              tier: newFoundApp.tier,
              erroneous: false,
            }
          } else {
            return p
          }
        })
      )
    } else {
      setEditablePortfolio((editableProtocols) =>
        editableProtocols.map((p) => {
          if (p.appId.toLowerCase() == appId.toLowerCase()) {
            return {
              ...p,
              appId: newAppId,
              category: 'unknown',
              tier: 0,
              erroneous: true,
            }
          } else {
            return p
          }
        })
      )
    }
  }

  const changeBalance = (appId: string, currentBalance: string, newBalance: string) => {
    const filtered = filterAmount(newBalance, currentBalance)

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    setEditablePortfolio((editableProtocols) =>
      editableProtocols.map((p) => {
        if (p.appId.toLowerCase() == appId.toLowerCase()) {
          return {
            ...p,
            balanceUSD: filtered,
          }
        } else {
          return p
        }
      })
    )
  }

  const removePosition = (index: number) =>
    setEditablePortfolio((editableProtocols) => editableProtocols.filter((p) => editableProtocols.indexOf(p) != index))

  useEffect(() => {
    const g = async () => {
      const y = await getSolaceRiskSeries()
      setProtocolMap(y.data.protocolMap)
    }
    g()
  }, [])

  useEffect(() => {
    if (loading || !portfolio) return
    setEditablePortfolio(
      portfolio.protocols.map((p) => {
        return {
          appId: p.appId,
          balanceUSD: p.balanceUSD.toString(),
          category: p.category,
          network: p.network,
          tier: p.tier,
          erroneous: false,
        }
      })
    )
  }, [loading, portfolio])

  useEffect(() => {
    if (editableProtocols.length == 0) return
    getScores()
  }, [editableProtocols])

  return (
    <>
      {loading && (
        <Content>
          <Loader />
        </Content>
      )}
      {!loading && !portfolio && (
        <HeroContainer>
          <Text t1 textAlignCenter>
            Unable to retrieve your positions.
          </Text>
          <Text t1 textAlignCenter>
            You can get coverage for the future or just check coverage price by adding custom positions below.
          </Text>
        </HeroContainer>
      )}
      {!loading && portfolio && portfolio.protocols.length == 0 && (
        <HeroContainer>
          <Text t1 textAlignCenter>
            No DeFi positions found in this account.
          </Text>
          <Text t1 textAlignCenter>
            You can get coverage for the future or just check coverage price by adding custom positions below.
          </Text>
        </HeroContainer>
      )}
      {isDesktop && !loading && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Protocol</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Risk Level</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {editableProtocols &&
                editableProtocols.length > 0 &&
                editableProtocols.map((d: EditableProtocol, i) => (
                  <TableRow key={i}>
                    <TableData>
                      <Input
                        error={d.erroneous}
                        value={capitalizeFirstLetter(d.appId)}
                        onChange={(e) => changeAppId(d.appId, e.target.value)}
                      />
                    </TableData>
                    <TableData>
                      <Text error={d.erroneous}>{d.category}</Text>
                    </TableData>
                    <TableData>
                      <Input
                        error={d.erroneous}
                        value={d.balanceUSD}
                        onChange={(e) => changeBalance(d.appId, d.balanceUSD, e.target.value)}
                      />
                    </TableData>
                    {tierColors.length > 0 && (
                      <TableData style={{ color: getColorByTier(d.tier) }}>
                        {d.tier == 0 ? 'Unrated' : d.tier}
                      </TableData>
                    )}
                    <TableData>
                      <Button error nohover noborder onClick={() => removePosition(i)}>
                        <StyledRemoveCircleOutline size={20} />
                      </Button>
                    </TableData>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <Button info onClick={() => addPosition()}>
            Add New Protocol
          </Button>
        </>
      )}
      {score && (
        <Flex col>
          <Flex m={30} around>
            <Text bold>Total Portfolio Value</Text>
            <Text bold error={editablePortfolioSelectiveBalance != editablePortfolioTotalBalance}>
              {editablePortfolioSelectiveBalance}
            </Text>
          </Flex>
          <Flex around>
            <Text bold>Projected Annual Rate</Text>
            <Text bold error={editablePortfolioSelectiveBalance != editablePortfolioTotalBalance}>
              {estimatedAnnualPrice}
            </Text>
          </Flex>
          <Flex around>
            <Text bold>Projected Daily Rate</Text>
            <Text bold error={editablePortfolioSelectiveBalance != editablePortfolioTotalBalance}>
              {dailyRate}
            </Text>
          </Flex>
        </Flex>
      )}
      <Flex gap={10} itemsCenter>
        <Text bold nowrap>
          Search for Protocol
        </Text>
        <HorizRule widthP={100} />
      </Flex>
      <GrayBgDiv style={{ borderRadius: '10px', padding: '16px', margin: '30px 0' }}>
        <Flex>
          <Flex itemsCenter gap={2}>
            <GraySquareButton onClick={() => setCurrentPage(currentPage - 1 < 0 ? numPages - 1 : currentPage - 1)}>
              <StyledArrowIosBackOutline height={18} />
            </GraySquareButton>
            <Search
              value={searchValue}
              type="search"
              placeholder="Search"
              onChange={(e) => handleSearch(e.target.value)}
            />
            <GraySquareButton onClick={() => setCurrentPage(currentPage + 1 > numPages - 1 ? 0 : currentPage + 1)}>
              <StyledArrowIosForwardOutline height={18} />
            </GraySquareButton>
            {numPages > 1 && (
              <Text t4>
                Page {currentPage + 1}/{numPages}
              </Text>
            )}
          </Flex>
        </Flex>
        {protocolMapPaginated.length > 0 ? (
          <Table canHover>
            <TableBody>
              {protocolMapPaginated.map((p: { appId: string; category: string; tier: number }, i) => (
                <TableRow key={i} onClick={() => addPosition(p)} style={{ cursor: 'pointer' }}>
                  <TableData>{capitalizeFirstLetter(p.appId)}</TableData>
                  <TableData>{p.category}</TableData>
                  {tierColors.length > 0 && (
                    <TableData style={{ color: getColorByTier(p.tier) }}>{p.tier == 0 ? 'Unrated' : p.tier}</TableData>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Text>No results found. If you would like to see a protocol added, contact our team!</Text>
        )}
      </GrayBgDiv>
      {/* {isMobile && !loading && portfolio && portfolio.protocols.length > 0 && (
        <Flex column gap={30}>
          {portfolio.protocols.map((row, i) => (
            <GrayBgDiv
              key={i}
              style={{
                borderRadius: '10px',
                padding: '14px 24px',
              }}
            >
              <Flex gap={30} between itemsCenter>
                <Flex col gap={8.5}>
                  <div>{capitalizeFirstLetter(row.appId)}</div>
                </Flex>
                <Flex
                  col
                  gap={8.5}
                  style={{
                    textAlign: 'right',
                  }}
                >
                  <div>{row.category}</div>
                  <div>{row.balanceUSD}</div>
                  {tierColors.length > 0 && (
                    <div style={{ color: getColorByTier(row.tier) }}>{row.tier == 0 ? 'Unrated' : row.tier}</div>
                  )}{' '}
                </Flex>
              </Flex>
            </GrayBgDiv>
          ))}
        </Flex>
      )} */}
    </>
  )
}
