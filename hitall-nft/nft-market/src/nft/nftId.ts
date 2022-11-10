import { Address, BigInt } from '@graphprotocol/graph-ts'

export function nftId(address: Address, tokenId: BigInt): string {
  return address.toHex() + '_' + tokenId.toString()
}
