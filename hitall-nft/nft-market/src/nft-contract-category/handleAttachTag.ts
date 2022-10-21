import { log } from '@graphprotocol/graph-ts'

import { AttachTag } from '../../../../generated/hitall-nft/CMS/MarketManagement'
import { NFTContractCategory } from '../../../../generated/schema'

import { touchCategory } from '../category'
import { touchNFTContract } from '../nft-contract'
import NFTContractCategoryId from './NFTContractCategoryId'

export default function handleAttachTag(event: AttachTag): void {
  const address = event.params.collection
  const tag = event.params.tag

  const collection = touchNFTContract(address)
  if (!collection) return

  const category = touchCategory(tag)

  const id = NFTContractCategoryId(address, category.id)
  const link = new NFTContractCategory(id)
  link.tag = category.id
  link.contract = address
  link.save()
}
