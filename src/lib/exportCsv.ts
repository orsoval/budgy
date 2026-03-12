import { type Transaction, type Category } from '../store/budgetStore';

export function exportTransactionsToCSV(transactions: Transaction[], categories: Category[], currency: string) {
    if (!transactions.length) return;

    // Create CSV header
    const headers = ['Date', 'Type', 'Catégorie', 'Description', 'Montant', 'Devise'];

    // Create CSV rows
    const rows = transactions.map(tx => {
        const category = categories.find(c => c.id === tx.categoryId);
        const typeLabel = tx.type === 'INCOME' ? 'Revenu' : 'Dépense';
        const categoryName = category ? category.name : 'Inconnue';

        // Escape quotes in description to prevent CSV breakage
        const safeDescription = tx.description ? `"${tx.description.replace(/"/g, '""')}"` : '';

        return [
            new Date(tx.date).toLocaleDateString('fr-FR'),
            typeLabel,
            `"${categoryName}"`,
            safeDescription,
            tx.amount.toFixed(2),
            currency
        ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Add BOM for Excel utf-8 recognition
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `budgy_export_${dateStr}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
