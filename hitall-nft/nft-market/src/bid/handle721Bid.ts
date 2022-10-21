import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'

import { Bid, Listing } from '../../../../generated/schema'
import { Bid as BidEvent } from '../../../../generated/hitall-nft/Market721/ExchangeNFT721s'

import { touchAccounts } from '../account'
import { newActivity } from '../activity'
import { touch721 } from '../nft'
import newBid from './newBid'

export default function handle721Bid(event: BidEvent): void {
  const tx = event.transaction.hash
  const timestamp = event.block.timestamp
  const nftAddress = event.params.nftToken
  const nftTokenId = event.params.tokenId
  const nftAmount = BigInt.fromI32(1)
  const bidder = event.params.bidder
  const currency = event.params.quoteToken
  const price = event.params.price

  touchAccounts([bidder])
  const nft = touch721(nftAddress, nftTokenId, timestamp)
  const listing = nft.activeListings.length > 0 ? Listing.load(nft.activeListings[0] as Bytes) : null
  const seller = listing ? listing.owner : null

  const existingBid = findAccountBid(bidder, listing)

  if (existingBid) {
    // UPDATE BID
    existingBid.currency = currency
    existingBid.price = price
    existingBid.avgPrice = price
    existingBid.updatedAt = timestamp
    existingBid.save()

    newActivity(nft.id, 'updateOffer', timestamp, bidder, Address.fromBytes(seller as Bytes), currency, price)
  } else {
    // NEW BID
    newBid(
      nftAddress,
      nft.id,
      listing ? listing.id : null,
      nftAmount,
      bidder,
      seller ? Address.fromBytes(seller as Bytes) : null,
      currency,
      price,
      timestamp,
      tx
    )

    newActivity(
      nft.id,
      'offer',
      timestamp,
      bidder,
      seller ? Address.fromBytes(seller as Bytes) : null,
      currency,
      price
    )
  }
}

function findAccountBid(account: Address, listing: Listing|null): Bid|null {
  if (!listing || !Array.isArray(listing.bids)) return null

  for (let i = 0; i < (listing.bids as Bytes[]).length; i++) {
    const bid = Bid.load((listing.bids as Bytes[])[i])

    if (bid && bid.status === 'open' && bid.bidder.equals(account)) return bid
  }
  return null
}
