import { Bytes } from '@graphprotocol/graph-ts'

import { Bid, Listing } from '../../../../generated/schema'
import { CancelBidToken } from '../../../../generated/hitall-nft/Market721/ExchangeNFT721s'

import { touchAccounts } from '../account'
import { newActivity } from '../activity'
import { touch721 } from '../nft'

export default function handle721CancelBid(ev: CancelBidToken): void {
  const timestamp = ev.block.timestamp
  const nftAddress = ev.params.nftToken
  const bidder = ev.params.bidder
  const nftTokenId = ev.params.tokenId

  touchAccounts([bidder])
  const nft = touch721(nftAddress, nftTokenId, timestamp)

  if (nft.activeListings.length > 0) {
    const listing = Listing.load(nft.activeListings[0])

    if (listing && Array.isArray(listing.bids)) {
      for (let i = 0; i < (listing.bids as Bytes[]).length; i++) {
        const bid = Bid.load((listing.bids as Bytes[])[i])
        if (bid && bid.status === 'open' && bid.bidder.equals(bidder)) {
          bid.status = 'cancelled'
          bid.updatedAt = timestamp;
          bid.save()
        }
      }
    }
  }

  newActivity(nft.id, 'cancelOffer', timestamp, bidder)
}
