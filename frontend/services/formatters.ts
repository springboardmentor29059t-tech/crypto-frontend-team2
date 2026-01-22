export const formatShortValue = (val: number, isPrice: boolean = false): string => {
    if (val === undefined || val === null) return '0';

    if (isPrice && val < 1000) {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (val >= 1e12) return (val / 1e12).toFixed(2) + 'T';
    if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return (val / 1e3).toFixed(2) + 'K';

    return val.toLocaleString('en-US');
};

export const formatFullNumber = (val: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.floor(val));
};
