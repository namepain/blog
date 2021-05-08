/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Context, createContext, FC, ReactElement, useContext } from 'react'

type Selector<Value> = (value: Value) => any

type SelectorHook<Selectors> = {
  [k in keyof Selectors]: () => Selectors[k] extends (...args: any) => infer R ? R : never
}

type Hook<Value, Selectors extends Selector<Value>[]> = Selectors['length'] extends 0
  ? [() => Value]
  : SelectorHook<Selectors>

type ConstateTuple<Props, Value, Selectors extends Selector<Value>[]> = [FC<Props>, ...Hook<Value, Selectors>]

const EMPTY_OBJ = {}

export default function constate<
  Props,
  Value,
  Selectors extends Selector<Value>[]
>(useValues: (props: Props) => Value, ...selectors: Selectors): ConstateTuple<Props, Value, Selectors> {
  const contexts = [] as Context<any>[]
  const hooks = ([] as unknown) as Hook<Value, Selectors>

  function createCtx() {
    const ctx = createContext(EMPTY_OBJ)
    contexts.push(ctx)
    hooks.push(createUseContext(ctx))
  }

  if (selectors.length) {
    selectors.forEach(() => createCtx())
  } else {
    createCtx()
  }

  const Provider: FC<Props> = ({ children, ...props }) => {
    const values = useValues(props as Props)
    let element = children as ReactElement

    for (let i = 0; i < selectors.length; i++) {
      const ctx = contexts[i]
      const selector = selectors[i]
      element = (
        <ctx.Provider value={selector(values)}>{element}</ctx.Provider>
      )
    }

    return element
  }

  return [Provider, ...hooks]
}

function createUseContext(ctx: Context<any>) {
  return () => {
    const value = useContext(ctx)
    if (value === EMPTY_OBJ) {
      console.error('组件必须包裹在 Provider 下')
    }
    return value
  }
}
