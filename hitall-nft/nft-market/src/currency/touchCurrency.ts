import { Address, log } from '@graphprotocol/graph-ts'

import { Currency } from '../../../../generated/schema'
import { ERC20 } from '../../../../generated/hitall-nft/Market721/ERC20'

import { normalize } from '../helpers'

export default function touchCurrency(address: Address): Currency {
  return (
    Currency.load(address)
    || newCurrency(address)
  ) as Currency
}

function newCurrency(address: Address): Currency {
  const entity = new Currency(address)
  const erc20 = ERC20.bind(address)

  entity.address = address.toHex()

  const name = erc20.try_name()
  if (name.reverted) {
    log.warning('newCurrency: query ERC20({})::name() failure', [address.toHex()])
  } else {
    entity.name = normalize(name.value)
  }

  const symbol = erc20.try_symbol()
  if (symbol.reverted) {
    log.warning('newCurrency: query ERC20({})::symbol() failure', [address.toHex()])
  } else {
    entity.symbol = normalize(symbol.value)
  }

  const decimals = erc20.try_decimals()
  if (decimals.reverted) {
    log.warning('newCurrency: query ERC20({})::decimals() failure', [address.toHex()])
  } else {
    entity.decimals = decimals.value
  }

  entity.save()
  return entity
}
