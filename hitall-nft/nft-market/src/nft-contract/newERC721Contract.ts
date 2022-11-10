import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import { NFTContract } from '../../../../generated/schema'
import { ERC721 } from '../../../../generated/hitall-nft/NFT/ERC721'

import { normalize } from '../helpers'

export function newERC721Contract(address: Address): NFTContract {
  log.debug('newERC721Contract: creating NFTContract entity {}', [address.toHex()])

  const entity = new NFTContract(address)
  const erc721 = ERC721.bind(address)

  entity.address = address.toHex()
  entity.standard = 'ERC721'
  const name = erc721.try_name()
  if (name.reverted) {
    log.warning('newERC721Contract: query ERC721({})::name() failure', [address.toHex()])
  } else {
    entity.name = normalize(name.value)
  }

  const symbol = erc721.try_symbol()
  if (symbol.reverted) {
    log.warning('newERC721Contract: query ERC721({})::symbol() failure', [address.toHex()])
  } else {
    entity.symbol = normalize(symbol.value)
  }

  entity.saleCounts = 0
  entity.saleAmounts = BigInt.zero()
  entity.volume = BigInt.zero()
  entity.fees = BigInt.zero()
  entity.royalties = BigInt.zero()
  entity.listingCounts = BigInt.zero()
  entity.nftCounts = BigInt.zero()

  entity.save()
  return entity
}
