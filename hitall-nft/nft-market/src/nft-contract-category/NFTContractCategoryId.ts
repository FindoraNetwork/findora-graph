import { Address, Bytes } from '@graphprotocol/graph-ts'

export default function NFTContractCategoryId(address: Address, categoryId: string): Bytes {
  return address
    .concat(Bytes.fromUTF8('_' + categoryId))
}
