import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

export function listing721Id(nftId: string, tx: Bytes): Bytes {
  return Bytes.fromUTF8(nftId)
    .concat(Bytes.fromUTF8('_'))
    .concat(tx)
}

export function listing1155Id(nftAddress: Address, orderId: BigInt): Bytes {
  return nftAddress.concat(Bytes.fromBigInt(orderId) as Bytes)
}
