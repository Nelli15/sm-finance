export class Account {
    constructor (label, type, expenses, balance, inHeader, systemAccount, transAwaitingReview ) {
        this.label = label;
        this.type = type;
        this.expenses = expenses;
        this.balance = balance;
        this.inHeader = inHeader
        this.systemAccount = systemAccount
        this.transAwaitingReview = transAwaitingReview
    }
}

// Firestore data converter
export const accountConverter = {
    toFirestore: (account) => {
        return {
            label = account.label,
            type = account.type,
            expenses = account.expenses,
            balance = account.balance,
            inHeader = account.inHeader,
            systemAccount = account.systemAccount,
            transAwaitingReview = account.transAwaitingReview
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options)
        return new Account(data.label, data.type, data.expsense, data.balance, data.inHeader, data.systemAccount, data.transAwaitingReview);
    }
};