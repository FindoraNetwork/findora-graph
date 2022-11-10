import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { Bid, Listing, NFT } from '../../../../generated/schema'
import { Bid as BidEvent } from '../../../../generated/hitall-nft/Market1155/ExchangeNFT1155s'

import { touchAccounts } from '../account'
import { newActivity } from '../activity'
import newBid from './newBid'
import { listing1155Id } from '../listing'

export default function handle1155Bid(event: BidEvent): void {
  const tx = event.transaction.hash
  const timestamp = event.block.timestamp
  const nftAddress = event.params.nftToken
  const orderId = event.params.orderId
  const bidder = event.params.bidder
  const currency = event.params.quoteToken
  const price = event.params.price

  touchAccounts([bidder])
  const listingId = listing1155Id(nftAddress, orderId)
  const listing = Listing.load(listingId)

  const seller = listing ? listing.owner : null
  const nft = listing ? NFT.load(listing.nft) : null

  const existingBid = findAccountBid(bidder, listing)

  if (existingBid) {
    // UPDATE BID
    existingBid.currency = currency
    existingBid.price = price
    existingBid.avgPrice = price.div((listing as Listing).amount as BigInt)
    existingBid.updatedAt = timestamp
    existingBid.save()

    if (nft) {
      newActivity(nft.id, 'updateOffer', timestamp, bidder, Address.fromBytes(seller as Bytes), currency, price)
      nft.updatedAt = timestamp
      nft.save()
    }
  } else if (nft) {
    // NEW BID
    newBid(
      nftAddress,
      (nft as NFT).id,
      listingId,
      (listing as Listing).amount,
      bidder,
      Address.fromBytes(seller as Bytes),
      currency,
      price,
      timestamp,
      tx
    )

    nft.updatedAt = timestamp
    nft.save()
    newActivity(
      nft.id,
      'offer',
      timestamp,
      bidder,
      Address.fromBytes(seller as Bytes),
      currency,
      price
    )
  }
}

function findAccountBid(account: Address, listing: Listing | null): Bid | null {
  if (!listing || !Array.isArray(listing.bids)) return null

  for (let i = 0; i < (listing.bids as Bytes[]).length; i++) {
    const bid = Bid.load((listing.bids as Bytes[])[i])

    if (bid && bid.status === 'open' && bid.bidder.equals(account)) return bid
  }
  return null
}
