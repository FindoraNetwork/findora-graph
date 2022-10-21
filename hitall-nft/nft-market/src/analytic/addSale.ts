import { Address, BigInt } from '@graphprotocol/graph-ts'

import { NFTContract } from '../../../../generated/schema'

import touchDailyCollection from './touchDailyCollection'
import touchDailyMarket from './touchDailyMarket'
import { touchNFTContract } from '../nft-contract'

export default function addSale(
  collection: Address,
  timestamp: BigInt,
  saleAmounts: BigInt,
  volume: BigInt, // in USD
  fees: BigInt // in USD
): void {
  const contract = touchNFTContract(collection) as NFTContract
  if (contract.listingCounts.gt(BigInt.zero())) {
    contract.listingCounts = contract.listingCounts.minus(BigInt.fromI32(1))
    contract.save()
  }

  const dCollection = touchDailyCollection(timestamp, collection)
  dCollection.saleCounts += 1
  dCollection.saleAmounts = dCollection.saleAmounts.plus(saleAmounts)
  dCollection.volume = dCollection.volume.plus(volume)
  dCollection.fees = dCollection.fees.plus(fees)

  const avgPrice = volume.div(saleAmounts)
  if (!dCollection.floorPrice || (dCollection.floorPrice as BigInt).gt(avgPrice))
    dCollection.floorPrice = avgPrice
  if (!dCollection.priceCeiling || (dCollection.priceCeiling as BigInt).lt(avgPrice))
    dCollection.priceCeiling = avgPrice
  dCollection.avgPrice = dCollection.volume.div(dCollection.saleAmounts)
  dCollection.save()

  const dMarket = touchDailyMarket(timestamp)
  dMarket.sales += 1
  dMarket.volume = dMarket.volume.plus(volume)
  dMarket.fees = dMarket.fees.plus(fees)
  dMarket.save()
}
