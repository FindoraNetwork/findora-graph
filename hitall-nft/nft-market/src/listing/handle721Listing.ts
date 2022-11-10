import { BigInt, Bytes } from '@graphprotocol/graph-ts'

import { Listing } from '../../../../generated/schema'
import { Ask } from '../../../../generated/hitall-nft/Market721/ExchangeNFT721s'

import { addListing } from '../analytic'
import { newActivity } from '../activity'
import { touch721 } from '../nft'
import newListing from './newListing'

/**
 * Ask event:
 *   - readyToSellToken ==> New Listing
 *   - setCurrentPrice  ==> Update Listing
 */
export default function handle721Listing(event: Ask): void {
  const tx = event.transaction.hash
  const timestamp = event.block.timestamp
  const nftAddress = event.params.nftToken
  const currency = event.params.quoteToken
  const seller = event.params.seller
  const nftId = event.params.tokenId
  const price = event.params.price
  const status = event.params.selleStatus

  const listingType = status.isZero() ? 'All' : 'BidOnly'

  const nft = touch721(nftAddress, nftId, timestamp)

  if (nft.activeListings.length > 0) {
    const lastListing = Listing.load(nft.activeListings[0] as Bytes)
    if (lastListing && lastListing.status === 'open') {

      /// Updating price
      if (lastListing.owner.equals(seller)) {
          lastListing.currency = currency
          lastListing.price = price
          lastListing.updatedAt = timestamp
          lastListing.save()

          newActivity(nft.id, 'updateListing', timestamp, seller, null, currency, price)
          return
      }

      lastListing.status = 'cancelled'
      lastListing.save()
    }
  }

  const listing = newListing(
    '721',
    nftAddress,
    nft.id,
    seller,
    tx,
    timestamp,
    BigInt.fromI32(1),
    currency,
    price,
    listingType
  )
  nft.activeListings = [listing.id]
  nft.save()

  addListing(nftAddress, timestamp)
  newActivity(nft.id, 'listing', timestamp, seller, null, currency, price)
}
