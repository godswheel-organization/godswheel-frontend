import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { authApi } from "@/features/auth/api/authApi";
import accountPromptReducer from "@/features/auth/store/accountPromptSlice";
import { bibleApi } from "@/features/bible/api/bibleApi";
import { libraryApi } from "@/features/library/api/libraryApi";
import { notesApi } from "@/features/notes/api/notesApi";
import playerReducer from "@/features/player/store/playerSlice";
import { sermonsApi } from "@/features/sermons/api/sermonsApi";
import { settingsApi } from "@/features/settings/api/settingsApi";

const apis = [authApi, sermonsApi, libraryApi, notesApi, settingsApi, bibleApi] as const;

// Each feature registers its RTK Query api slice (reducer + middleware) and any client-state slices here.
export const store = configureStore({
  reducer: {
    player: playerReducer,
    accountPrompt: accountPromptReducer,
    [authApi.reducerPath]: authApi.reducer,
    [sermonsApi.reducerPath]: sermonsApi.reducer,
    [libraryApi.reducerPath]: libraryApi.reducer,
    [notesApi.reducerPath]: notesApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [bibleApi.reducerPath]: bibleApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(...apis.map((api) => api.middleware)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
