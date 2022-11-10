import { Address, log } from '@graphprotocol/graph-ts'
import { Account } from '../../../../generated/schema'

export function touchAccounts(addresses: Address[]): void {
  addresses.forEach((address) => {
    if (address.notEqual(Address.zero()) && !Account.load(address)) {
      log.debug('buildAccounts: creating Account entity {}', [address.toHex()])

      const account = new Account(address)

      account.save()
    }
  })
}
