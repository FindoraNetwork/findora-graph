import { BigInt } from '@graphprotocol/graph-ts'

import { Ask } from '../../../../generated/hitall-nft/Market1155/ExchangeNFT1155s'
import { Listing } from '../../../../generated/schema'

import { addListing } from '../analytic'
import { newActivity } from '../activity'
import { touch1155 } from '../nft'
import newListing from './newListing'

/**
 * Ask event:
 *   - readyToSellToken ==> New Listing
 *   - setCurrentPrice  ==> Update Listing
 */
export default function handle1155Listing(event: Ask): void {
  const tx = event.transaction.hash
  const timestamp = event.block.timestamp
  const nftAddress = event.params.nftToken
  const nftId = event.params.tokenId
  const nftAmount = event.params.amount
  const currency = event.params.quoteToken
  const seller = event.params.seller
  const price = event.params.price
  const orderId = event.params.orderId
  const status = event.params.selleStatus

  const listingType = status.isZero() ? 'All' : 'BidOnly'

  const nft = touch1155(nftAddress, nftId, timestamp)
  for (let i = 0; i < nft.activeListings.length; i++) {
    const lastListing = Listing.load(nft.activeListings[i])
    if (lastListing && lastListing.orderId && (lastListing.orderId as BigInt).equals(orderId)) {
      /// Updating price
      lastListing.currency = currency
      lastListing.price = price
      lastListing.amount = nftAmount
      lastListing.updatedAt = timestamp
      lastListing.save()

      newActivity(nft.id, 'updateListing', timestamp, seller, null, currency, price)
      return
    }
  }

  const listing = newListing(
    '1155',
    nftAddress,
    nft.id,
    seller,
    tx,
    timestamp,
    nftAmount,
    currency,
    price,
    listingType,
    orderId
  )
  nft.activeListings.push(listing.id)
  nft.save()

  addListing(nftAddress, timestamp)
  newActivity(nft.id, 'listing', timestamp, seller, null, currency, price)
}
