# 撤销重做的程序设计

在编辑器类的程序中，撤销重做是非常普遍的功能。对其进行抽象、复用可以大幅提高开发效率。

## 基于 snapshot 的撤销重做

这是最简单、有效的实现方式。把所有可撤销重做的状态集中到一个 object 里，修改状态后，产生一个新的 object 并放到操作历史数组中，增加游标来指示当前的状态，移动游标即可实现撤销重做。

```tsx
import * as React from "react"
import produce, { castDraft } from "immer"
import { WritableDraft } from "immer/dist/types/types-external"

function useUndoRedo<T>(defaultState: T) {
  const [history, setHistory] = React.useState({
    states: [defaultState] as readonly T[], // 操作历史数组
    stateIndex: 0, // 游标
  })

  const { stateIndex, states } = history
  const canUndo = stateIndex > 0
  const canRedo = stateIndex < states.length - 1
  const state = states[stateIndex]

  return {
    state,
    setState: (recipe: (draft: WritableDraft<T>) => void) => {
      const s = produce(state, recipe)
      const newStateIndex = stateIndex + 1
      setHistory(produce(history, (draft) => {
        draft.states.splice(newStateIndex, draft.states.length, castDraft(s))
        draft.stateIndex = newStateIndex
      }))
      return s
    },
    canUndo,
    canRedo,
    undo: (e?: { preventDefault(): void }) => {
      e?.preventDefault()
      if (canUndo) {
        setHistory(produce(history, (draft) => {
          draft.stateIndex = stateIndex - 1
        }))
      }
    },
    redo: (e?: { preventDefault(): void }) => {
      e?.preventDefault()
      if (canRedo) {
        setHistory(produce(history, (draft) => {
          draft.stateIndex = stateIndex + 1
        }))
      }
    },
  }
}

interface LeafData {
  value: string
}

function LeafComponent(props: {
  value: LeafData
  onChange?: (value: LeafData) => void
}) {
  return (
    <input
      value={props.value.value}
      onChange={(e) => {
        // 对于叶组件，暴露 onChange，在值被修改时返回新值
        props.onChange?.(produce(props.value, (draft) => {
          draft.value = e.target.value
        }))
      }}
    />
  )
}

interface BranchData {
  leaf: LeafData
}

function BranchComponent(props: {
  value: BranchData
  onChange?: (value: BranchData) => void
}) {
  return (
    <LeafComponent
      value={props.value.leaf}
      onChange={(v) => {
        // 对于中间组件，暴露 onChange，在值被修改时返回新值
        props.onChange?.(produce(props.value, (draft) => {
          draft.leaf = castDraft(v)
        }))
      }}
    />
  )
}

function Main() {
  const { state, setState } = useUndoRedo<{ branch: BranchData }>({
    branch: {
      leaf: {
        value: 'a',
      }
    }
  })

  return (
    <BranchComponent
      value={state.branch}
      onChange={(v) => setState((draft) => draft.branch = v)}
    />
  )
}
```

## 基于 patch 的撤销重做

当有多个用户进行同时编辑时，业务上要求不能撤销别人的修改，这时基于 snapshot 就没法实现撤销重做了。

基于 patch 来实现时，如果多个用户改的不是同一个分支，撤销 patch 就不会互相影响了。

基于 patch 来实现时，记录的不再是状态修改结果，而是 patch 和反向 patch 历史，每次 patch 都记录操作者，以实现用户操作的隔离。

```tsx
import * as React from "react"
import produce, { applyPatches, castDraft, enablePatches } from "immer"
import { Patch, PatchListener } from "immer/dist/types/types-external"

function useUndoRedo<T, P>(defaultState: T, operator: P) {
  const [history, setHistory] = React.useState({
    state: defaultState, // 当前状态
    patchIndex: -1, // 游标
    patches: [] as [Patch[], Patch[], P][], // patch 记录和操作者历史
  })

  // 游标向前找当前操作者自己的 patch index，以便确定能否撤销，撤销哪个 patch
  const undoCurrentIndex = getPreviousIndex(history.patchIndex, history.patches, (p) => p[2] === operator)
  // 游标向后找当前操作者自己的 patch index，以便确定能否重做，重做哪个 patch
  const redoNextIndex = getNextIndex(history.patchIndex + 1, history.patches, (p) => p[2] === operator)
  const canUndo = undoCurrentIndex >= 0
  const canRedo = redoNextIndex < history.patches.length

  return {
    state: history.state,
    setState: (patches: Patch[], reversePatches: Patch[], operator: P) => {
      // 修改状态时，除了记录 patch，应用 patch 到当前状态，形成新的当前状态
      const s = applyPatches(history.state, patches)
      const newStateIndex = history.patchIndex + 1
      setHistory(produce(history, (draft) => {
        draft.patches.splice(newStateIndex, draft.patches.length, [patches, reversePatches, castDraft(operator)])
        draft.patchIndex = newStateIndex
        draft.state = castDraft(s)
      }))
      return s
    },
    canUndo,
    canRedo,
    undo: (e?: { preventDefault(): void }) => {
      e?.preventDefault()
      if (canUndo) {
        setHistory(produce(history, (draft) => {
          draft.patchIndex = undoCurrentIndex - 1
          // 撤销时应用反向 patch
          draft.state = castDraft(applyPatches(history.state, history.patches[undoCurrentIndex][1]))
        }))
      }
    },
    redo: (e?: { preventDefault(): void }) => {
      e?.preventDefault()
      if (canRedo) {
        setHistory(produce(history, (draft) => {
          draft.patchIndex = redoNextIndex
          // 重做时应用 patch
          draft.state = castDraft(applyPatches(history.state, history.patches[redoNextIndex][0]))
        }))
      }
    },
  }
}

function getPreviousIndex<T>(startIndex: number, items: T[], predicate: (item: T) => boolean) {
  for (let i = startIndex; i >= 0; i--) {
    if (predicate(items[i])) {
      return i
    }
  }
  return -Infinity
}

function getNextIndex<T>(startIndex: number, items: T[], predicate: (item: T) => boolean) {
  for (let i = startIndex; i < items.length; i++) {
    if (predicate(items[i])) {
      return i
    }
  }
  return Infinity
}

enablePatches()

interface LeafData {
  value: string
}

function LeafComponent(props: {
  value: LeafData
  onChange?: (value: LeafData) => void
  onPatch?: PatchListener
}) {
  return (
    <input
      value={props.value.value}
      onChange={(e) => {
        // 对于叶组件，增加暴露 onPatch，在值被修改时返回 patches
        const newValue = produce(props.value, (draft) => {
          draft.value = e.target.value
        }, props.onPatch)
        props.onChange?.(newValue)
      }}
    />
  )
}

interface BranchData {
  leaf: LeafData
}

function BranchComponent(props: {
  value: BranchData
  onChange?: (value: BranchData) => void
  onPatch?: PatchListener
}) {
  return (
    <LeafComponent
      value={props.value.leaf}
      onChange={(v) => {
        props.onChange?.(produce(props.value, (draft) => {
          draft.leaf = castDraft(v)
        }))
      }}
      // 对于中间组件，增加暴露 onPatch，在值被修改时返回 patches
      onPatch={props.onPatch ? (patches, inversePatches) => {
        props.onPatch?.(prependPatchesPath('bar', patches), prependPatchesPath('bar', inversePatches))
      } : undefined}
    />
  )
}

function prependPatchesPath(path: number | string, patches: Patch[]) {
  return patches.map((p) => ({
    ...p,
    path: [path, ...p.path],
  }))
}

function Main() {
  const { state, setState } = useUndoRedo<{ branch: BranchData }, number>({
    branch: {
      leaf: {
        value: 'a',
      }
    }
  }, 1)
  // 模拟别人修改状态
  React.useEffect(() => {
    setTimeout(() => {
      produce(state, (draft) => {
        draft.branch.leaf.value = 'b'
      }, (patches, reversePatches) => {
        setState(patches, reversePatches, 2)
      })
    }, 2000)
  }, [])
  return (
    <BranchComponent
      value={state.branch}
      onPatch={(patches, inversePatches) => {
        setState(patches, inversePatches, 1)
      }}
    />
  )
}
```
