"use client";
import { useCallback, useEffect } from "react";
import { axFetchNotifications, axMarkRead } from "../api/notifApi.js";
import { useWxNotif } from "../state/notifStore.js";
import { jxGetTopN } from "../service/priorityService.js";
import { l } from "../../../logging_middleware/index.js";

export const useNotifications = () => {
    const { state, dispatch, AX_ACTIONS } = useWxNotif();

    useEffect(() => {
        const studentId = "stu_1042";
        const evtSource = new EventSource(`http://localhost:5000/api/notifications/stream/${studentId}`);

        evtSource.onmessage = (event) => {
            try {
                const newNotif = JSON.parse(event.data);
                dispatch({ type: AX_ACTIONS.NEW_NOTIF, payload: newNotif });
            } catch (err) {
                console.error(err);
            }
        };

        return () => {
            evtSource.close();
        };
    }, [dispatch, AX_ACTIONS]);

    const kxLoad = useCallback(async ({ notification_type, limit = 20, page = 1 } = {}) => {
        dispatch({ type: AX_ACTIONS.SET_LOADING, payload: true });
        try {
            const dk = await axFetchNotifications({ limit, page, notification_type });
            dispatch({ type: AX_ACTIONS.SET_NOTIFICATIONS, payload: dk });
        } catch (ek) {
            await l("frontend", "error", "hook", `useNotifications load error: ${ek.message}`);
            dispatch({ type: AX_ACTIONS.SET_ERROR, payload: ek.message });
        }
    }, [dispatch, AX_ACTIONS]);

    const kxLoadPriority = useCallback(async (topN = 10) => {
        dispatch({ type: AX_ACTIONS.SET_LOADING, payload: true });
        try {
            const dk = await axFetchNotifications({ limit: 100 });
            const top = jxGetTopN(dk.notifications || [], topN);
            dispatch({ type: AX_ACTIONS.SET_PRIORITY, payload: top });
        } catch (ek) {
            await l("frontend", "error", "hook", `Priority inbox load error: ${ek.message}`);
            dispatch({ type: AX_ACTIONS.SET_ERROR, payload: ek.message });
        }
    }, [dispatch, AX_ACTIONS]);

    const kxMarkRead = useCallback(async (notificationId) => {
        try {
            await axMarkRead(notificationId);
            dispatch({ type: AX_ACTIONS.MARK_READ, payload: notificationId });
        } catch (ek) {
            await l("frontend", "error", "hook", `Mark read failed: ${ek.message}`);
        }
    }, [dispatch, AX_ACTIONS]);

    const kxSetFilter = useCallback((filter) => {
        dispatch({ type: AX_ACTIONS.SET_FILTER, payload: filter });
    }, [dispatch, AX_ACTIONS]);

    const kxSetTopN = useCallback((n) => {
        dispatch({ type: AX_ACTIONS.SET_TOPN, payload: n });
    }, [dispatch, AX_ACTIONS]);

    return {
        ...state,
        kxLoad,
        kxLoadPriority,
        kxMarkRead,
        kxSetFilter,
        kxSetTopN,
    };
};
