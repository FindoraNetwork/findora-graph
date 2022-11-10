import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { AccountCashflow } from '../../../../generated/schema';

export default function touchAccountCashflow(account: Address, currency: Address): AccountCashflow {
  const id = account
    .concat(Bytes.fromUTF8('_'))
    .concat(currency)

  return (
    AccountCashflow.load(id)
    || newAccountCashflow(id, account, currency)
  ) as AccountCashflow
}

function newAccountCashflow(id: Bytes, account: Address, currency: Address): AccountCashflow {
  const cash = new AccountCashflow(id)
  cash.currency = currency
  cash.account = account

  cash.spent = BigInt.zero()
  cash.earned = BigInt.zero()
  cash.income = BigInt.zero()
  cash.save()

  return cash
}
