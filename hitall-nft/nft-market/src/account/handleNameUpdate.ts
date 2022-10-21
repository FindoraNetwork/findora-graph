import { UpdateDisplayName } from '../../../../generated/hitall-nft/CMS/MarketManagement'
import { Account } from '../../../../generated/schema'

import { touchAccounts } from './touchAccounts'

export default function handleNameUpdate(event: UpdateDisplayName): void {
  const address = event.params.account
  const displayName = event.params.displayName

  touchAccounts([address])

  const target = Account.load(address) as Account
  target.display = displayName
  target.save()
}
