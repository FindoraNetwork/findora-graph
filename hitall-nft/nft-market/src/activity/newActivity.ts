import { Address, Bytes, BigInt } from '@graphprotocol/graph-ts'

import { Activity } from '../../../../generated/schema'

function findAvailableId(base: Bytes): Bytes {
  let i = 0
  for (; Activity.load(base.concat(Bytes.fromI32(i))); i++) {}
  return base.concat(Bytes.fromI32(i))
}

export function newActivity(
  nftId: string,
  actType: string,
  timestamp: BigInt,
  from: Address|null = null,
  to: Address|null = null,
  currency: Address|null = null,
  price: BigInt|null = null
): Activity {
  const id = findAvailableId(
    Bytes.fromUTF8(nftId)
      .concat(Bytes.fromUTF8(actType))
      .concatI32(timestamp.toI32())
  )

  const act = new Activity(id)

  act.nft = nftId
  act.type = actType
  act.timestamp = timestamp.toU32()

  if (from) act.from = from.toHex()
  if (to) act.to = to.toHex()
  if (currency) act.currency = currency.toHex()
  if (price) act.price = price

  act.save()
  return act
}
