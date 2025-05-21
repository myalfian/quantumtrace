-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('engineer', 'supervisor', 'admin');
create type project_status as enum ('not_started', 'in_progress', 'done');
create type leave_type as enum ('annual', 'sick', 'emergency', 'other');
create type request_status as enum ('pending', 'approved', 'rejected');
create type kpi_period as enum ('weekly', 'monthly');

-- Create teams table
create table teams (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    supervisor_id uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table (extends auth.users)
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    role user_role not null,
    team_id uuid references teams(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create projects table
create table projects (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    status project_status not null default 'not_started',
    start_date date not null,
    end_date date not null,
    location text not null,
    person_in_charge uuid references profiles(id),
    team_id uuid references teams(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create project updates table
create table project_updates (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(id) on delete cascade not null,
    user_id uuid references profiles(id) not null,
    progress integer not null check (progress >= 0 and progress <= 100),
    notes text,
    attachments text[],
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create daily activities table
create table daily_activities (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) not null,
    date date not null,
    description text not null,
    location text not null,
    attachments text[],
    status request_status not null default 'pending',
    supervisor_comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Ensure only one submission per user per day
    unique(user_id, date)
);

-- Create leave requests table
create table leave_requests (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) not null,
    start_date date not null,
    end_date date not null,
    type leave_type not null,
    reason text not null,
    status request_status not null default 'pending',
    supervisor_comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create KPIs table
create table kpis (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) not null,
    period kpi_period not null,
    start_date date not null,
    end_date date not null,
    tasks_completed integer not null default 0,
    attendance integer not null default 0,
    update_delay integer not null default 0,
    time_efficiency numeric not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table teams enable row level security;
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_updates enable row level security;
alter table daily_activities enable row level security;
alter table leave_requests enable row level security;
alter table kpis enable row level security;

-- Teams policies
create policy "Teams are viewable by authenticated users"
    on teams for select
    to authenticated
    using (true);

create policy "Teams are insertable by admins"
    on teams for insert
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin');

-- Profiles policies
create policy "Profiles are viewable by authenticated users"
    on profiles for select
    to authenticated
    using (true);

create policy "Users can update their own profile"
    on profiles for update
    to authenticated
    using (auth.uid() = id);

-- Projects policies
create policy "Projects are viewable by team members"
    on projects for select
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.team_id = projects.team_id
        )
    );

create policy "Projects are insertable by supervisors and admins"
    on projects for insert
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role in ('supervisor', 'admin')
        )
    );

-- Project updates policies
create policy "Project updates are viewable by team members"
    on project_updates for select
    to authenticated
    using (
        exists (
            select 1 from projects
            join profiles on profiles.team_id = projects.team_id
            where projects.id = project_updates.project_id
            and profiles.id = auth.uid()
        )
    );

create policy "Project updates are insertable by team members"
    on project_updates for insert
    to authenticated
    using (
        exists (
            select 1 from projects
            join profiles on profiles.team_id = projects.team_id
            where projects.id = project_updates.project_id
            and profiles.id = auth.uid()
        )
    );

-- Daily activities policies
create policy "Daily activities are viewable by team members"
    on daily_activities for select
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and (
                profiles.id = daily_activities.user_id
                or profiles.role in ('supervisor', 'admin')
            )
        )
    );

create policy "Daily activities are insertable by engineers"
    on daily_activities for insert
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'engineer'
        )
    );

-- Leave requests policies
create policy "Leave requests are viewable by team members"
    on leave_requests for select
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and (
                profiles.id = leave_requests.user_id
                or profiles.role in ('supervisor', 'admin')
            )
        )
    );

create policy "Leave requests are insertable by engineers"
    on leave_requests for insert
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'engineer'
        )
    );

-- KPIs policies
create policy "KPIs are viewable by team members"
    on kpis for select
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and (
                profiles.id = kpis.user_id
                or profiles.role in ('supervisor', 'admin')
            )
        )
    );

-- Create functions and triggers
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to all tables
create trigger handle_updated_at
    before update on teams
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on profiles
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on projects
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on project_updates
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on daily_activities
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on leave_requests
    for each row
    execute function handle_updated_at();

create trigger handle_updated_at
    before update on kpis
    for each row
    execute function handle_updated_at(); 