export class Category {
    constructor (label, type, budget, balance, expenses ) {
        this.label = label;
        this.type = type;
        this.expenses = expenses;
        this.budget = budget;
        this.balance = balance;
    }
}

// Firestore data converter
export const categoryConverter = {
    toFirestore: (category) => {
        return {
            label: category.label,
            type: category.type,
            budget = category.budget,
            balance = category.balance,
            expenses = category.expenses 
            };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Category(data.label, data.type, data.budget, data.balance, data.expenses);
    }
};