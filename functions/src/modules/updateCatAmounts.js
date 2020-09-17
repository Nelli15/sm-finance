module.exports = ({ admin, environment }) => async (change, context) => {
  //
  var db = admin.firestore()
  // Get an object with the current document value.
  let projectId = context.params.projectId
  let accountId = context.params.accountId
  // If the document does not exist, it has been deleted.
  const newDoc = change.after.exists ? change.after.data() : null
  // Get an object with the previous document value (for update or delete)
  const oldDoc = change.before.exists ? change.before.data() : null

  console.log(newDoc, oldDoc)
  // nothing to do if the account is of type account or category so return
  if (newDoc && newDoc.type !== 'budget') {
    return true
  }
  // get the relevant accountcategories that need updating
  if (newDoc) {
    return db
      .runTransaction(async t => {
        const ref = change.after.ref.parent.doc(newDoc.category)
        const doc = await t.get(ref)

        const data = doc.data()
        let newData = {
          expenses: 0,
          balance: 0,
          budget: 0
        }
        if (oldDoc && oldDoc.category === newDoc.category) {
          console.log('updated')
          // console.log(
          //   data.expenses ? parseFloat(data.expenses) : 0,
          //   newDoc.expenses ? parseFloat(newDoc.expenses) : 0,
          //   oldDoc.expenses ? parseFloat(oldDoc.expenses) : 0
          // )
          // category hasn't changed. modify the totals by the amount to changed by
          newData.expenses =
            (data.expenses ? parseFloat(data.expenses) : 0) +
            (newDoc.expenses ? parseFloat(newDoc.expenses) : 0) -
            (oldDoc.expenses ? parseFloat(oldDoc.expenses) : 0)
          // newData.income =
          //   (data.income ? parseFloat(data.income) : 0) +
          //   (newDoc.income ? parseFloat(newDoc.income) : 0) -
          //   (oldDoc.income ? parseFloat(oldDoc.income) : 0)
          newData.budget =
            (data.budget ? parseFloat(data.budget) : 0) +
            (newDoc.budget ? parseFloat(newDoc.budget) : 0) -
            (oldDoc.budget ? parseFloat(oldDoc.budget) : 0)
          newData.balance =
            (data.balance ? parseFloat(data.balance) : 0) +
            (newDoc.balance ? parseFloat(newDoc.balance) : 0) -
            (oldDoc.balance ? parseFloat(oldDoc.balance) : 0)
        } else {
          console.log('new')

          // category has changed. add the new amounts to the category
          newData.expenses =
            (data.expenses ? parseFloat(data.expenses) : 0) +
            (newDoc.expenses ? parseFloat(newDoc.expenses) : 0)
          // newData.income =
          //   (data.income ? parseFloat(data.income) : 0) +
          //   (newDoc.income ? parseFloat(newDoc.income) : 0)
          newData.budget =
            (data.budget ? parseFloat(data.budget) : 0) +
            (newDoc.budget ? parseFloat(newDoc.budget) : 0)
          newData.balance =
            (data.balance ? parseFloat(data.balance) : 0) +
            (newDoc.balance ? parseFloat(newDoc.balance) : 0)
        }
        console.log(newData)
        t.update(ref, newData)
      })
      .then(() => {
        //return if category hasn't changed
        if (!oldDoc || oldDoc.category === newDoc.category) return
        //category has changed. update the old one to remove the budget from the amounts
        console.log('updated')

        db.runTransaction(async t => {
          const ref = change.after.ref.parent.doc(oldDoc.category)
          const doc = await t.get(ref)
          const data = doc.data()
          let newData = {
            expenses: 0,
            balance: 0,
            budget: 0
          }
          newData.expenses =
            (data.expenses ? parseFloat(data.expenses) : 0) -
            (oldDoc.expenses ? parseFloat(oldDoc.expenses) : 0)
          // newData.income =
          //   (data.income ? parseFloat(data.income) : 0) -
          //   (oldDoc.income ? Doc.income : 0)
          newData.budget =
            (data.budget ? parseFloat(data.budget) : 0) -
            (oldDoc.budget ? parseFloat(oldDoc.budget) : 0)
          newData.balance =
            (data.balance ? parseFloat(data.balance) : 0) -
            (oldDoc.balance ? parseFloat(oldDoc.balance) : 0)

          console.log(newData)
          t.update(ref, newData)
        })
      })
  } else {
    //budget was deleted
    console.log('deleted')

    return db.runTransaction(async t => {
      const ref = change.before.ref.parent.doc(oldDoc.category)
      const doc = await t.get(ref)

      const data = doc.data()
      let newData = {
        expenses: 0,
        balance: 0,
        budget: 0
      }
      newData.expenses =
        (data.expenses ? parseFloat(data.expenses) : 0) -
        (oldDoc.expenses ? parseFloat(oldDoc.expenses) : 0)
      // newData.income =
      //   (data.income ? parseFloat(data.income) : 0) -
      //   (oldDoc.income ? parseFloat(oldDoc.income) : 0)

      newData.budget =
        (data.budget ? parseFloat(data.budget) : 0) -
        (oldDoc.budget ? parseFloat(oldDoc.budget) : 0)
      newData.balance =
        (data.balance ? parseFloat(data.balance) : 0) -
        (oldDoc.balance ? parseFloat(oldDoc.balance) : 0)

      console.log(newData)
      t.update(ref, newData)
    })
  }
}
