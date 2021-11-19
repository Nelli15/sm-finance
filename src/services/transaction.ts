import store from './../store/index.js'

interface ExpenseTrans {
  reviewed: boolean
  desc: string
  type: 'Cash' | 'Bank Card' | 'Internet Transfer' | 'Cheque'
  date: Date
  amount: number
  GST: number | null
  cheque: string | null
  receipt: boolean
  category: 'Expense'
  payTo: string | null
  budget: string | null
}
interface IncomeTrans {
  reviewed: boolean
  desc: string
  type: 'Cash' | 'Bank Card' | 'Internet Transfer' | 'Cheque'
  date: Date
  amount: number
  GST: number | null
  category: 'Income'
  budget: string | null
}
interface JournalTrans {
  reviewed: boolean
  desc: string
  type: 'Cash' | 'Bank Card' | 'Internet Transfer' | 'Cheque'
  date: Date
  amount: number
  cheque: string | null
  category: 'Journal'
  from: string | null
  to: string | null
}

import {
  DocumentReference,
  CollectionReference,
  Query,
  updateDoc,
  addDoc,
  DocumentData,
} from '@firebase/firestore'
import { collectionData } from 'rxfire/firestore'
import { tap } from 'rxjs/operators'

export class Transaction {
  reviewed: boolean
  desc: string
  type: 'Cash' | 'Bank Card' | 'Internet Transfer' | 'Cheque'
  date: Date
  amount: number
  GST: number | null
  cheque: string | null
  receipt: boolean
  category: 'Income' | 'Journal' | 'Expense'
  payTo: string | null
  budget: string | null
  from: string | null
  to: string | null
  constructor(_trans: ExpenseTrans | IncomeTrans | JournalTrans) {
    this.reviewed = _trans.reviewed
    this.desc = _trans.desc
    this.type = _trans.type
    this.date = _trans.date
    this.amount = _trans.amount
    this.budget = _trans.category !== 'Journal' ? _trans.budget : null
    this.GST = _trans.category === 'Expense' ? _trans.GST : null
    this.cheque = _trans.category == 'Expense' ? _trans.cheque : null
    this.receipt = _trans.category === 'Expense' ? _trans.receipt : false
    this.payTo = _trans.category === 'Expense' ? _trans.payTo : null
    this.from = _trans.category === 'Journal' ? _trans.from : null
    this.to = _trans.category === 'Journal' ? _trans.to : null
    this.category = _trans.category
  }
  static fetchTrans(
    ref: DocumentReference | CollectionReference | Query,
    cb: (transactions: object) => {}
  ) {
    if (ref.type === 'query' || ref.type === 'collection') {
      collectionData(ref, { idField: 'id' })
        // .pipe(
        //   tap((transactions) =>
        //     console.log('This is just an observable!', transactions)
        //   )
        // )
        .subscribe((transactions) => {
          /* update UI */
          // console.log('This is just an observable!', transactions)
          cb(transactions)
        })
    }
    //  else if (ref.type === 'document') {
    // }
  }
  static updateTrans(ref: DocumentReference, update: Partial<Transaction>) {
    return updateDoc(ref, update)
  }
  static createTrans(ref: CollectionReference, data: Transaction) {
    return addDoc(ref, data)
  }
}
