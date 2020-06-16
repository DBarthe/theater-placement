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


export function useFetch<T>(initialUrl: string, initialData?: T): [FetchState<T>, Dispatch<SetStateAction<string>>] {

    const [url, setUrl] = useState<string>(initialUrl)

    const [state, dispatch] = useReducer<FetchReducer<T>>(fetchReducer, {
        // const [state, dispatch] = useReducer(fetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData,
    });

    useEffect(() => {
        let didCancel = false;

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
    }, [url]);

    return [state, setUrl];
};