import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hcpName: '',
  interactionType: 'Meeting',
  date: '',
  time: '',
  attendees: '',
  topicsDiscussed: '',
  materialsShared: [],
  samplesDistributed: [],
  sentiment: 'Neutral',
  outcomes: '',
  followUpActions: '',
  aiSuggestedFollowUps: [],
  loading: false,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormData: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearForm: () => initialState,
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setFormData, clearForm, setLoading } = formSlice.actions;
export default formSlice.reducer;