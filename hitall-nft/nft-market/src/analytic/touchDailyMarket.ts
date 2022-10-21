import { BigInt } from '@graphprotocol/graph-ts'

import { AnalyticDailyMarket } from '../../../../generated/schema'

import { dateOf } from '../helpers'

export default function touchDailyMarket(timestamp: BigInt): AnalyticDailyMarket {
  const date = dateOf(timestamp).toI32()

  return (
    AnalyticDailyMarket.load(date.toString())
    || newDailyMarket(date)
  ) as AnalyticDailyMarket
}

function newDailyMarket(timestamp: i32): AnalyticDailyMarket {
  const entity = new AnalyticDailyMarket(timestamp.toString())
  entity.date = timestamp

  entity.listings = 0
  entity.sales = 0
  entity.volume = BigInt.zero()
  entity.fees = BigInt.zero()
  entity.royalties = BigInt.zero()
  entity.save()

  return entity
}
