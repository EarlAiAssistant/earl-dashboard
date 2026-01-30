-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tasks table for Kanban board
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null check (status in ('backlog', 'in_progress', 'done')),
  session_key text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  position integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Activity log table
create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  action_type text not null,
  details text,
  status text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Documents table
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  filename text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  uploaded_at timestamp with time zone default now()
);

-- Indexes for better query performance
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_session_key on public.tasks(session_key);
create index idx_tasks_created_at on public.tasks(created_at desc);
create index idx_activity_log_created_at on public.activity_log(created_at desc);
create index idx_activity_log_action_type on public.activity_log(action_type);
create index idx_documents_uploaded_at on public.documents(uploaded_at desc);

-- Enable Row Level Security
alter table public.tasks enable row level security;
alter table public.activity_log enable row level security;
alter table public.documents enable row level security;

-- Policies (authenticated users can do everything for single-user app)
create policy "Enable all access for authenticated users" on public.tasks
  for all using (auth.uid() is not null);

create policy "Enable all access for authenticated users" on public.activity_log
  for all using (auth.uid() is not null);

create policy "Enable all access for authenticated users" on public.documents
  for all using (auth.uid() is not null);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

-- Storage bucket for documents
insert into storage.buckets (id, name, public) 
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policy for authenticated users
create policy "Authenticated users can upload documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documents');

create policy "Authenticated users can read documents"
on storage.objects for select
to authenticated
using (bucket_id = 'documents');

create policy "Authenticated users can delete documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'documents');
