import { Address, BigInt, log, TypedMap } from '@graphprotocol/graph-ts'

import { Oracle } from '../../../generated/hitall-nft/Market721/Oracle'

import { touchCurrency } from './currency'

/**
 * Clean up and normalize graph-node unsuppported chars.
 */
export function normalize(str: string): string {
  if (str.length === 1 && str.charCodeAt(0) === 0) return ''

  return str
    .split('')
    .map<string>((char: string): string => char.charCodeAt(0) === 0 ? '\ufffd' : char)
    .join('')
}

const secondsADay = BigInt.fromI32(86400)
export function dateOf(timestamp: BigInt): BigInt {
  return timestamp
    .div(secondsADay)
    .times(secondsADay)
}

const oracle = Oracle.bind(Address.fromString('0xD947a4d165D7bE793C551247208eCf22b21fcbfe'))

const queries = new TypedMap<string, string>()
queries.set('0x0000000000000000000000000000000000001000', 'FRA')
queries.set('0xccc94d78b01d94330f25f7b8e827ef24249132de', 'FAIRY')
queries.set('0xabc979788c7089b516b8f2f1b5ceabd2e27fd78b', 'BNB')
queries.set('0x008a628826e9470337e0cd9c0c944143a83f32f3', 'ETH')


const lastPrices = new TypedMap<string, BigInt>()
const oneEther = BigInt.fromI32(10).pow(18)
lastPrices.set('0x0000000000000000000000000000000000001000', oneEther)
lastPrices.set('0xccc94d78b01d94330f25f7b8e827ef24249132de', oneEther)
lastPrices.set('0x008a628826e9470337e0cd9c0c944143a83f32f3', oneEther)
lastPrices.set('0xabc979788c7089b516b8f2f1b5ceabd2e27fd78b', oneEther)

export function priceOf(currency: Address, amount: BigInt): BigInt {
  const erc20 = touchCurrency(currency)
  const decimals = (erc20.decimals || 18) as u8

  const address = currency.toHex()
  if (!queries.isSet(address)) {
    // No oracle support, we assume it is stable coins
    // simplily normalize its amounts to decimal 18 based.
    return amount.times(
      BigInt.fromI32(10).pow(18 - decimals)
    )
  }

  const queryString = queries.get(address) as string

  const oraclePrice = oracle.try_getPrice(queryString)
  if (oraclePrice.reverted) {
    log.warning('priceOf: query {} price failure', [queryString])
  } else {
    lastPrices.set(address, oraclePrice.value.getValue0())
  }

  const basePrice = lastPrices.isSet(address)
    ? lastPrices.get(address) as BigInt
    : oneEther

  return basePrice
    .times(amount)
    .div(BigInt.fromI32(10).pow(decimals))
}
