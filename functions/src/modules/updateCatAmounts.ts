module.exports = ({ admin, environment }) => async (
  change: firebase.firestore.DocumentChangeType,
  context
) => {
  //
  var db = admin.firestore()
  // Get an object with the current document value.
  let projectId = context.params.projectId
  let accountId = context.params.accountId
  // If the document does not exist, it has been deleted.
  const newDoc = change.after.exists ? change.after.data() : null
  // Get an object with the previous document value (for update or delete)
  const oldDoc = change.before.exists ? change.before.data() : null
  // nothing to do if the account is of type account or category so return
  if (newDoc.type !== 'budget') {
    return true
  }
  // get the relevant accountcategories that need updating
  //     // accounts = accounts.filter((val, index, self) => {
  //     //   return self.indexOf(val) === index
  //     // })
  // console.log('updating account Category Totals: ', accounts)
  // loop through all the accounts to update each one
  // for (var accountKey in accounts) {
  //   let account = accounts[accountKey]
  //   let expenses = 0,
  //     income = 0,
  //     budget = 0,
  //     val = 0
  //   // get all the related transactions and update the expense totals - dumb way to do this
  //   let promises = [
  //     db
  //       .collection(`/projects/${projectId}/accounts/`)
  //       .where('type', '==', 'budget')
  //       .where('category', '==', account)
  //       .get()
  //       .then(query => {
  //         query.forEach(docRef => {
  //           val = docRef.get('budget')
  //           budget += parseFloat(val) > 0 ? parseFloat(val) : 0
  //           val = docRef.get('expenses')
  //           expenses += parseFloat(val) > 0 ? parseFloat(val) : 0
  //           // console.log(parseFloat(val) > 0, expenses)
  //           val = docRef.get('income')
  //           income += parseFloat(val) > 0 ? parseFloat(val) : 0
  //         })
  //         return true
  //       })
  //   ]
  //   await Promise.all(promises)
  // console.log({ budget: budget, expenses: expenses, income: income })
  db.doc(`/projects/${projectId}/accounts/${account}`).update({
    budget: budget,
    expenses: expenses,
    income: income
  })
  // }
}
