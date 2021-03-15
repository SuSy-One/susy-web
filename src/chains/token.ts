import { assetBalance } from '@waves/waves-transactions/dist/nodeInteraction'
import { AvailableChains, Chain } from './chain'

interface ChainBridgeConfig {
  sourcePort: string
  destinationPort: string
}

export type Token = {
  ticker: string
  label: string
  icon: string
  bg: string
  decimals: number
  assetId: string
  ERC20?: string
  bridge?: GatewayBridge[]
}

export class GatewayBridge {
  origin: Chain
  destination: Chain
  cfg: ChainBridgeConfig

  constructor({
    origin,
    destination,
    cfg,
  }: {
    origin: Chain
    destination: Chain
    cfg: ChainBridgeConfig
  }) {
    this.origin = origin
    this.destination = destination
    this.cfg = cfg
  }
}

export const availableOriginChains = (bridge?: GatewayBridge[]) => {
  return (
    bridge?.reduce((acc: Chain[], current: GatewayBridge) => {
      const existing = acc.map((x) => x.id)

      if (!existing.includes(current.origin.id)) {
        return [...acc, current.origin]
      }

      return acc
    }, []) ?? []
  )
}
export const availableDestChains = (bridge?: GatewayBridge[]) => {
  return bridge?.map((x: GatewayBridge) => x.destination) ?? []
}
export const pickBridgeGateway = (bridgeList: GatewayBridge[], origin: Chain, dest: Chain): GatewayBridge | null => {
  for (const bridge of bridgeList) {
    if (bridge.destination.id === dest.id && bridge.origin.id === origin.id) {
      return bridge
    }
  }

  return null
}

export const AvailableTokens: Record<string, Token> = {
  SignTestnet: {
    ticker: 'SIGN',
    label: 'SIGN Testnet',
    icon: '/img/icons/signature-chain.svg',
    bg: 'black',
    decimals: 8,
    assetId: 'Gf9t8FA4H3ssoZPCwrg3KwUFCci8zuUFP9ssRsUY3s6a',
  },
  SignStagenet: {
    ticker: 'SIGN',
    label: 'SIGN Stagenet',
    icon: '/img/icons/signature-chain.svg',
    bg: 'black',
    assetId: '6x8nupBUrX3u1VQcL4jFsf9UyyqacUNbVsKB9WHJ61Qm',
    ERC20: '0xc2dda926711eb9b94b89c886aabb8b11d6ac014d',
    decimals: 8,
  },
  SignMainnet: {
    ticker: 'SIGN',
    label: 'SIGN Mainnet',
    icon: '/img/icons/signature-chain.svg',
    bg: 'black',
    assetId: '9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y',
    ERC20: '0x29499dD7da98588077806a9Fd45048692b443A3F',
    decimals: 8,
  },
  SusyStagenet: {
    ticker: 'SIGN',
    label: 'SuSy token Stagenet',
    icon: '/img/icons/waves.svg',
    bg: 'black',
    assetId: 'Ftnm2XbEWTF54z84UHg7LwPcuBZicXEgvhUdmFt84EWH',
    decimals: 8,
  },
  WBNBStagenet: {
    ticker: 'WBNB',
    label: 'WBNB Stagenet',
    icon: 'https://cryptoai.trade/wp-content/uploads/2020/03/bnb-2.png',
    bg: 'black',
    assetId: 'Ap4heStRGQbHAxR6qb9UFtJ3kBiGuumdnsd9JzTHwTTL',
    ERC20: '0x8478f3C11F167da1C7C2c57F5FB3a34B584A4217',
    decimals: 6,
  },
  NSBTLegacyMainnet: {
    ticker: 'NSBT',
    label: 'NSBT (LEGACY)',
    bg: 'black',
    icon: '/img/icons/tokens/nsbt.svg',
    assetId: '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g',
    ERC20: '0x496d451dDAB0F79346f773CbC2eb7Aee58446019',
    decimals: 6,
    bridge: [
      new GatewayBridge({
        origin: AvailableChains.Waves,
        destination: AvailableChains.BSC,
        cfg: {
          sourcePort: '3PPUsj1yjMMAAg2hihdebK7n8zkAagHqdNT',
          destinationPort: '0x59622815BADB181a2c37052136a9480C6A4a4eA6',
        },
      }),
    ],
  },
  gwaNSBTMainnet: {
    ticker: 'gwaNSBT',
    label: 'gwaNSBT',
    bg: 'black',
    icon: '/img/icons/tokens/nsbt.svg',
    assetId: '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g',
    ERC20: '0xaDb688CC2D5A729d7e5ddEcDA8B63ED118F41eA4',
    decimals: 6,
    bridge: [
      new GatewayBridge({
        origin: AvailableChains.Waves,
        destination: AvailableChains.BSC,
        cfg: {
          sourcePort: '3PRGPGtsVZVUCFRsEKp1FHccv6uFu8YNqb1',
          destinationPort: '0xf427525Eb648d14c1Da28E530e9fe7ab9832c411',
        },
      }),
    ],
  },
  USDNMainnet: {
    ticker: 'USDN',
    label: 'USDN',
    bg: 'black',
    icon: '/img/icons/tokens/usdn.svg',
    assetId: 'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p',
    ERC20: '0xc4b6F32B84657E9f6a73fE119f0967bE5bA8CF05',
    decimals: 6,
    bridge: [
      new GatewayBridge({
        origin: AvailableChains.Waves,
        destination: AvailableChains.BSC,
        cfg: {
          sourcePort: '3PEXiW1BrBNMo5A9dfj2CnBW2mwMiaf2sAe',
          destinationPort: '0x8c0e11a6E692d02f71598AB5050083ED691Eb760',
        },
      }),
      new GatewayBridge({
        origin: AvailableChains.Waves,
        destination: AvailableChains.Heco,
        cfg: {
          sourcePort: '3PEXiW1BrBNMo5A9dfj2CnBW2mwMiaf2sAe',
          destinationPort: '0x8c0e11a6E692d02f71598AB5050083ED691Eb760',
        },
      }),
      new GatewayBridge({
        origin: AvailableChains.Waves,
        destination: AvailableChains.Fantom,
        cfg: {
          sourcePort: '3PEXiW1BrBNMo5A9dfj2CnBW2mwMiaf2sAe',
          destinationPort: '0x8c0e11a6E692d02f71598AB5050083ED691Eb760',
        },
      }),
    ],
  },
}

export function formLinkForChain(chain: Chain, address: string): string {
  switch (chain.id) {
    case AvailableChains.BSC.id:
      return `https://bscscan.com/address/${address}#tokentxns`
    case AvailableChains.Ethereum.id:
      return `https://etherscan.io/address/${address}#tokentxns`
    case AvailableChains.Waves.id:
      return `https://wavesexplorer.com/address/${address}`
    case AvailableChains.Heco.id:
      return `https://hecoinfo.com/address/${address}#tokentxns`
    case AvailableChains.Fantom.id:
      return `https://ftmscan.com/address/${address}#tokentxns`
  }

  return ''
}

export function getAvailableTokens(): Token[] {
  return [
    AvailableTokens.USDNMainnet,
    AvailableTokens.gwaNSBTMainnet,
    AvailableTokens.NSBTLegacyMainnet,
  ]
    // UI requires visible tokens to represent bridge config
    .filter(x => (x.bridge ?? []).length > 0 )
}
