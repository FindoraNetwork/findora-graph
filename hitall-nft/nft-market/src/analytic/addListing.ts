import { Address, BigInt } from '@graphprotocol/graph-ts'

import { NFTContract } from '../../../../generated/schema'

import touchDailyCollection from './touchDailyCollection'
import touchDailyMarket from './touchDailyMarket'
import { touchNFTContract } from '../nft-contract'

export default function addListing(collection: Address, timestamp: BigInt): void {
  const contract = touchNFTContract(collection) as NFTContract
  contract.listingCounts = contract.listingCounts.plus(BigInt.fromI32(1))
  contract.save()

  const dCollection = touchDailyCollection(timestamp, collection)
  dCollection.listings += 1
  dCollection.save()

  const dMarket = touchDailyMarket(timestamp)
  dMarket.listings += 1
  dMarket.save()
}
