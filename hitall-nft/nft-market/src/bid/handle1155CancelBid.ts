import { Bytes } from '@graphprotocol/graph-ts'

import { Bid, Listing, NFT } from '../../../../generated/schema'
import { CancelBidToken } from '../../../../generated/hitall-nft/Market1155/ExchangeNFT1155s'

import { touchAccounts } from '../account'
import { newActivity } from '../activity'
import { listing1155Id } from '../listing'

export default function handle1155CancelBid(ev: CancelBidToken): void {
  const timestamp = ev.block.timestamp
  const nftAddress = ev.params.nftToken
  const bidder = ev.params.bidder
  const orderId = ev.params.orderId

  touchAccounts([bidder])
  const listingId = listing1155Id(nftAddress, orderId)
  const listing = Listing.load(listingId)

  if (listing && Array.isArray(listing.bids)) {
    for (let i = 0; i < (listing.bids as Bytes[]).length; i++) {
      const bid = Bid.load((listing.bids as Bytes[])[i])
      if (bid && bid.status === 'open' && bid.bidder.equals(bidder)) {
        bid.status = 'cancelled'
        bid.updatedAt = timestamp;
        bid.save()
      }
    }

    const nft = NFT.load(listing.nft)
    if (nft) {
      nft.updatedAt = timestamp
      nft.save()

      newActivity(nft.id, 'cancelOffer', timestamp, bidder)
    }
  }
}
