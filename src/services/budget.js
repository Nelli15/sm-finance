export class Budget {
    constructor (label, category, budget = 0) {
        this.label = label;
        this.category = category;
        this.type = 'budget';
        this.budget = budget;
    }
}

// Firestore data converter
export const budgetConverter = {
    toFirestore: (budget) => {
        return {
            label: budget.label,
            category: budget.category,
            type: budget.type,
            budget = budget.budget
            };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Budget(data.label, data.category, data.type, data.budget);
    }
};