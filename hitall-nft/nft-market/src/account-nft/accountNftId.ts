import { Address, Bytes } from '@graphprotocol/graph-ts'

export function accountNftId(account: Address, nftId: string): Bytes {
  return account
    .concat(Bytes.fromUTF8('_'))
    .concat(Bytes.fromUTF8(nftId))
}
