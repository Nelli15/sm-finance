module.exports = ({ admin, environment }) => async (change, context) => {
  const db = admin.firestore()
  // Get an object with the current document value.
  let projectId = context.params.projectId
  let transId = context.params.transId
  // If the document does not exist, it has been deleted.
  const newDoc = change.after.exists ? change.after.data() : null

  // Get an object with the previous document value (for update or delete)
  const oldDoc = change.before.exists ? change.before.data() : null

  console.log(newDoc, oldDoc)
  // check for relevant change
  if (oldDoc !== null && newDoc !== null) {
    if (
      newDoc.amount === oldDoc.amount &&
      newDoc.to === oldDoc.to &&
      newDoc.from === oldDoc.from &&
      newDoc.budget === oldDoc.budget &&
      newDoc.category === oldDoc.category &&
      newDoc.deleted === oldDoc.deleted
    ) {
      console.log('no change detected')
      return true
    }
  }

  if (oldDoc === null) {
    // create
    // make a list of all the budgets to be updated
    if (newDoc.category === 'Income') {
      await updateBudget(db, projectId, newDoc.budget, 0, newDoc.amount)
    } else if (newDoc.category === 'Expense') {
      await updateBudget(
        db,
        projectId,
        newDoc.budget,
        newDoc.amount,
        -newDoc.amount
      )
    } else if (newDoc.category === 'Journal') {
      await updateBudget(db, projectId, newDoc.to, 0, newDoc.amount)
      await updateBudget(db, projectId, newDoc.from, 0, -newDoc.amount)
    }
  } else if (oldDoc !== null && newDoc !== null) {
    // update
    // make a list of all the budgets to be updated
    if (!oldDoc.deleted) {
      if (oldDoc.category === 'Income') {
        await updateBudget(db, projectId, oldDoc.budget, 0, -oldDoc.amount)
      } else if (oldDoc.category === 'Expense') {
        await updateBudget(
          db,
          projectId,
          oldDoc.budget,
          -oldDoc.amount,
          oldDoc.amount
        )
      } else if (oldDoc.category === 'Journal') {
        await updateBudget(db, projectId, oldDoc.to, 0, -oldDoc.amount)
        await updateBudget(db, projectId, oldDoc.from, 0, oldDoc.amount)
      }
    }
    if (!newDoc.deleted) {
      if (newDoc.category === 'Income') {
        await updateBudget(db, projectId, newDoc.budget, 0, newDoc.amount)
      } else if (newDoc.category === 'Expense') {
        await updateBudget(
          db,
          projectId,
          newDoc.budget,
          newDoc.amount,
          -newDoc.amount
        )
      } else if (newDoc.category === 'Journal') {
        await updateBudget(db, projectId, newDoc.to, 0, newDoc.amount)
        await updateBudget(db, projectId, newDoc.from, 0, -newDoc.amount)
      }
    }
  } else {
    // delete
    // make a list of all the budgets to be updated
    if (oldDoc.category === 'Income') {
      await updateBudget(db, projectId, oldDoc.budget, 0, -oldDoc.amount)
    } else if (oldDoc.category === 'Expense') {
      await updateBudget(
        db,
        projectId,
        oldDoc.budget,
        -oldDoc.amount,
        oldDoc.amount
      )
    } else if (oldDoc.category === 'Journal') {
      await updateBudget(db, projectId, oldDoc.to, 0, -oldDoc.amount)
      await updateBudget(db, projectId, oldDoc.from, 0, oldDoc.amount)
    }
  }
}

function updateBudget(db, projectId, budgetId, expense, amount) {
  return db.runTransaction(async t => {
    const ref = db
      .collection('projects')
      .doc(projectId)
      .collection('accounts')
      .doc(budgetId)
    const doc = await t.get(ref)
    const data = doc.data()
    let newData = { income: 0, expenses: 0, balance: 0 }
    // newData.income = data.income ? parseFloat(data.income) + income : 0 + income
    newData.expenses = data.expenses
      ? parseFloat(data.expenses) + expense
      : 0 + expense
    newData.balance = data.balance
      ? parseFloat(data.balance) + amount
      : 0 + amount
    t.update(ref, newData)
  })
}
