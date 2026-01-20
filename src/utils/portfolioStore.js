/**
 * Helper to identify the current logged-in user.
 * Ensures data isolation between different accounts.
 */
const getUserPrefix = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    // Sanitize email to be used as a key (removes dots, @, etc.)
    if (user && user.email) {
      return user.email.replace(/[^a-zA-Z0-9]/g, '_');
    }
  } catch (e) {
    console.error("Auth Prefix Error", e);
  }
  return 'guest';
};

// --- PORTFOLIO LOGIC ---

export const getPortfolio = () => {
  const prefix = getUserPrefix();
  const data = localStorage.getItem(`${prefix}_portfolio`);
  return data ? JSON.parse(data) : [];
};

export const saveHolding = (newHolding) => {
  const prefix = getUserPrefix();
  const current = getPortfolio();
  const trades = getTrades();

  const existingIndex = current.findIndex(h => h.id === newHolding.id);

  if (existingIndex > -1) {
    const existing = current[existingIndex];
    const totalQty = Number(existing.quantity) + Number(newHolding.quantity);
    const totalCost = (existing.quantity * existing.avg_cost) + (newHolding.quantity * newHolding.price);

    current[existingIndex] = {
      ...existing,
      quantity: totalQty,
      avg_cost: totalCost / totalQty
    };
  } else {
    current.push({
      id: newHolding.id,
      symbol: newHolding.symbol,
      name: newHolding.name,
      quantity: Number(newHolding.quantity),
      avg_cost: Number(newHolding.price),
      image: newHolding.image
    });
  }

  // Record BUY transaction
  trades.unshift({
    id: Date.now(),
    coinId: newHolding.id,
    symbol: newHolding.symbol,
    name: newHolding.name,
    type: 'BUY',
    quantity: Number(newHolding.quantity),
    price: Number(newHolding.price),
    total: Number(newHolding.quantity) * Number(newHolding.price),
    executed_at: new Date().toISOString()
  });

  localStorage.setItem(`${prefix}_portfolio`, JSON.stringify(current));
  localStorage.setItem(`${prefix}_trades`, JSON.stringify(trades));

  window.dispatchEvent(new Event('portfolioUpdate'));
};

/**
 * SELL LOGIC
 */
export const sellHolding = (sellData) => {
  const prefix = getUserPrefix();
  const current = getPortfolio();
  const trades = getTrades();

  const existingIndex = current.findIndex(h => h.id === sellData.id);

  if (existingIndex > -1) {
    const existing = current[existingIndex];
    const sellQty = Number(sellData.quantity);

    if (existing.quantity < sellQty) {
      alert(`Insufficient balance. You only own ${existing.quantity} ${existing.symbol.toUpperCase()}`);
      return false;
    }

    const remainingQty = existing.quantity - sellQty;

    if (remainingQty === 0) {
      current.splice(existingIndex, 1);
    } else {
      current[existingIndex] = {
        ...existing,
        quantity: remainingQty
      };
    }

    trades.unshift({
      id: Date.now(),
      coinId: sellData.id,
      symbol: sellData.symbol,
      name: sellData.name,
      type: 'SELL',
      quantity: sellQty,
      price: Number(sellData.price),
      total: sellQty * Number(sellData.price),
      executed_at: new Date().toISOString()
    });

    localStorage.setItem(`${prefix}_portfolio`, JSON.stringify(current));
    localStorage.setItem(`${prefix}_trades`, JSON.stringify(trades));

    window.dispatchEvent(new Event('portfolioUpdate'));
    return true;
  } else {
    alert("Asset not found in portfolio.");
    return false;
  }
};

// --- TRADE LOGIC ---

export const getTrades = () => {
  const prefix = getUserPrefix();
  const data = localStorage.getItem(`${prefix}_trades`);
  return data ? JSON.parse(data) : [];
};

// --- WATCHLIST LOGIC ---

export const getWatchlist = () => {
  const prefix = getUserPrefix();
  const data = localStorage.getItem(`${prefix}_watchlist`);
  try {
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const toggleWatchlist = (coinId) => {
  if (!coinId) return;
  const prefix = getUserPrefix();
  let list = getWatchlist();

  if (list.includes(coinId)) {
    list = list.filter(id => id !== coinId);
  } else {
    list.push(coinId);
  }

  localStorage.setItem(`${prefix}_watchlist`, JSON.stringify(list));
  window.dispatchEvent(new Event('watchlistUpdate'));
  return list;
};

export const isCoinWatched = (coinId) => {
  const list = getWatchlist();
  return list.includes(coinId);
};