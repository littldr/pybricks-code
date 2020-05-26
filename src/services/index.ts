// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Middleware } from 'redux';
import { Action, Dispatch } from '../actions';
import { RootState } from '../reducers';
import bootloader from './bootloader';
import editor from './editor';

type Service = (action: Action, dispatch: Dispatch, state: RootState) => Promise<void>;

function runService(
    service: Service,
    action: Action,
    dispatch: Dispatch,
    state: RootState,
): void {
    service(action, dispatch, state).catch((err) =>
        console.log(`Unhandled exception in service: ${err}`),
    );
}

export function combineServices(...services: Service[]): Service {
    return (a, d, s): Promise<void> => {
        services.forEach((x) => runService(x, a, d, s));
        return Promise.resolve();
    };
}

const rootService = combineServices(bootloader, editor);

const serviceMiddleware: Middleware = (store) => (next) => (action): unknown => {
    runService(rootService, action, store.dispatch, store.getState());
    return next(action);
};

export default serviceMiddleware;
