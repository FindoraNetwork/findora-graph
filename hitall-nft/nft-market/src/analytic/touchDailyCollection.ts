import { Address, BigInt } from '@graphprotocol/graph-ts'

import { AnalyticDailyCollection } from '../../../../generated/schema'

import { dateOf } from '../helpers'

export default function touchDailyCollection(timestamp: BigInt, collection: Address): AnalyticDailyCollection {
  const seconds = dateOf(timestamp).toI32()
  const id = collection.toHex() + '_' + seconds.toString()

  return (
    AnalyticDailyCollection.load(id)
    || newDailyCollection(id, seconds, collection)
  ) as AnalyticDailyCollection
}

function newDailyCollection(id: string, date: i32, collection: Address): AnalyticDailyCollection {
  const entity = new AnalyticDailyCollection(id)
  entity.date = date
  entity.collection = collection

  entity.listings = 0
  entity.saleCounts = 0
  entity.saleAmounts = BigInt.zero()
  entity.volume = BigInt.zero()
  entity.fees = BigInt.zero()
  entity.royalties = BigInt.zero()
  entity.save()

  return entity
}
