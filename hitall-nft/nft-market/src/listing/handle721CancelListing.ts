import { Bytes } from '@graphprotocol/graph-ts'

import { Bid, Listing } from '../../../../generated/schema'
import { CancelSellToken } from '../../../../generated/hitall-nft/Market721/ExchangeNFT721s'

import { newActivity } from '../activity'
import { removeListing } from '../analytic'
import { touch721 } from '../nft'

export default function handle721CancelListing(event: CancelSellToken): void {
  const timestamp = event.block.timestamp
  const nftAddress = event.params.nftToken
  const nftId = event.params.tokenId
  const currency = event.params.quoteToken
  const seller = event.params.seller
  const price = event.params.price

  const nft = touch721(nftAddress, nftId, timestamp)

  const newActiveListing: Bytes[] = []
  for (let i = 0; i < nft.activeListings.length; i++) {
    const listing = Listing.load(nft.activeListings[i] as Bytes)
    if (listing) {
      if (listing.owner.equals(seller)) {
        if (Array.isArray(listing.bids)) {
          for (let j = 0; j < (listing.bids as Bytes[]).length; j++) {
            const bid = Bid.load((listing.bids as Bytes[])[j])
            if (bid && bid.status === 'open') {
              bid.status = 'terminated'
              bid.updatedAt = timestamp
              bid.save()
            }
          }
        }

        listing.status = 'cancelled'
        listing.updatedAt = timestamp
        listing.save()
      } else {
        newActiveListing.push(listing.id)
      }
    }
  }

  nft.activeListings = newActiveListing
  nft.save()

  removeListing(nftAddress, timestamp)
  newActivity(nft.id, 'cancelListing', timestamp, seller, null, currency, price)
}
