import { TabApi, TabPageApi, TabBladeParams, FolderApi } from '@tweakpane/core'
import { RefObject, useLayoutEffect, useRef } from 'react'
import { FolderInstance } from './usePaneFolder'

interface UseTabBladeParams {
  pages: {
    title: string;
  }[];
}

export function asFolderInstance<T extends object>(
  tab: RefObject<TabPageInstance<T>>
): RefObject<FolderInstance<T>> {
  return tab as unknown as RefObject<FolderInstance<T>>
}

// Create a wrapper that makes TabPageApi behave like FolderApi
export interface TabPageInstance<T extends {}> {
  instance: TabPageApi | FolderApi
  params: T
}

export function useTabBlade<T extends Object>(
  paneRef: RefObject<FolderInstance<T>>,
  params: UseTabBladeParams
): {
  tabRef: RefObject<TabApi>,
  tabs: RefObject<TabPageInstance<T>>[]
} {
  const tabRef = useRef<TabApi>(null!)
  const tabsRef = useRef<RefObject<TabPageInstance<T>>[]>([])

  useLayoutEffect(() => {
    const pane = paneRef.current?.instance
    if (pane == null) return

    const tab = pane.addTab({
      ...params,
      view: 'tab'
    } as TabBladeParams) as TabApi

    tabRef.current = tab

    // Since TabPageApi implements ContainerApi, we can use it directly
    tabsRef.current = tab.pages.map(page => ({
      current: {
        instance: page,
        params: paneRef.current?.params || ({} as T)
      }
    }))

    return () => {
      if (tab.element) tab.dispose()
    }
  }, [])

  return {
    tabRef,
    tabs: tabsRef.current
  }
}