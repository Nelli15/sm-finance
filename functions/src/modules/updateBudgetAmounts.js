module.exports = ({ admin, environment }) => async (change, context) => {
  const db = admin.firestore()
  // Get an object with the current document value.
  let projectId = context.params.projectId
  let transId = context.params.transId
  let projectRef = db.collection(environment.schema.projects).doc(projectId)
  // If the document does not exist, it has been deleted.
  const newDoc = change.after.exists ? change.after.data() : null

  // Get an object with the previous document value (for update or delete)
  const oldDoc = change.before.exists ? change.before.data() : null
  //create a status object
  let status = {
    change: 'create' || 'update' || 'delete',
    category: 'Expense' || 'Income' || 'Journal',
    deleted: true || false || 'delete' || 'undelete',
    budget: {
      status: 'changed' || 'same',
      old: '',
      new: ''
    },
    to: {
      status: 'changed' || 'same',
      old: '',
      new: ''
    },
    from: {
      status: 'changed' || 'same',
      old: '',
      new: ''
    },
    reviewed: true || false || 'mark reviewed' || 'mark unreviewed',
    amount: {
      status: 'changed' || 'same',
      old: 0,
      new: 0
    }
  }

  // check if created, updated, deleted and generate status object
  if (oldDoc !== null && newDoc !== null) {
    // updated
    status.change = 'update'
    status.category = newDoc.category
    status.deleted =
      newDoc.deleted === true && oldDoc.deleted === true
        ? true
        : newDoc.deleted !== true && oldDoc.deleted !== true
        ? false
        : newDoc.deleted === true && oldDoc.deleted !== true
        ? 'delete'
        : newDoc.deleted !== true && oldDoc.deleted === true
        ? 'undelete'
        : false
    status.reviewed =
      newDoc.reviewed === true && oldDoc.reviewed === true
        ? true
        : newDoc.reviewed !== true && oldDoc.reviewed !== true
        ? false
        : newDoc.reviewed === true && oldDoc.reviewed !== true
        ? 'mark reviewed'
        : newDoc.reviewed !== true && oldDoc.reviewed === true
        ? 'mark unreviewed'
        : false

    status.budget.status = oldDoc.budget === newDoc.budget ? 'same' : 'changed'
    status.budget.old = oldDoc.budget
    status.budget.new = newDoc.budget

    status.to.status = oldDoc.to === newDoc.to ? 'same' : 'changed'
    status.to.old = oldDoc.to
    status.to.new = newDoc.to

    status.from.status = oldDoc.from === newDoc.from ? 'same' : 'changed'
    status.from.old = oldDoc.from
    status.from.new = newDoc.from

    status.amount.status = oldDoc.amount === newDoc.amount ? 'same' : 'changed'
    status.amount.old = oldDoc.amount
    status.amount.new = newDoc.amount
  } else if (oldDoc === null) {
    // created
    status.change = 'create'
    status.category = newDoc.category
    status.deleted = newDoc.deleted === true ? true : false
    status.reviewed =
      newDoc.reviewed === true ? true : newDoc.reviewed !== true ? false : false

    status.budget.status = 'same'
    status.budget.old = newDoc.budget
    status.budget.new = newDoc.budget

    status.to.status = 'same'
    status.to.old = newDoc.to
    status.to.new = newDoc.to

    status.from.status = 'same'
    status.from.old = newDoc.from
    status.from.new = newDoc.from

    status.amount.status = 'changed'
    status.amount.old = 0
    status.amount.new = newDoc.amount
  } else if (newDoc === null) {
    // deleted
    status.change = 'delete'
    status.category = oldDoc.category
    status.deleted = oldDoc.deleted

    status.reviewed =
      oldDoc.reviewed === true ? true : oldDoc.reviewed !== true ? false : false
    status.budget.status = 'same'
    status.budget.old = oldDoc.budget
    status.budget.new = oldDoc.budget

    status.to.status = 'same'
    status.to.old = oldDoc.to
    status.to.new = oldDoc.to

    status.from.status = 'same'
    status.from.old = oldDoc.from
    status.from.new = oldDoc.from

    status.amount.status = 'changed'
    status.amount.old = oldDoc.amount
    status.amount.new = 0
  }
  // console.log(status)

  // check for each condition

  if (status.change === 'create' && status.category === 'Expense') {
    // expense transaction created
    // add review notification
    // add expense to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      1,
      -status.amount.new,
      status.amount.new
    )
  } else if (status.change === 'create' && status.category === 'Income') {
    // income transaction created
    // add review notification
    // add income to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      1,
      status.amount.new,
      0
    )
  } else if (status.change === 'create' && status.category === 'Journal') {
    // journal transaction created
    // add review notification
    // add expense to the buget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      1,
      -status.amount.new,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      1,
      status.amount.new,
      0
    )
  } else if (
    status.change === 'delete' &&
    status.category === 'Expense' &&
    status.deleted === false &&
    status.reviewed === true
  ) {
    // expense transaction deleted
    // remove expense to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      status.amount.old,
      -status.amount.old
    )
  } else if (
    status.change === 'delete' &&
    status.category === 'Expense' &&
    status.deleted === false &&
    status.reviewed === false
  ) {
    // expense transaction deleted
    // remove review notification
    // remove expense to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      -1,
      status.amount.old,
      -status.amount.old
    )
  } else if (
    status.change === 'delete' &&
    status.category === 'Income' &&
    status.deleted === false &&
    status.reviewed === true
  ) {
    // Income transaction deleted
    // remove income from the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      -status.amount.old,
      0
    )
  } else if (
    status.change === 'delete' &&
    status.category === 'Income' &&
    status.deleted === false &&
    status.reviewed === false
  ) {
    // expense transaction deleted
    // remove review notification
    // remove expense to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      -1,
      -status.amount.old,
      0
    )
  } else if (
    status.change === 'delete' &&
    status.category === 'Journal' &&
    status.deleted === false &&
    status.reviewed === true
  ) {
    // Journal transaction deleted
    // add the journal to the from budget total
    // remove journal from the to budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      0,
      status.amount.old,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      0,
      -status.amount.old,
      0
    )
  } else if (
    status.change === 'delete' &&
    status.category === 'Journal' &&
    status.deleted === false &&
    status.reviewed === false
  ) {
    // Journal transaction deleted
    // add the journal to the from budget total
    // remove journal from the to budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      -1,
      status.amount.old,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      -1,
      -status.amount.old,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === false &&
    status.reviewed === false &&
    status.budget.status === 'changed'
  ) {
    // expense transaction budget updated
    // remove expense to the budget total
    // move the await review notification to new budget
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.old),
      -1,
      status.amount.old,
      -status.amount.old
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      1,
      -status.amount.new,
      status.amount.new
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === false &&
    status.reviewed === true &&
    status.budget.status === 'changed'
  ) {
    // expense transaction budget updated
    // remove expense to the budget total
    // move the await review notification to new budget
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.old),
      0,
      status.amount.old,
      -status.amount.old
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      -status.amount.new,
      status.amount.new
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === false &&
    status.reviewed === false &&
    status.budget.status === 'changed'
  ) {
    // income transaction budget updated
    // remove income to the budget total
    // move the await review notification to new budget
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.old),
      -1,
      -status.amount.old,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      1,
      status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === false &&
    status.reviewed === true &&
    status.budget.status === 'changed'
  ) {
    // expense transaction budget updated
    // remove expense to the budget total
    // move the await review notification to new budget
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.old),
      0,
      -status.amount.old,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === false &&
    status.reviewed === false &&
    status.budget.status === 'changed'
  ) {
    // journal transaction budget updated
    // remove journal to the budget total
    // move the await review notification to new budget
    if (status.from.status === 'changed') {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.from.old),
        -1,
        status.amount.old,
        0
      )
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.from.new),
        1,
        -status.amount.new,
        0
      )
    }
    if (status.to.status === 'changed') {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.to.old),
        -1,
        -status.amount.old,
        0
      )
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.to.new),
        1,
        status.amount.new,
        0
      )
    }
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === false &&
    status.reviewed === true &&
    status.budget.status === 'changed'
  ) {
    // journal transaction budget updated
    // remove journal to the budget total
    // move the await review notification to new budget
    if (status.from.status === 'changed') {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.from.old),
        0,
        status.amount.old,
        0
      )
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.from.new),
        0,
        -status.amount.new,
        0
      )
    }
    if (status.to.status === 'changed') {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.to.old),
        0,
        -status.amount.old,
        0
      )
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.to.new),
        0,
        status.amount.new,
        0
      )
    }
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === 'undelete' &&
    status.reviewed === true
  ) {
    // expense transaction undeleted
    // add expense to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      -status.amount.new,
      status.amount.new
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === 'undelete' &&
    status.reviewed === false
  ) {
    // expense transaction undeleted
    // add review notification
    // add expense to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      1,
      -status.amount.new,
      status.amount.new
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === 'delete' &&
    status.reviewed === true
  ) {
    // expense transaction created
    // add expense to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      status.amount.new,
      -status.amount.new
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === 'delete' &&
    status.reviewed === false
  ) {
    // expense transaction created
    // add review notification
    // add expense to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      status.amount.new,
      -status.amount.new
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === 'undelete' &&
    status.reviewed === true
  ) {
    // income transaction undeleted
    // add review notification
    // add income to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === 'undelete' &&
    status.reviewed === false
  ) {
    // income transaction undeleted
    // add review notification
    // add income to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      1,
      status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === 'delete' &&
    status.reviewed === true
  ) {
    // income transaction deleted
    // add review notification
    // add income to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      0,
      -status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === 'delete' &&
    status.reviewed === false
  ) {
    // income transaction deleted
    // add review notification
    // add income to the budget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      -1,
      -status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === 'undelete' &&
    status.reviewed === true
  ) {
    // journal transaction undeleted
    // add review notification
    // add expense to the buget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      0,
      -status.amount.new,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      0,
      status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === 'undelete' &&
    status.reviewed === false
  ) {
    // journal transaction undeleted
    // add review notification
    // add expense to the buget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      1,
      -status.amount.new,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      1,
      status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === 'delete' &&
    status.reviewed === true
  ) {
    // journal transaction undeleted
    // add review notification
    // add expense to the buget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      0,
      status.amount.new,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      0,
      -status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === 'delete' &&
    status.reviewed === false
  ) {
    // journal transaction undeleted
    // add review notification
    // add expense to the buget total
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      -1,
      status.amount.new,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      -1,
      -status.amount.new,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === false &&
    status.reviewed === 'mark reviewed'
  ) {
    // income transaction marked reviewed
    // add review notification
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      -1,
      0,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === false &&
    status.reviewed === 'mark unreviewed'
  ) {
    // expense transaction marked unreviewed
    // add review notification
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      1,
      0,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === false &&
    status.reviewed === 'mark reviewed'
  ) {
    // income transaction marked reviewed
    // remove review notification
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      -1,
      0,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === false &&
    status.reviewed === 'mark unreviewed'
  ) {
    // income transaction marked unreviewed
    // add review notification
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.budget.new),
      1,
      0,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === false &&
    status.reviewed === 'mark reviewed'
  ) {
    // journal transaction marked as reviewed
    // remove review notification
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      -1,
      0,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      -1,
      0,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === false &&
    status.reviewed === 'mark unreviewed'
  ) {
    // journal transaction marked as unreviewed
    // add review notification
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.from.new),
      1,
      0,
      0
    )
    await updateBudget(
      db,
      projectRef.collection('accounts').doc(status.to.new),
      1,
      0,
      0
    )
  } else if (
    status.change === 'update' &&
    status.category === 'Expense' &&
    status.deleted === false &&
    status.amount.status === 'changed'
  ) {
    // expense transaction amount changed
    // add expense to the budget total
    if (status.budget.status === 'changed') {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.budget.old),
        0,
        status.amount.old,
        -status.amount.old
      )
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.budget.new),
        0,
        -status.amount.new,
        status.amount.new
      )
    } else {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.budget.new),
        0,
        status.amount.old - status.amount.new,
        -status.amount.old + status.amount.new
      )
    }
  } else if (
    status.change === 'update' &&
    status.category === 'Income' &&
    status.deleted === false &&
    status.amount.status === 'changed'
  ) {
    // income transaction amount changed
    // add income to the budget total
    if (status.budget.status === 'changed') {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.budget.old),
        0,
        -status.amount.old,
        0
      )
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.budget.new),
        0,
        status.amount.new,
        0
      )
    } else {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.budget.new),
        0,
        status.amount.new - status.amount.old,
        0
      )
    }
  } else if (
    status.change === 'update' &&
    status.category === 'Journal' &&
    status.deleted === false &&
    status.amount.status === 'changed'
  ) {
    // journal transaction amount changed
    // add journal to the budget total
    if (status.to.status === 'changed') {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.to.old),
        0,
        -status.amount.old,
        0
      )
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.to.new),
        0,
        status.amount.new,
        0
      )
    } else {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.to.new),
        0,
        status.amount.new - status.amount.old,
        0
      )
    }
    if (status.from.status === 'changed') {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.from.old),
        0,
        status.amount.old,
        0
      )
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.from.new),
        0,
        -status.amount.new,
        0
      )
    } else {
      await updateBudget(
        db,
        projectRef.collection('accounts').doc(status.from.new),
        0,
        -status.amount.new + status.amount.old,
        0
      )
    }
  }
}

function updateBudget(db, budgetRef, awaitReviewAdj, balanceAdj, expenseAdj) {
  // console.log(awaitReviewAdj, balanceAdj, expenseAdj)
  // console.log(budgetRef.path)
  return db.runTransaction(async t => {
    const doc = await t.get(budgetRef)
    // console.log(doc)
    if (!doc.exists) return
    const data = doc.data()
    let newData = {}

    newData.transAwaitingReview = data.transAwaitingReview
      ? parseInt(data.transAwaitingReview) + parseInt(awaitReviewAdj)
      : 0 + parseInt(awaitReviewAdj)

    newData.expenses = data.expenses
      ? parseFloat(data.expenses) + parseFloat(expenseAdj)
      : 0 + parseFloat(expenseAdj)

    newData.balance = data.balance
      ? parseFloat(data.balance) + parseFloat(balanceAdj)
      : 0 + parseFloat(balanceAdj)

    // console.log(newData)
    t.update(budgetRef, newData)
  })
}
