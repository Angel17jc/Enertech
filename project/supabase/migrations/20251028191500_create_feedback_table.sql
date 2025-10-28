-- Create feedback table with all the fields from our form
create table if not exists public.feedback (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    is_first_visit boolean not null,
    found_needed boolean not null,
    visit_reason text,
    not_found_info text,
    ease_of_use text check (
        ease_of_use in ('veryEasy', 'easy', 'neutral', 'difficult', 'veryDifficult')
    ),
    device_usage text check (
        device_usage in ('1-2', '3-5', '6-10', '10+')
    ),
    energy_savings_experience text check (
        energy_savings_experience in ('excellent', 'good', 'fair', 'poor', 'veryPoor')
    ),
    recommendations text,
    general_comments text,
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Add trigger to feedback table
create trigger set_feedback_updated_at
    before update on public.feedback
    for each row
    execute function public.handle_updated_at();

-- Set up Row Level Security (RLS)
alter table public.feedback enable row level security;

-- Create policies
-- Users can insert their own feedback
create policy "Users can insert their own feedback"
    on public.feedback for insert
    with check (auth.uid() = user_id);

-- Users can view their own feedback
create policy "Users can view their own feedback"
    on public.feedback for select
    using (auth.uid() = user_id);

-- Users can update their own feedback
create policy "Users can update their own feedback"
    on public.feedback for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Admins can view all feedback
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
comment on column public.feedback.is_first_visit is 'Indica si es la primera visita del usuario';
comment on column public.feedback.found_needed is 'Indica si el usuario encontró lo que necesitaba';
comment on column public.feedback.visit_reason is 'Razón principal de la visita';
comment on column public.feedback.not_found_info is 'Información que no se pudo encontrar';
comment on column public.feedback.ease_of_use is 'Calificación de la facilidad de uso de la plataforma';
comment on column public.feedback.device_usage is 'Cantidad de dispositivos monitoreados';
comment on column public.feedback.energy_savings_experience is 'Experiencia general de ahorro de energía';
comment on column public.feedback.recommendations is 'Recomendaciones del usuario para mejorar';
comment on column public.feedback.general_comments is 'Comentarios generales adicionales';