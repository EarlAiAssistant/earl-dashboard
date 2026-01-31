# Optimistic UI Updates

Update UI immediately on user action, sync with server in background, rollback on error.

## Quick Start

### Toggle (like/favorite/checkbox)

```tsx
import { useOptimisticToggle } from '@/lib/optimistic'

function FavoriteButton({ item }) {
  const { isActive, toggle, isPending } = useOptimisticToggle(
    item.isFavorited,
    async (newValue) => {
      await api.setFavorite(item.id, newValue)
    },
    { errorMessage: 'Failed to update favorite' }
  )

  return (
    <button onClick={toggle} disabled={isPending}>
      {isActive ? '★' : '☆'}
    </button>
  )
}
```

### Counter (votes, quantity)

```tsx
import { useOptimisticCounter } from '@/lib/optimistic'

function VoteButtons({ item }) {
  const { count, increment, decrement, isPending } = useOptimisticCounter(
    item.votes,
    async (newCount) => await api.setVotes(item.id, newCount),
    { min: 0 }
  )

  return (
    <div>
      <button onClick={() => decrement()} disabled={isPending}>-</button>
      <span>{count}</span>
      <button onClick={() => increment()} disabled={isPending}>+</button>
    </div>
  )
}
```

### List Operations

```tsx
import { useOptimisticList } from '@/lib/optimistic'

function TodoList({ serverTodos }) {
  const { items, addItem, deleteItem, isPending } = useOptimisticList(
    serverTodos,
    (items, action) => {
      switch (action.type) {
        case 'add':
          return [...items, action.item]
        case 'delete':
          return items.filter(i => i.id !== action.item.id)
        default:
          return items
      }
    }
  )

  const handleAdd = () => {
    const newTodo = { id: crypto.randomUUID(), text: 'New todo', done: false }
    addItem(newTodo, () => api.createTodo(newTodo))
  }

  return (
    <ul>
      {items.map(todo => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => deleteItem(todo, () => api.deleteTodo(todo.id))}>
            Delete
          </button>
        </li>
      ))}
      <button onClick={handleAdd}>Add Todo</button>
    </ul>
  )
}
```

### Generic Mutation

```tsx
import { useOptimisticMutation } from '@/lib/optimistic'

function ProfileForm({ profile, setProfile }) {
  const { mutate, isPending } = useOptimisticMutation({
    mutationFn: (data) => api.updateProfile(data),
    onMutate: (data) => {
      const previous = { ...profile }
      setProfile({ ...profile, ...data })
      return previous
    },
    onError: (error, data, rollback) => rollback(),
    successMessage: 'Profile updated!',
    errorMessage: 'Failed to update profile'
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutate({ name: e.target.name.value })
    }}>
      <input name="name" defaultValue={profile.name} />
      <button disabled={isPending}>Save</button>
    </form>
  )
}
```

## Available Hooks

| Hook | Use Case |
|------|----------|
| `useOptimisticToggle` | Boolean toggles (like, favorite, checkbox) |
| `useOptimisticCounter` | Number changes (votes, quantity, rating) |
| `useOptimisticList` | List CRUD (add, update, delete items) |
| `useOptimisticMutation` | Generic mutations with rollback |

## Utility Function

For wrapping existing server actions:

```tsx
import { withOptimistic } from '@/lib/optimistic'

const optimisticSave = withOptimistic(
  serverSaveFn,
  {
    onOptimistic: (data) => updateLocalCache(data),
    onSuccess: () => toast.success('Saved!'),
    onError: (err, data, rollback) => {
      rollback()
      toast.error('Failed')
    }
  }
)
```

## How It Works

1. **User clicks** → UI updates immediately (optimistic)
2. **Server request** → Runs in background
3. **Success** → Server confirms, done
4. **Error** → Rollback to previous state, show error

Uses React 19's `useOptimistic` and `useTransition` under the hood.
