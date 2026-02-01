# Form Validation System

Type-safe form validation using React Hook Form + Zod.

## Quick Start

```tsx
import { Form, FormField, SubmitButton } from '@/components/ui/Form'
import { loginSchema, LoginFormData } from '@/lib/validation'

function LoginForm() {
  const handleSubmit = async (data: LoginFormData) => {
    // data is fully typed and validated
    await signIn(data.email, data.password)
  }

  return (
    <Form schema={loginSchema} onSubmit={handleSubmit} className="space-y-4">
      <FormField name="email" label="Email" type="email" placeholder="you@example.com" />
      <FormField name="password" label="Password" type="password" />
      <SubmitButton>Sign In</SubmitButton>
    </Form>
  )
}
```

## Available Schemas

### Auth
- `loginSchema` - Email + password
- `signupSchema` - Email, password, confirm, optional name
- `forgotPasswordSchema` - Email only
- `resetPasswordSchema` - New password + confirm

### Profile
- `profileSchema` - Full profile fields
- `changePasswordSchema` - Current + new password + confirm

### Content
- `transcriptUploadSchema` - Title, description, customer info, tags
- `contentGenerationSchema` - Template selection, options
- `projectSchema` - Name, description, color

### Other
- `billingInfoSchema` - Name, address, tax ID
- `contactSchema` - Contact form
- `feedbackSchema` - Rating + feedback

## Components

### Form
Root component that provides context and handles submission.

```tsx
<Form 
  schema={schema}
  onSubmit={handler}
  defaultValues={{ email: '' }}
  mode="onBlur" // or onChange, onSubmit
>
  {children}
</Form>
```

### FormField
Text inputs, textareas, and selects with built-in error display.

```tsx
<FormField name="email" label="Email" type="email" />
<FormField name="bio" type="textarea" rows={6} />
<FormField name="role" type="select">
  <option value="">Select role...</option>
  <option value="admin">Admin</option>
</FormField>
```

### CheckboxField
```tsx
<CheckboxField name="terms" label="I agree to the terms" />
```

### RadioGroupField
```tsx
<RadioGroupField 
  name="plan"
  label="Select Plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
  ]}
/>
```

### SubmitButton
Auto-disables and shows loading state during submission.

```tsx
<SubmitButton loadingText="Saving...">Save Changes</SubmitButton>
```

### FormErrorSummary
Displays all errors in a summary box.

```tsx
<FormErrorSummary />
```

### FormSuccess
Success message display.

```tsx
{isSuccess && <FormSuccess message="Settings saved!" />}
```

## Standalone Hook

For more control, use the hook directly:

```tsx
import { useZodForm } from '@/components/ui/Form'
import { profileSchema } from '@/lib/validation'

function ProfileForm() {
  const form = useZodForm(profileSchema, {
    defaultValues: { name: user.name }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}
    </form>
  )
}
```

## Creating Custom Schemas

```tsx
import { z } from 'zod'

const myFormSchema = z.object({
  title: z.string().min(1, 'Required').max(100),
  category: z.enum(['a', 'b', 'c']),
  count: z.number().min(0).max(100),
})

type MyFormData = z.infer<typeof myFormSchema>
```

## Validation Helper

For server-side or non-form validation:

```tsx
import { validateForm, loginSchema } from '@/lib/validation'

const result = validateForm(loginSchema, req.body)
if (!result.success) {
  return res.status(400).json({ errors: result.errors })
}
// result.data is typed and validated
```
