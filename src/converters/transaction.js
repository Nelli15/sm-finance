export class Transaction {
    constructor (_category) {
        this.reviewed = _reviewed,
        this.desc = _desc,
        this.type = _type,
        this.date = _date,
        this.amount = _amount,
        if (category === 'Expense') {
            this.budget = _budget,
            this.GST = _GST,
            this.cheque = _cheque,
            this.receipt = _receipt,
            this.category = 'Expense',
            this.payTo = payTo,
        } else if (category === 'Income') {
            this.budget = _budget,
            this.category = 'Income',
        } else if (category === 'Journal') {
            this.from = _from,
            this.to = _to,
            this.category = 'Journal',
        }

    }
}

// Firestore data converter
export const transactionConverter = {
    toFirestore: (transaction) => {
        return {
            label = transaction.label,
            type = transaction.type,
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options)
        return new Transaction(data.label, data.type);
    }
};