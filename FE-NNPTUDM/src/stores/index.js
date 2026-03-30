import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import {
//   persistStore,
//   persistReducer,
// } from "redux-persist";
// import storage from "redux-persist/lib/storage";

import adminReducer, {
  reducerPath as adminReducerPath,
} from "@/features/Admin/AdminSlice";

import authReducer, {
  reducerPath as authReducerPath,
} from "@/features/Auth/AuthSlice";

import productReducer, {
  reducerPath as productReducerPath,
} from "@/features/Product/ProductSlice";

import cartReducer, {
  reducerPath as cartReducerPath,
} from "@/features/Cart/CartSlice";

import orderReducer, {
  reducerPath as orderReducerPath,
} from "@/features/Order/OrderSlice";

const rootReducer = combineReducers({
  [adminReducerPath]: adminReducer,
  [authReducerPath]: authReducer,
  [productReducerPath]: productReducer,
  [cartReducerPath]: cartReducer,
  [orderReducerPath]: orderReducer,
});

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["product"], // chỉ lưu product
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {},
      serializableCheck: false,
    }),
});

// export const persistor = persistStore(store);

window.store = store;
