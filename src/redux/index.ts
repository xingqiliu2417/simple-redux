const createStore = (reducer: { (state: {} | undefined, action: any): {}; (arg0: any, arg1: any): any; }, enhancer?: (createStore: any) => any) => {
  // 先处理enhancer
  // 如果enhancer存在并且是函数
  // 我们将createStore作为参数传给他
  // 应该返回一个新的createStore
  // 我再拿这个新的createStore执行, 应该得到一个store
  // 最后返回这个store
  if (enhancer && typeof enhancer === 'function') {
    const newCreateStore = enhancer(createStore);
    const newStore = newCreateStore(reducer);
    return newStore;
  }


  // state记录所有状态
  let state: any;
  // 保存所有注册的回调
  let listeners: any[] = [];
  // subscribe: 保存传进来的回调函数
  const subscribe = (callback: any) => {
    listeners.push(callback);
  }

  // dispatch: 就是将所有的回调拿出来依次执行就行
  const dispatch = (action: any) => {
    state = reducer(state, action);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  // getState: 直接返回当前的state
  const getState = () => (state);

  // store: 集合相关函数并导出
  const store = {
    subscribe,
    dispatch,
    getState
  }

  return store;
}

const combineReducers = (reducerMap: {
  [x: string]: any; milkState?: (state: { milk: number; } | undefined, action: {
    type: any; // 直接返回这个store就行
    // 直接返回这个store就行
    count: number;
  }) => { milk: number; }; riceState?: (state: { rice: number; } | undefined, action: { // subscribe就是将回调保存下来
    type: any; count: number;
  }) => { rice: number; };
}) => {
  const reducerKeys = Object.keys(reducerMap);    // 先把参数里面所有的键值拿出来

  // 返回值是一个普通结构的reducer函数
  const reducer = (state = {}, action: any) => {
    const newState = {};

    for (let key of reducerKeys) {
      // reducerKeys[i]: 对应每个reducer
      // 组合成reducer新的State: newState[key]集合
      const currentReducer = reducerMap[key];
      // @ts-ignore
      const prevState = state[key];
      // @ts-ignore
      newState[key] = currentReducer(prevState, action);
    }

    return newState;
  };

  return reducer;
}

const compose = (...funcs: any[]) => {
  return funcs.reduce((a, b) => (...args: any) => a(b(...args)));
}

const applyMiddleware = (...middlewares: {
  (store: { getState: () => any; }): (next: (arg0: any) => any) => (action: {
    type: any;
  }) => any; (store: any): (next: (arg0: any) => any) => (action: any) => any;
}[]) => {
  function enhancer(createStore: (arg0: any) => any) {
    function newCreateStore(reducer: any) {
      const store = createStore(reducer);

      // 将middleware拿过来执行下，传入store
      // 得到第一层函数
      // const func = middleware(store);

      // 结构出原始的dispatch
      // const { dispatch } = store;

      // 将原始的dispatch函数传给func执行
      // 得到增强版的dispatch
      // const newDispatch = func(dispatch);

      // 多个middleware，先解构出dispatch => newDispatch的结构
      const chain = middlewares.map(middleware => middleware(store));
      const { dispatch } = store;

      // 用compose得到一个组合了所有newDispatch的函数
      const newDispatchGen = compose(...chain);
      // 执行这个函数得到newDispatch
      const newDispatch = newDispatchGen(dispatch);

      // 返回的时候用增强版的newDispatch替换原始的dispatch
      return { ...store, dispatch: newDispatch }
    }

    return newCreateStore;
  }

  return enhancer;
}

export { createStore, combineReducers, applyMiddleware, compose };
