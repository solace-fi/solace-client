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
import { getSolaceRiskSeries } from '../../utils/api'
import { Button, GraySquareButton } from '../../components/atoms/Button'
import { GenericInputSection } from '../../components/molecules/InputSection'
import {
  StyledArrowIosBackOutline,
  StyledArrowIosForwardOutline,
  StyledRemoveCircleOutline,
} from '../../components/atoms/Icon'
import { BigNumber } from 'ethers'

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
  currentCoverageLimit,
  totalAccountBalance,
  loading,
}: {
  portfolio: SolaceRiskScore | undefined
  currentCoverageLimit: BigNumber
  totalAccountBalance: BigNumber
  loading: boolean
}): JSX.Element {
  const { isDesktop, isMobile } = useWindowDimensions()
  const [searchValue, setSearchValue] = useState<string>('')
  const [editableProtocols, setEditablePortfolio] = useState<EditableProtocol[]>([])
  const [protocolMap, setProtocolMap] = useState<{ appId: string; category: string; tier: number }[]>([])
  const [newPositionAmount, setNewPositionAmount] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(0)

  const usdBalanceSum = useMemo(
    () =>
      portfolio && portfolio.protocols.length > 0
        ? portfolio.protocols.reduce((total, protocol) => (total += protocol.balanceUSD), 0)
        : 0,
    [portfolio]
  )

  const annualRate = useMemo(() => (portfolio && portfolio.current_rate ? portfolio.current_rate : 0), [portfolio])

  const annualCost = useMemo(() => (portfolio && portfolio.address_rp ? portfolio.address_rp : 0), [portfolio])

  const dailyRate = useMemo(() => annualRate / 365.25, [annualRate])

  const dailyCost = useMemo(() => {
    const numberifiedCurrentCoverageLimit = floatUnits(currentCoverageLimit, 18)
    if (usdBalanceSum < numberifiedCurrentCoverageLimit) return usdBalanceSum * dailyRate
    return numberifiedCurrentCoverageLimit * dailyRate
  }, [currentCoverageLimit, dailyRate, usdBalanceSum])

  const policyDuration = useMemo(() => (dailyCost > 0 ? floatUnits(totalAccountBalance, 18) / dailyCost : 0), [
    dailyCost,
    totalAccountBalance,
  ])

  // const projectedDailyCost = useMemo(() => {
  //   const numberifiedNewCoverageLimit = floatUnits(newCoverageLimit, 18)
  //   if (usdBalanceSum < numberifiedNewCoverageLimit) return usdBalanceSum * dailyRate
  //   return numberifiedNewCoverageLimit * dailyRate
  // }, [newCoverageLimit, dailyRate, usdBalanceSum])

  // const projectedPolicyDuration = useMemo(() => {
  //   const bnAmount = BigNumber.from(accurateMultiply(inputProps.amount, 18))
  //   return projectedDailyCost > 0 ? floatUnits(totalAccountBalance.add(bnAmount), 18) / projectedDailyCost : 0
  // }, [projectedDailyCost, totalAccountBalance, inputProps.amount])

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

  const editablePortfolioTotalBalance = useMemo(
    () =>
      editableProtocols.reduce(
        (total, protocol) =>
          (total += protocol.balanceUSD.length == 0 ? 0 : parseFloat(formatAmount(protocol.balanceUSD))),
        0
      ),
    [editableProtocols]
  )

  const editablePortfolioRiskLevel = useMemo(() => editableProtocols.reduce((pv, cv) => cv.tier + pv, 0), [
    editableProtocols,
  ])

  const tierColors = useTierColors(protocolMapSorted.map((p) => p.tier))

  /* if search value does not match or the one found protocol is already added, cannot add
   */
  const cannotAddPosition = useMemo(() => {
    const searchedProtocol = protocolMapFiltered.find((p) => p.appId.toLowerCase() == searchValue.toLowerCase())
    const protocolAlreadyAdded =
      searchedProtocol &&
      editableProtocols.find((p) => p.appId.toLowerCase() == searchedProtocol.appId.toLowerCase()) != undefined
    return searchedProtocol == undefined || protocolAlreadyAdded
  }, [editableProtocols, protocolMapFiltered, searchValue])

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

  const handleInputChange = (input: string) => {
    // allow only numbers and decimals
    const filtered = filterAmount(input, newPositionAmount)

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    setNewPositionAmount(filtered)
  }

  const addPosition = () => {
    const appId = capitalizeFirstLetter(protocolMapFiltered[0].appId)
    const balanceUSD = newPositionAmount == '' ? '0' : newPositionAmount
    const category = protocolMapFiltered[0].category
    const tier = protocolMapFiltered[0].tier
    setEditablePortfolio((editableProtocols) => [
      ...editableProtocols,
      {
        appId,
        balanceUSD,
        category,
        network: '',
        tier,
        erroneous: false,
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
      {isDesktop && !loading && editableProtocols && editableProtocols.length > 0 && (
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
            {editableProtocols.map((d: EditableProtocol, i) => (
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
                  <TableData style={{ color: getColorByTier(d.tier) }}>{d.tier == 0 ? 'Unrated' : d.tier}</TableData>
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
      )}
      {editableProtocols && (
        <Flex m={30} around>
          <Text bold>Total Portfolio Value</Text>
          <Text bold>{editablePortfolioTotalBalance}</Text>
          {/* <Text bold>{editablePortfolioRiskLevel}</Text> */}
        </Flex>
      )}
      <Flex gap={10} itemsCenter>
        <Text bold nowrap>
          Add Custom Position
        </Text>
        <HorizRule widthP={100} />
      </Flex>
      <GrayBgDiv style={{ borderRadius: '10px', padding: '16px', margin: '30px 0' }}>
        <Flex between>
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
            <Text t4>
              Page {currentPage + 1}/{numPages}
            </Text>
          </Flex>
          <Input
            placeholder={'Enter optional USD amount'}
            value={newPositionAmount}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <Button info secondary disabled={cannotAddPosition} onClick={addPosition}>
            Add
          </Button>
        </Flex>
        <Table canHover>
          <TableBody>
            {protocolMapPaginated.map((p: { appId: string; category: string; tier: number }, i) => (
              <TableRow
                key={i}
                onClick={() => setSearchValue(capitalizeFirstLetter(p.appId))}
                isHighlight={searchValue.toLowerCase() == p.appId.toLowerCase()}
                style={{ cursor: 'pointer' }}
              >
                <TableData>{capitalizeFirstLetter(p.appId)}</TableData>
                <TableData>{p.category}</TableData>
                {tierColors.length > 0 && (
                  <TableData style={{ color: getColorByTier(p.tier) }}>{p.tier == 0 ? 'Unrated' : p.tier}</TableData>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
