module.exports = ({ admin, environment }) => async (change, context) => {
  const db = admin.firestore()
  // Get an object with the current document value.
  let projectId = context.params.projectId
  let transId = context.params.transId
  // If the document does not exist, it has been deleted.
  const newDoc = change.after.exists ? change.after.data() : null

  // Get an object with the previous document value (for update or delete)
  const oldDoc = change.before.exists ? change.before.data() : null

  // check if reviewed changed
  if (oldDoc !== null && newDoc !== null) {
    if (newDoc.reviewed === true && oldDoc.reviewed === false) {
      if (newDoc.category === 'Journal') {
        updateAwaitingReview(
          db,
          projectId,
          oldDoc.to,
          oldDoc.to !== newDoc.to ? -1 : 0
        )
        updateAwaitingReview(
          db,
          projectId,
          oldDoc.from,
          oldDoc.from !== newDoc.from ? -1 : 0
        )
        updateAwaitingReview(
          db,
          projectId,
          newDoc.to,
          oldDoc.to !== newDoc.to ? 0 : -1
        )
        updateAwaitingReview(
          db,
          projectId,
          newDoc.from,
          oldDoc.from !== newDoc.from ? 0 : -1
        )
      } else {
        updateAwaitingReview(
          db,
          projectId,
          oldDoc.budget,
          oldDoc.budget !== newDoc.budget ? -1 : 0
        )
        updateAwaitingReview(
          db,
          projectId,
          newDoc.budget,
          oldDoc.budget !== newDoc.budget ? 0 : -1
        )
      }
    } else if (newDoc.reviewed === false && oldDoc.reviewed === true) {
      if (newDoc.category === 'Journal') {
        updateAwaitingReview(db, projectId, newDoc.to, 1)
        updateAwaitingReview(db, projectId, newDoc.from, 1)
      } else {
        updateAwaitingReview(db, projectId, newDoc.budget, 1)
      }
    } else if (newDoc.reviewed === false && oldDoc.reviewed === false) {
      if (newDoc.category === 'Journal') {
        updateAwaitingReview(
          db,
          projectId,
          oldDoc.to,
          oldDoc.to !== newDoc.to ? -1 : 0
        )
        updateAwaitingReview(
          db,
          projectId,
          oldDoc.from,
          oldDoc.from !== newDoc.from ? -1 : 0
        )
        updateAwaitingReview(
          db,
          projectId,
          newDoc.to,
          oldDoc.to !== newDoc.to ? 1 : 0
        )
        updateAwaitingReview(
          db,
          projectId,
          newDoc.from,
          oldDoc.from !== newDoc.from ? 1 : 0
        )
      } else {
        updateAwaitingReview(
          db,
          projectId,
          oldDoc.budget,
          oldDoc.budget !== newDoc.budget ? -1 : 0
        )
        updateAwaitingReview(
          db,
          projectId,
          newDoc.budget,
          oldDoc.budget !== newDoc.budget ? 1 : 0
        )
      }
    }
  } else if (oldDoc === null) {
    if (newDoc.reviewed !== true) {
      if (newDoc.category === 'Journal') {
        updateAwaitingReview(db, projectId, newDoc.to, 1)
        updateAwaitingReview(db, projectId, newDoc.from, 1)
      } else {
        updateAwaitingReview(db, projectId, newDoc.budget, 1)
      }
    }
  } else if (newDoc === null) {
    if (oldDoc.reviewed !== true) {
      if (newDoc.category === 'Journal') {
        updateAwaitingReview(db, projectId, oldDoc.to, -1)
        updateAwaitingReview(db, projectId, oldDoc.from, -1)
      } else {
        updateAwaitingReview(db, projectId, oldDoc.budget, -1)
      }
    }
  }

  function updateAwaitingReview(db, projectId, budgetId, transAwaitingReview) {
    // console.log(projectId, budgetId, transAwaitingReview)
    if (transAwaitingReview === 0) return
    return db.runTransaction(async t => {
      const ref = db
        .collection('projects')
        .doc(projectId)
        .collection('accounts')
        .doc(budgetId)
      const doc = await t.get(ref)
      const data = doc.data()
      let newData = {
        transAwaitingReview: data.transAwaitingReview
          ? parseInt(data.transAwaitingReview) + parseInt(transAwaitingReview)
          : 0 + parseInt(transAwaitingReview)
      }
      console.log(newData)
      t.update(ref, newData)
    })
  }

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
      ? parseFloat(data.expenses) + parseFloat(expense)
      : 0 + parseFloat(expense)
    newData.balance = data.balance
      ? parseFloat(data.balance) + parseFloat(amount)
      : 0 + parseFloat(amount)
    t.update(ref, newData)
  })
}
