-- Feedback form table.
--
-- 20251028190000 already creates `feedback` with a single `message` column, so
-- this migration upgrades that table to the form schema instead of assuming it
-- is new. `message` is kept (now optional) because the admin panel reads it.
-- Safe to run more than once.

create table if not exists public.feedback (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Form fields
alter table public.feedback
    add column if not exists message text,
    add column if not exists is_first_visit boolean,
    add column if not exists found_needed boolean,
    add column if not exists visit_reason text,
    add column if not exists not_found_info text,
    add column if not exists ease_of_use text check (
        ease_of_use in ('veryEasy', 'easy', 'neutral', 'difficult', 'veryDifficult')
    ),
    add column if not exists device_usage text check (
        device_usage in ('1-2', '3-5', '6-10', '10+')
    ),
    add column if not exists energy_savings_experience text check (
        energy_savings_experience in ('excellent', 'good', 'fair', 'poor', 'veryPoor')
    ),
    add column if not exists recommendations text,
    add column if not exists general_comments text,
    add column if not exists submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- The first version required a free-text message; the form does not send one
alter table public.feedback alter column message drop not null;

-- The form always answers both yes/no questions. Only enforce it when no older
-- row is missing them, so the migration never fails on existing data.
do $$
begin
    if not exists (
        select 1 from public.feedback
        where is_first_visit is null or found_needed is null
    ) then
        alter table public.feedback
            alter column is_first_visit set not null,
            alter column found_needed set not null;
    end if;
end $$;

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists set_feedback_updated_at on public.feedback;
create trigger set_feedback_updated_at
    before update on public.feedback
    for each row
    execute function public.handle_updated_at();

-- Set up Row Level Security (RLS)
alter table public.feedback enable row level security;

-- Replace the policies of 20251028190000 with the ones below, so the table ends
-- up with the same set whichever way it was created
drop policy if exists "Users can insert feedback" on public.feedback;
drop policy if exists "Users can view own feedback" on public.feedback;
drop policy if exists "Admins can delete feedback" on public.feedback;

-- Users can insert their own feedback
drop policy if exists "Users can insert their own feedback" on public.feedback;
create policy "Users can insert their own feedback"
    on public.feedback for insert
    with check (auth.uid() = user_id);

-- Users can view their own feedback
drop policy if exists "Users can view their own feedback" on public.feedback;
create policy "Users can view their own feedback"
    on public.feedback for select
    using (auth.uid() = user_id);

-- Users can update their own feedback
drop policy if exists "Users can update their own feedback" on public.feedback;
create policy "Users can update their own feedback"
    on public.feedback for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Admins can view all feedback
drop policy if exists "Admins can view all feedback" on public.feedback;
create policy "Admins can view all feedback"
    on public.feedback for select
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Admins can delete any feedback
drop policy if exists "Admins can delete any feedback" on public.feedback;
create policy "Admins can delete any feedback"
    on public.feedback for delete
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Create indexes for better query performance
create index if not exists feedback_user_id_idx on public.feedback(user_id);
create index if not exists feedback_submitted_at_idx on public.feedback(submitted_at desc);
create index if not exists feedback_device_usage_idx on public.feedback(device_usage);
create index if not exists feedback_energy_savings_experience_idx on public.feedback(energy_savings_experience);

-- Add helpful comments to the table
comment on table public.feedback is 'Tabla que almacena el feedback de los usuarios sobre la plataforma Enertech';
comment on column public.feedback.user_id is 'ID del usuario que envió el feedback';
comment on column public.feedback.message is 'Mensaje libre (versión anterior del formulario)';
comment on column public.feedback.is_first_visit is 'Indica si es la primera visita del usuario';
comment on column public.feedback.found_needed is 'Indica si el usuario encontró lo que necesitaba';
comment on column public.feedback.visit_reason is 'Razón principal de la visita';
comment on column public.feedback.not_found_info is 'Información que no se pudo encontrar';
comment on column public.feedback.ease_of_use is 'Calificación de la facilidad de uso de la plataforma';
comment on column public.feedback.device_usage is 'Cantidad de dispositivos monitoreados';
comment on column public.feedback.energy_savings_experience is 'Experiencia general de ahorro de energía';
comment on column public.feedback.recommendations is 'Recomendaciones del usuario para mejorar';
comment on column public.feedback.general_comments is 'Comentarios generales adicionales';
