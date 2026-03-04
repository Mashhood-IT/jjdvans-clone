import { createSlice } from '@reduxjs/toolkit';

const currencyOptions = [
  { value: 'GBP', symbol: '£', label: 'British Pound' },
  { value: 'USD', symbol: '$', label: 'US Dollar' },
  { value: 'EUR', symbol: '€', label: 'Euro' },
];

const initialState = {
  currency: 'GBP',
  symbol: '£',
  options: currencyOptions,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      const selectedCurrency = action.payload;
      const selectedOption = state.options.find(
        (option) => option.value === selectedCurrency
      );

      if (selectedOption) {
        state.currency = selectedCurrency;
        state.symbol = selectedOption.symbol;
      }
    },
  },
});

export const { setCurrency } = currencySlice.actions;

export const selectCurrency = (state) => state.currency.currency;
export const selectCurrencySymbol = (state) => state.currency.symbol;

export default currencySlice.reducer;