import 'babel-polyfill'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider, connect } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { call, put, fork, takeEvery } from 'redux-saga/effects'
import request from 'superagent'

// React component
class Counter extends Component {
  render() {
    const { value, onIncreaseClick, onDecreaseClick } = this.props
    return (
      <div>
        <span>{value}</span>
        <button onClick={onIncreaseClick}>Increase</button>
        <button onClick={onDecreaseClick}>Decrease</button>
      </div>
    )
  }
}

Counter.propTypes = {
  value: PropTypes.number.isRequired,
  onIncreaseClick: PropTypes.func.isRequired,
  onDecreaseClick: PropTypes.func.isRequired,
}

class Clock extends Component {
  render() {
    const { time, onClickForTime } = this.props

    return(
      <div>
        <span>{time}</span>
        <button onClick={onClickForTime}>GET CURRENT TIME</button>
      </div>
    )
  }
}

Clock.propTypes = {
  time: PropTypes.string.isRequired,
  onClickForTime: PropTypes.func.isRequired
}

// Counter Action Creater
const increaseAction = { type: 'increase' }
const decreaseAction = { type: 'decrease' }

// Clock Action Creater
const getCurrentTimeAction = { type: 'manage_api' }

// Reducer
function counter(state = { count: 0 }, action) {
  const count = state.count
  switch (action.type) {
    case 'increase':
      return { count: count + 1 }
    case 'decrease':
      return { count: count - 1 }
    default:
      return state
  }
}

function clock(state = { time: 'YYYY-MM-DD' }, action) {
  switch (action.type) {
    case 'get_current_time':
      return { time: action.result.time }
    default:
      return state
  }
}

const reducer = combineReducers({
                  clock,
                  counter
                })

// Store with Saga
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  reducer,
  {},
  applyMiddleware(sagaMiddleware)
);

function checkoutSuccess(result) {
  return {
    type: 'get_current_time',
    result
  }
}

function* runCurrentTimeRequest(action) {
  const response = yield call(request.get, 'http://date.jsontest.com/')
  yield put(checkoutSuccess(response.body))
}

function* handleCurrentTime() {
  yield takeEvery('manage_api', runCurrentTimeRequest)
}

function* rootSaga() {
  yield fork(handleCurrentTime)
}

sagaMiddleware.run(rootSaga)

// Map Redux state to component props
function mapCounterStateToProps(state) {
  return {
    value: state.counter.count
  }
}

// Map Redux actions to component props
function mapCounterDispatchToProps(dispatch) {
  return {
    onIncreaseClick: () => dispatch(increaseAction),
    onDecreaseClick: () => dispatch(decreaseAction)
  }
}

// Map Redux state to component props
function mapClockStateToProps(state) {
  return {
    time: state.clock.time
  }
}

// Map Redux actions to component props
function mapClockDispatchToProps(dispatch) {
  return {
    onClickForTime: () => dispatch(getCurrentTimeAction)
  }
}

// Connected Component == Container
const CounterContainer = connect(
  mapCounterStateToProps,
  mapCounterDispatchToProps
)(Counter)

const ClockContainer = connect(
  mapClockStateToProps,
  mapClockDispatchToProps
)(Clock)

const App = () => (
  <div>
    <CounterContainer />
    <ClockContainer />
  </div>
)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
