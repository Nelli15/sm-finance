const admin = require('../../utils/test-admin')
const environment = require('../../environments/environment.test.js')
const context = {
  admin,
  environment
}

const Func = require('../updateBudgetAmounts.js')
const db = admin.firestore()

const projectCol = db.collection(environment.schema.projects)

describe('updateBudgetAmount', () => {
  let func
  let funcContext
  let data
  let projectDoc = projectCol.doc('test-project')

  beforeEach(async () => {
    // generate some test budgets/accounts
    await projectDoc
      .collection('accounts')
      .doc('debitCard')
      .set({
        label: 'Debit Card',
        type: 'account'
      })
    await projectDoc
      .collection('accounts')
      .doc('pettyCash')
      .set({
        label: 'Petty Cash',
        type: 'account'
      })
  })

  describe('Expense', () => {
    beforeEach(async () => {
      // generate a test transaction
      func = Func(context)
      funcContext = {
        params: {
          projectId: 'test-project',
          transId: 'test-transId'
        }
      }
    })

    it('should add to budget total and awaiting review on new transaction', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account'
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: false
        },
        after: {
          exists: true
        }
      }

      change.after.data = () => {
        return after
      }
      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(-245)
      expect(result.expenses).toEqual(245)
    })

    it('should remove from budget total and awaiting review on delete transaction if not deleted and not reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: -245,
          expenses: 245,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true
        },
        after: {
          exists: false
        }
      }

      change.before.data = () => {
        return before
      }
      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()

      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should remove from budget total on delete transaction if not deleted and reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: -245,
          expenses: 245,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true
        },
        after: {
          exists: false
        }
      }

      change.before.data = () => {
        return before
      }
      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()

      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should do nothing on delete transaction if deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true
        },
        after: {
          exists: false
        }
      }

      change.before.data = () => {
        return before
      }
      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()

      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should change old and new budget total and awaiting review on transaction budget field change if not deleted and not reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: -245,
          expenses: 245,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'pettyCash',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const budget2 = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('pettyCash')
        .get()
      const result = budget.data()
      const result2 = budget2.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)

      expect(result2.transAwaitingReview).toEqual(1)
      expect(result2.balance).toEqual(-245)
      expect(result2.expenses).toEqual(245)
    })

    it('should change old and new budget total on transaction budget field change if not deleted and reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: -245,
          expenses: 245,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'pettyCash',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const budget2 = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('pettyCash')
        .get()
      const result = budget.data()
      const result2 = budget2.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)

      expect(result2.transAwaitingReview).toEqual(0)
      expect(result2.balance).toEqual(-245)
      expect(result2.expenses).toEqual(245)
    })

    it('should do nothing on transaction budget field change if already deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'pettyCash',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const budget2 = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('pettyCash')
        .get()
      const result = budget.data()
      const result2 = budget2.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)

      expect(result2.transAwaitingReview).toEqual(0)
      expect(result2.balance).toEqual(0)
      expect(result2.expenses).toEqual(0)
    })

    it('should do nothing if no relevant changes are found', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: -245,
          expenses: 245,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(-245)
      expect(result.expenses).toEqual(245)
    })

    it('should remove from budget total on change of delete field from true to false if reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(-245)
      expect(result.expenses).toEqual(245)
    })

    it('should add to budget total and awaiting review on change of delete field from false to true if reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: -245,
          expenses: 245,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should remove from budget total and add to awaiting review on change of delete field from true to false if not reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(-245)
      expect(result.expenses).toEqual(245)
    })

    it('should add to budget total and awaiting review on change of delete field from false to true if not reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: -245,
          expenses: 245,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should do nothing when marked as reviewed & already deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should do nothing when marked as unreviewed & already deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should remove awaiting review when marked as reviewed & not deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should add awaiting review when marked as unreviewed & not deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should update budget total if amount changes and not deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: -200,
          expenses: 200,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 200,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(-245)
      expect(result.expenses).toEqual(245)
    })

    it('should do nothing if amount changes and already deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 200,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Expense',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })
  })

  describe('Income', () => {
    beforeEach(async () => {
      // generate a test transaction
      func = Func(context)
      funcContext = {
        params: {
          projectId: 'test-project',
          transId: 'test-transId'
        }
      }
    })

    it('should add to budget total and awaiting review on new transaction', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account'
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: false
        },
        after: {
          exists: true
        }
      }

      change.after.data = () => {
        return after
      }
      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(245)
      expect(result.expenses).toEqual(0)
    })

    it('should remove from budget total and awaiting review on delete transaction if not deleted and not reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: 245,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true
        },
        after: {
          exists: false
        }
      }

      change.before.data = () => {
        return before
      }
      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()

      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should remove from budget total on delete transaction if not deleted and reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 245,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true
        },
        after: {
          exists: false
        }
      }

      change.before.data = () => {
        return before
      }
      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()

      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should do nothing on delete transaction if deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true
        },
        after: {
          exists: false
        }
      }

      change.before.data = () => {
        return before
      }
      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()

      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should change old and new budget total and awaiting review on transaction budget field change if not deleted and not reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: 245,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'pettyCash',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const budget2 = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('pettyCash')
        .get()
      const result = budget.data()
      const result2 = budget2.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)

      expect(result2.transAwaitingReview).toEqual(1)
      expect(result2.balance).toEqual(245)
      expect(result2.expenses).toEqual(0)
    })

    it('should change old and new budget total on transaction budget field change if not deleted and reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 245,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'pettyCash',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const budget2 = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('pettyCash')
        .get()
      const result = budget.data()
      const result2 = budget2.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)

      expect(result2.transAwaitingReview).toEqual(0)
      expect(result2.balance).toEqual(245)
      expect(result2.expenses).toEqual(0)
    })

    it('should do nothing on budget field change if already deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'pettyCash',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const budget2 = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('pettyCash')
        .get()
      const result = budget.data()
      const result2 = budget2.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)

      expect(result2.transAwaitingReview).toEqual(0)
      expect(result2.balance).toEqual(0)
      expect(result2.expenses).toEqual(0)
    })

    it('should do nothing if no relevant changes are found', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: -245,
          expenses: 245,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(-245)
      expect(result.expenses).toEqual(245)
    })

    it('should add to budget total on change of delete field from true to false if reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(245)
      expect(result.expenses).toEqual(0)
    })

    it('should remove from budget total and awaiting review on change of delete field from false to true if reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 245,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should add to budget total and awaiting review on change of delete field from true to false if not reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(245)
      expect(result.expenses).toEqual(0)
    })

    it('should remove from budget total and awaiting review on change of delete field from false to true if not reviewed', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: 245,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should do nothing when marked as reviewed & already deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should do nothing when marked as unreviewed & already deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should remove the awaiting review when marked as reviewed & not deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should add the awaiting review when marked as unreviewed & not deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: true,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()

      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })

    it('should update budget total if amount changes and not deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 1,
          balance: 200,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account'
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 200,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: false
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(1)
      expect(result.balance).toEqual(245)
      expect(result.expenses).toEqual(0)
    })

    it('should do nothing if amount changes and already deleted', async () => {
      // generate some test budgets/accounts
      await projectDoc
        .collection('accounts')
        .doc('debitCard')
        .set({
          label: 'Debit Card',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })
      await projectDoc
        .collection('accounts')
        .doc('pettyCash')
        .set({
          label: 'Petty Cash',
          type: 'account',
          transAwaitingReview: 0,
          balance: 0,
          expenses: 0,
          income: 0
        })

      let after = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 245,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      let before = {
        date: '18/11/2020',
        submittedBy: {},
        amount: 200,
        GST: 0,
        type: 'Cash',
        cheque: '',
        reviewed: false,
        from: 0,
        receipt: false,
        to: 0,
        payTo: 'ehath b',
        category: 'Income',
        budget: 'debitCard',
        desc: 'sdn',
        id: 'SefjNJshDVrvcGbfYiBw',
        currency: 'AUD',
        deleted: true
      }

      const change = {
        before: {
          exists: true,
          data: () => before
        },
        after: {
          exists: true,
          data: () => after
        }
      }

      // run the function
      await func(change, funcContext)

      // get the data to be changed from the database
      const budget = await projectCol
        .doc(funcContext.params.projectId)
        .collection('accounts')
        .doc('debitCard')
        .get()
      const result = budget.data()
      expect(result.transAwaitingReview).toEqual(0)
      expect(result.balance).toEqual(0)
      expect(result.expenses).toEqual(0)
    })
  })

  describe('Journal', () => {
    beforeEach(async () => {
      // generate a test transaction
      func = Func(context)
      funcContext = {
        params: {
          projectId: 'test-project',
          transId: 'test-transId'
        }
      }
    })
    describe('From budget', () => {
      it('should remove from budget total and add awaiting review on new transaction', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account'
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: false
          },
          after: {
            exists: true
          }
        }

        change.after.data = () => {
          return after
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(-245)
        expect(result.expenses).toEqual(0)
      })

      it('should add to budget total and remove from awaiting review on delete transaction if not deleted and not reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true
          },
          after: {
            exists: false
          }
        }

        change.before.data = () => {
          return before
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should add to budget total on delete transaction if not deleted and reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true
          },
          after: {
            exists: false
          }
        }

        change.before.data = () => {
          return before
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should do nothing on delete transaction if deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true
          },
          after: {
            exists: false
          }
        }

        change.before.data = () => {
          return before
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should change old and new budget total and awaiting review on transaction budget field change if not deleted and not reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('test-budget')
          .set({
            label: 'Test Budget',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'test-budget',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'pettyCash',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const budget2 = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('test-budget')
          .get()
        const result = budget.data()
        const result2 = budget2.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)

        expect(result2.transAwaitingReview).toEqual(1)
        expect(result2.balance).toEqual(-245)
        expect(result2.expenses).toEqual(0)
      })

      it('should change old and new budget total on transaction budget field change if not deleted and reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('test-budget')
          .set({
            label: 'Test Budget',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'test-budget',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'pettyCash',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const budget2 = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('test-budget')
          .get()
        const result = budget.data()
        const result2 = budget2.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)

        expect(result2.transAwaitingReview).toEqual(0)
        expect(result2.balance).toEqual(-245)
        expect(result2.expenses).toEqual(0)
      })

      it('should do nothing on transaction from field change if already deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'pettyCash',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const budget2 = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()
        const result2 = budget2.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)

        expect(result2.transAwaitingReview).toEqual(0)
        expect(result2.balance).toEqual(0)
        expect(result2.expenses).toEqual(0)
      })

      it('should do nothing if no relevant changes are found', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -245,
            expenses: 245,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(-245)
        expect(result.expenses).toEqual(245)
      })

      it('should remove from budget total on change of delete field from true to false if reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(-245)
        expect(result.expenses).toEqual(0)
      })

      it('should add to budget total and awaiting review on change of delete field from false to true if reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should remove from budget total and awaiting review on change of delete field from true to false if not reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(-245)
        expect(result.expenses).toEqual(0)
      })

      it('should add to budget total and awaiting review on change of delete field from false to true if not reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should do nothing when marked as reviewed & already deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should do nothing when marked as unreviewed & already deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should remove awaiting review when marked as reviewed & not deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should add awaiting review when marked as unreviewed & not deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should update budget total if amount changes and not deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -200,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 200,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(-245)
        expect(result.expenses).toEqual(0)
      })

      it('should do nothing if amount changes and already deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 200,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })
    })
    describe('To Budget', () => {
      it('should add to budget total and awaiting review on new transaction', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account'
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: false
          },
          after: {
            exists: true
          }
        }

        change.after.data = () => {
          return after
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(245)
        expect(result.expenses).toEqual(0)
      })

      it('should remove from budget total and remove from awaiting review on delete transaction if not deleted and not reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: 245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 1,
            balance: 245,
            expenses: 0,
            income: 0
          })

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true
          },
          after: {
            exists: false
          }
        }

        change.before.data = () => {
          return before
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should remove from budget total on delete transaction if not deleted and reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 245,
            expenses: 0,
            income: 0
          })

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true
          },
          after: {
            exists: false
          }
        }

        change.before.data = () => {
          return before
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should do nothing on delete transaction if deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true
          },
          after: {
            exists: false
          }
        }

        change.before.data = () => {
          return before
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should change old and new budget total and awaiting review on transaction budget field change if not deleted and not reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 1,
            balance: 245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('test-budget')
          .set({
            label: 'Test Budget',
            type: 'budget',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'test-budget',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'pettyCash',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()

        const budget2 = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('test-budget')
          .get()

        const result = budget.data()
        const result2 = budget2.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)

        expect(result2.transAwaitingReview).toEqual(1)
        expect(result2.balance).toEqual(245)
        expect(result2.expenses).toEqual(0)
      })

      it('should change old and new budget total on transaction budget field change if not deleted and reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('test-budget')
          .set({
            label: 'Test Budget',
            type: 'budget',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'test-budget',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'pettyCash',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()

        const budget2 = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('test-budget')
          .get()

        const result = budget.data()
        const result2 = budget2.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)

        expect(result2.transAwaitingReview).toEqual(0)
        expect(result2.balance).toEqual(245)
        expect(result2.expenses).toEqual(0)
      })

      it('should do nothing on transaction to field change if deleted already', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'pettyCash',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()
        const budget2 = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()
        const result2 = budget2.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)

        expect(result2.transAwaitingReview).toEqual(0)
        expect(result2.balance).toEqual(0)
        expect(result2.expenses).toEqual(0)
      })

      it('should do nothing if no relevant changes are found', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should add to budget total on change of delete field from true to false if reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(245)
        expect(result.expenses).toEqual(0)
      })

      it('should remove from budget total and awaiting review on change of delete field from false to true if reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 245,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should add to budget total and awaiting review on change of delete field from true to false if not reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(245)
        expect(result.expenses).toEqual(0)
      })

      it('should remove from budget total and awaiting review on change of delete field from false to true if not reviewed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -245,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 1,
            balance: 245,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should do nothing when marked as reviewed & already deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should do nothing when marked as unreviewed & already deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should remove awaiting review when marked as reviewed & not deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 1,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should add awaiting review when marked as unreviewed & not deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account'
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: true,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()

        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })

      it('should update budget total if amount changes and not deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -200,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 1,
            balance: 200,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 200,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(245)
        expect(result.expenses).toEqual(0)
      })

      it('should do nothing if amount changes and already deleted', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 0,
            balance: 0,
            expenses: 0,
            income: 0
          })

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 245,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 200,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: true
        }

        const change = {
          before: {
            exists: true,
            data: () => before
          },
          after: {
            exists: true,
            data: () => after
          }
        }

        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()
        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(0)
        expect(result.balance).toEqual(0)
        expect(result.expenses).toEqual(0)
      })
    })
    describe('other', () => {
      it('should update to and from budgets on only journal amount changed', async () => {
        // generate some test budgets/accounts
        await projectDoc
          .collection('accounts')
          .doc('debitCard')
          .set({
            label: 'Debit Card',
            type: 'account',
            transAwaitingReview: 1,
            balance: -50,
            expenses: 0,
            income: 0
          })
        await projectDoc
          .collection('accounts')
          .doc('pettyCash')
          .set({
            label: 'Petty Cash',
            type: 'account',
            transAwaitingReview: 1,
            balance: 50,
            expenses: 0,
            income: 0
          })

        let before = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 50,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        let after = {
          date: '18/11/2020',
          submittedBy: {},
          amount: 100,
          GST: 0,
          type: 'Cash',
          cheque: '',
          reviewed: false,
          from: 'debitCard',
          receipt: false,
          to: 'pettyCash',
          payTo: 'ehath b',
          category: 'Journal',
          budget: 'debitCard',
          desc: 'sdn',
          id: 'SefjNJshDVrvcGbfYiBw',
          currency: 'AUD',
          deleted: false
        }

        const change = {
          before: {
            exists: true
          },
          after: {
           exists: true
          }
        }

        change.before.data = () => {
          return before
        }

        change.after.data = () => {
          return after
        }
        // run the function
        await func(change, funcContext)

        // get the data to be changed from the database
        const budget = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('debitCard')
          .get()

        const result = budget.data()
        expect(result.transAwaitingReview).toEqual(1)
        expect(result.balance).toEqual(-100)
        expect(result.expenses).toEqual(0)

        const budget2 = await projectCol
          .doc(funcContext.params.projectId)
          .collection('accounts')
          .doc('pettyCash')
          .get()

        const result2 = budget2.data()
        expect(result2.transAwaitingReview).toEqual(1)
        expect(result2.balance).toEqual(100)
        expect(result2.expenses).toEqual(0)
      })
    })
  })

  afterAll(async () => {
    // delete all data from db
    // await nowRef.delete()
    // console.log(movDoc)
    // if (movDoc) await movDoc.delete()
    const col = await movCol.get()
    col.forEach(doc => {
      doc.ref.delete()
    })
    // console.log(await movCol.listDocuments())
    // const movements = await movCol.listDocuments()
    // console.log(movements)
    //
    // await styleRef.delete()
  })
})
