import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import { NFTContract } from '../../../../generated/schema'

export function newERC1155Contract(address: Address): NFTContract {
  log.debug('newERC1155Contract: creating NFTContract entity {}', [address.toHex()])

  const entity = new NFTContract(address)

  entity.address = address.toHex()
  entity.standard = 'ERC1155'

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
