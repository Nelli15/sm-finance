const currency = require( 'currency.js')
module.exports = ({ admin, environment }) => async (snap, context) => {
  const db = admin.firestore()
  // Get an object with the current document value.
  let projectId = snap.data().projectId
  let projectRef = db.collection(environment.schema.projects).doc(projectId)
  console.log(projectId)
  // fetch all transactions
  const transRef = await projectRef.collection('transactions').get()
  // fetch all accounts
  const accountsRef = await projectRef.collection('accounts').get()
  // create object of account totals
  let totals = {}
  console.log(accountsRef)
  for (let doc in accountsRef.docs) {
    if(!totals[accountsRef.docs[doc].id]){
      totals[accountsRef.docs[doc].id] = {
        expenses: currency(0),
        balance: currency(0)
      }
    }
  }
  console.log(totals)

  // loop through all transactions
  // console.log(transRef.docs)
  for (let key in transRef.docs){
    console.log(key)
    let trans = transRef.docs[key].data()
    console.log(trans)
    // if deleted, continue
    // if (trans.deleted) continue

    // if income
    // add amount to budget
    if (trans.category === 'Income'){
      totals[trans.budget].balance = totals[trans.budget].balance.add(trans.amount)

      // if journal
      // subtract amount from 'from'
      // add amount to 'to'
    } else if (trans.category === 'Journal'){
      totals[trans.from].balance = totals[trans.from].balance.subtract(trans.amount)
      totals[trans.to].balance = totals[trans.to].balance.add(trans.amount)
      // if expense
      // subtract amount from budget
      // add to the 
    } else if(trans.category === 'Expense') {
      totals[trans.budget].balance = totals[trans.budget].balance.subtract(trans.amount)
      totals[trans.budget].expenses = totals[trans.budget].expenses.add(trans.amount)
    }
    console.log(key)
  }

  // loop through the accounts to save them
  console.log(totals)
let promises = []
  for (let accountKey in totals) {
    let _total = {balance: totals[accountKey].balance.value, expenses: totals[accountKey].expenses.value}
    promises.push(projectRef.collection('accounts').doc(accountKey).update(_total))
  }
  return Promise.all(promises).catch(err => console.error(err))
}

// function updateBudget(db, budgetRef, awaitReviewAdj, balanceAdj, expenseAdj) {
//   // console.log(balanceAdj, typeof balanceAdj, expenseAdj, typeof expenseAdj)
//   return db
//     .runTransaction(async t => {
//       const doc = await t.get(budgetRef)
//       if (!doc.exists) return
//       const data = doc.data()
//       let newData = {}

//       newData.transAwaitingReview = data.transAwaitingReview
//         ? parseInt(data.transAwaitingReview) + parseInt(awaitReviewAdj)
//         : 0 + parseInt(awaitReviewAdj)

//       newData.expenses = (currency(data.expenses)
//         ? currency(data.expenses).add(expenseAdj)
//         : currency(0).add(expenseAdj)).value
//       newData.balance = (currency(data.balance)
//         ? currency(data.balance).add(balanceAdj)
//         : currency(0).add(balanceAdj)).value
//         // console.log(newData)
//       t.update(budgetRef, newData)
//     })
//     .catch(err => {
//       console.error(err)
//     })
// }
