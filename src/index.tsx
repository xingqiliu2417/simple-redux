import { createStore, combineReducers, applyMiddleware } from './redux';

const defaultNum = {
	num: 0
};

const numReducer = (state = defaultNum, action: { type: any; count: number; }) => {
	switch(action.type) {
		case 'ADD_NUM':
			return { ...state, num: state.num + action.count };
		case 'DECREASE_NUM':
			return { ...state, num: state.num - action.count };
		default:
			return state;
	}
}

const defaultTheme = {
  color: 'red',
	fontSize: 16
};

const themeReducer = (state = defaultTheme, action: { type: any; color: any; fontSize: any; }) => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, color: action.color };
		case 'SET_FONTSIZE':
			return { ...state, fontSize: action.fontSize };
    default:
      return state;
  }
}

// 使用combineReducers组合两个reducer
const reducer = combineReducers({numState: numReducer, themeState: themeReducer});

// logger是一个中间件
const logger = (store: { getState: () => any; }) => (next: (arg0: any) => any) => (action: { type: any; }) => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
}

const logger2 = (store: any) => {
  return (next: (arg0: any) => any) => {
    return (action: any) => {
      const result = next(action);
      console.log('logger2');
      return result
    }
  }
}

let store = createStore(reducer, applyMiddleware(logger, logger2));

// subscribe其实就是订阅store的变化，一旦store发生了变化，传入的回调函数就会被调用
// 如果是结合页面更新，更新的操作就是在这里执行
store.subscribe(() => console.log(store.getState()));

// 将action发出去就要用dispatch
// 操作num的action
store.dispatch({ type: 'ADD_NUM', count: 1 });
store.dispatch({ type: 'DECREASE_NUM', count: 2 });

// 操作theme的action
store.dispatch({ type: 'SET_THEME', color: 'green' });
store.dispatch({ type: 'SET_FONTSIZE', fontSize: 18 });
