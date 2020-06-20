import { useState, Dispatch, SetStateAction, useReducer, useEffect } from "react";
import axios from "axios";

interface FetchAction<T> {
    type: "FETCH_INIT" | "FETCH_FAILURE" | "FETCH_SUCCESS"
    payload?: T
}
interface FetchState<T> {
    isLoading: boolean
    isError: boolean
    data?: T
}

type FetchReducer<T> = (state: FetchState<T>, action: FetchAction<T>) => FetchState<T>

function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, isLoading: true, isError: false };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case 'FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        default:
            throw new Error();
    }
};

export interface Fetcher<T> {
    state: FetchState<T>
    setUrl: Dispatch<SetStateAction<string|null>>,
    refresh: () => () => void
}


export function useFetch<T>(initialUrl: string|null, initialData?: T): Fetcher<T> {

    const [url, setUrl] = useState<string|null>(initialUrl)


    const [state, dispatch] = useReducer<FetchReducer<T>>(fetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData,
    });

    const doFetch = () => {
        let didCancel = false;

        if (url === null) {
            return () => {}
        }

        const fetchData = async () => {
            dispatch({ type: 'FETCH_INIT' });

            try {
                const result = await axios(url);

                if (!didCancel) {
                    dispatch({ type: 'FETCH_SUCCESS', payload: result.data as T });
                }
            } catch (error) {
                if (!didCancel) {
                    dispatch({ type: 'FETCH_FAILURE' });
                }
            }
        };

        fetchData();

        return () => {
            didCancel = true;
        };
    }

    useEffect(doFetch, [url]);

    return {state, setUrl, refresh: doFetch};
};