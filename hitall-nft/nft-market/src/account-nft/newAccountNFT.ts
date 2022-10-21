import { Address, Bytes, BigInt, log } from '@graphprotocol/graph-ts'

import { AccountNFT } from '../../../../generated/schema'

export function newAccountNFT(
  id: Bytes,
  account: Address,
  nftId: string,
  amount: BigInt = BigInt.zero()
): AccountNFT {
  log.debug('newAccountNFT: creating AccountNFT entity {}', [id.toHex()])

  const entity = new AccountNFT(id)
  entity.account = account
  entity.nft = nftId
  entity.amount = amount

  entity.save()
  return entity
}
