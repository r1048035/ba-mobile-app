import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find(i => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i => i.id === action.item.id ? { ...i, quantity: i.quantity + action.qty } : i),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: action.qty }] };
    }
    case 'update':
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, quantity: action.qty } : i) };
    case 'remove':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'clear':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = (item, qty = 1) => dispatch({ type: 'add', item, qty });
  const updateItem = (id, qty) => dispatch({ type: 'update', id, qty });
  const removeItem = (id) => dispatch({ type: 'remove', id });
  const clear = () => dispatch({ type: 'clear' });

  const total = state.items.reduce((s, it) => s + (parseFloat(String(it.price || 0).replace(',', '.')) || 0) * (it.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ items: state.items, addItem, updateItem, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
