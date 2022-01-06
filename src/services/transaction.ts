import currency from 'currency.js'

export interface User {
  email: string
  uid: string
  photoURL: string | null
  displayName: string
}

export interface ExpenseTrans {
  id: string
  action: string
  reviewed: boolean
  desc: string
  type: 'Cash' | 'Bank Card' | 'Internet Transfer' | 'Cheque'
  date: Date
  amount: currency
  GST: currency
  cheque: string | null
  receipt: boolean
  receiptURL: string
  category: 'Expense'
  payTo: string | null
  budget: string | null
  currency: string
  deleted: boolean
  submittedBy: User
}
export interface IncomeTrans {
  action: string
  id: string
  reviewed: boolean
  desc: string
  type: 'Cash' | 'Bank Card' | 'Internet Transfer' | 'Cheque'
  date: Date
  amount: currency
  GST: currency
  category: 'Income'
  budget: string | null
  currency: string
  deleted: boolean
  submittedBy: User
}
export interface JournalTrans {
  action: string
  id: string
  reviewed: boolean
  desc: string
  type: 'Cash' | 'Bank Card' | 'Internet Transfer' | 'Cheque'
  date: Date
  amount: currency
  GST: currency
  cheque: string | null
  category: 'Journal'
  from: string | null
  to: string | null
  currency: string
  deleted: boolean
  submittedBy: User
}
export interface TransactionList {
  [key: string]: Transaction
  [Symbol.iterator](): IterableIterator<Transaction>
}
// export const converter = {
//   toFirestore: (transaction: Transaction) => {
//       return {
//           // label: transaction.label,
//           // type: transaction.type,
//           // budget: transaction.budget,
//           // balance: transaction.balance,
//           // expenses: transaction.expenses
//           };
//   },
//   fromFirestore: (
//     snapshot: QueryDocumentSnapshot<Transaction>,
//     options: SnapshotOptions
//   ) => {
//       const data = snapshot.data()!;
//       return new Transaction(data);
//   }
// };

import {
  DocumentReference,
  CollectionReference,
  Query,
  updateDoc,
  addDoc,
} from '@firebase/firestore'
import { collection, doc } from 'rxfire/firestore'

export class Transaction {
  id: string
  action: string
  reviewed: boolean
  desc: string
  type: 'Cash' | 'Bank Card' | 'Internet Transfer' | 'Cheque'
  date: Date
  amount: currency
  GST: currency
  cheque: string | null
  receipt: boolean
  receiptURL: string
  category: 'Income' | 'Journal' | 'Expense'
  payTo: string | null
  budget: string | null
  from: string | null
  to: string | null
  currency: string
  deleted: boolean
  submittedBy: User;
  [index: string]: any

  constructor(_trans: ExpenseTrans | IncomeTrans | JournalTrans | Transaction) {
    this.id = _trans.id || ''
    this.action = _trans.action ? _trans.action : ''
    this.reviewed = _trans.reviewed || false
    this.desc = _trans.desc || ''
    this.type = _trans.type || 'Cash'
    this.date = _trans.date || new Date()
    this.amount = _trans.amount
      ? currency(_trans.amount.value ? _trans.amount.value : _trans.amount)
      : currency(0)
    this.budget = _trans.category !== 'Journal' ? _trans.budget : ''
    // console.log(_trans.GST, typeof _trans.GST)
    this.GST = _trans.GST
      ? currency(_trans.GST.value ? _trans.GST.value : _trans.GST)
      : currency(0)
    // console.log(this.GST)
    this.cheque =
      _trans.category == 'Expense' ? (_trans.cheque ? _trans.cheque : '') : ''
    this.receipt = _trans.category === 'Expense' ? _trans.receipt : false
    this.receiptURL = _trans.category === 'Expense' ? _trans.receiptURL : ''
    this.payTo = _trans.category === 'Expense' ? _trans.payTo : ''
    this.from = _trans.category === 'Journal' ? _trans.from : ''
    this.to = _trans.category === 'Journal' ? _trans.to : ''
    this.category = _trans.category || 'Expense'
    this.currency = _trans.currency || 'AUD'
    this.submittedBy = _trans.submittedBy || {}
    this.deleted = _trans.deleted || false
  }

  setUrl(url: string) {
    this.receiptURL = url
  }

  duplicate() {
    return new Transaction(this)
  }

  static fetchTrans(
    ref: DocumentReference | CollectionReference | Query,
    cb: (transactions: TransactionList) => {}
  ) {
    if (ref.type === 'query' || ref.type === 'collection') {
      collection(ref).subscribe((transactions): any => {
        /* update UI */
        let trans: any

        trans = transactions.map((transaction: any) => {
          let transData = transaction.data()
          transData.id = transaction.id
          return new Transaction(transData)
        })
        cb(trans)
      })
    } else if (ref.type === 'document') {
      doc(ref).subscribe((transaction: any) => {
        /* update UI */
        if (transaction.exists()) {
          let trans = {} as TransactionList
          let transData = transaction.data()
          transData.id = transaction.id
          trans[transaction.id] = new Transaction(transData)
          cb(trans)
        }
      })
    }
  }
  static updateTrans(ref: DocumentReference, update: Partial<Transaction>) {
    return updateDoc(ref, update)
  }
  static createTrans(ref: CollectionReference, data: Transaction) {
    return addDoc(ref, data)
  }
}
