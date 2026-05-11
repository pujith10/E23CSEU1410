"use client";
import { createContext, useContext, useReducer } from "react";

const gxInitState = {
    notifications: [],
    priorityNotifs: [],
    unreadCount: 0,
    loading: false,
    error: null,
    activeFilter: "all",
    topN: 10,
};

const AX_ACTIONS = {
    SET_LOADING: "SET_LOADING",
    SET_NOTIFICATIONS: "SET_NOTIFICATIONS",
    SET_PRIORITY: "SET_PRIORITY",
    SET_ERROR: "SET_ERROR",
    SET_FILTER: "SET_FILTER",
    SET_TOPN: "SET_TOPN",
    MARK_READ: "MARK_READ",
    NEW_NOTIF: "NEW_NOTIF",
};

const rxReducer = (state, action) => {
    switch (action.type) {
        case AX_ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case AX_ACTIONS.SET_NOTIFICATIONS:
            return {
                ...state,
                notifications: action.payload.notifications || [],
                unreadCount: action.payload.unreadCount ?? state.unreadCount,
                loading: false,
                error: null,
            };
        case AX_ACTIONS.SET_PRIORITY:
            return { ...state, priorityNotifs: action.payload, loading: false };
        case AX_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false };
        case AX_ACTIONS.SET_FILTER:
            return { ...state, activeFilter: action.payload };
        case AX_ACTIONS.SET_TOPN:
            return { ...state, topN: action.payload };
        case AX_ACTIONS.MARK_READ:
            return {
                ...state,
                notifications: state.notifications.map((nf) =>
                    (nf.ID === action.payload || nf.id === action.payload) ? { ...nf, is_read: true } : nf
                ),
                priorityNotifs: state.priorityNotifs.map((nf) =>
                    (nf.ID === action.payload || nf.id === action.payload) ? { ...nf, is_read: true } : nf
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            };
        case AX_ACTIONS.NEW_NOTIF:
            return {
                ...state,
                notifications: [action.payload, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            };
        default:
            return state;
    }
};

const WxNotifContext = createContext(null);

export function WxNotifProvider({ children }) {
    const [state, dispatch] = useReducer(rxReducer, gxInitState);
    return (
        <WxNotifContext.Provider value={{ state, dispatch, AX_ACTIONS }}>
            {children}
        </WxNotifContext.Provider>
    );
}

export const useWxNotif = () => {
    const ctx = useContext(WxNotifContext);
    if (!ctx) throw new Error("useWxNotif must be used inside WxNotifProvider");
    return ctx;
};
