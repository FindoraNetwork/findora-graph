import { Address, BigInt } from "@graphprotocol/graph-ts";

import { NFTContract } from '../../../../generated/schema'

import { touchNFTContract } from '../nft-contract'

export default function removeListing(collection: Address, timestamp: BigInt): void {
  const contract = touchNFTContract(collection) as NFTContract
  if (contract.listingCounts.gt(BigInt.zero())) {
    contract.listingCounts = contract.listingCounts.minus(BigInt.fromI32(1))
    contract.save()
  }
}
