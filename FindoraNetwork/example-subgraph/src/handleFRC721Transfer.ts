import { Address } from '@graphprotocol/graph-ts'

import { Account, NFT, NFTContract } from '../../../generated/schema'
import { FRC721, Transfer } from '../../../generated/FindoraNetwork/example-subgraph/FRC721'

export default function handleFRC721Transfer(event: Transfer): void {
  const evAddress = event.address
  const addressFrom = event.params.from
  const addressTo = event.params.to
  const tokenId = event.params.tokenId

  const frc721 = FRC721.bind(evAddress)

  let contract = NFTContract.load(evAddress)
  if (!contract) {
    contract = new NFTContract(evAddress)

    const name = frc721.try_name()
    if (!name.reverted) contract.name = name.value

    const symbol = frc721.try_symbol()
    if (!symbol.reverted) contract.symbol = symbol.value

    contract.save()
  }

  if (
    addressFrom.notEqual(Address.zero())
    && addressFrom.notEqual(evAddress)
    && !Account.load(addressFrom)
  ) {
    const account = new Account(addressFrom)
    account.save()
  }

  if (
    addressTo.notEqual(Address.zero())
    && addressTo.notEqual(evAddress)
    && !Account.load(addressTo)
  ) {
    const account = new Account(addressTo)
    account.save()
  }

  const nftId = evAddress.toHex() + '_' + tokenId.toString()
  let nft = NFT.load(nftId)
  if (!nft) {
    nft = new NFT(nftId)
    nft.contract = evAddress
    nft.tokenId = tokenId

    const uri = frc721.try_tokenURI(tokenId)
    if (!uri.reverted) nft.uri = uri.value
  }

  if (addressTo.equals(Address.zero()) || addressTo.equals(evAddress)) {
    nft.owner = null
  } else {
    nft.owner = addressTo
  }

  nft.save()
}
