import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { Bid } from '../../../../generated/schema'

export default function newBid(
  nftAddress: Address,
  nftId: string,
  listing: Bytes|null,
  amount: BigInt,
  bidder: Address,
  seller: Address|null,
  currency: Address,
  price: BigInt,
  timestamp: BigInt,
  tx: Bytes
): Bid {
  const bid = new Bid(nftAddress.concat(bidder).concat(tx))
  bid.status = 'open'
  if (listing) bid.target = listing
  bid.nft = nftId
  bid.amount = amount
  bid.bidder = bidder
  if (seller) bid.seller = seller
  bid.currency = currency
  bid.price = price
  bid.avgPrice = price.div(amount)
  bid.createdAt = timestamp
  bid.updatedAt = timestamp

  bid.save()
  return bid
}
