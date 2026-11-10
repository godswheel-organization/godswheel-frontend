import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Why a guest is being asked to create an account (06/07 in the design): the feature they just tried.
export type AccountPromptReason = "save" | "share" | "note";

interface AccountPromptState {
  reason: AccountPromptReason | null;
}

const initialState: AccountPromptState = { reason: null };

// One prompt for the whole app, so any button can ask for it (dispatch(openAccountPrompt("save")))
// without each mounting its own modal.
const accountPromptSlice = createSlice({
  name: "accountPrompt",
  initialState,
  reducers: {
    openAccountPrompt(state, action: PayloadAction<AccountPromptReason>) {
      state.reason = action.payload;
    },
    closeAccountPrompt(state) {
      state.reason = null;
    },
  },
});

export const { openAccountPrompt, closeAccountPrompt } = accountPromptSlice.actions;
export default accountPromptSlice.reducer;
