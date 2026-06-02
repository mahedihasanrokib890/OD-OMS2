-- V22: Add extra location tracking columns to attendance table
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS lunch_out_loc text,
ADD COLUMN IF NOT EXISTS lunch_in_loc text,
ADD COLUMN IF NOT EXISTS personal_out_loc text,
ADD COLUMN IF NOT EXISTS personal_in_loc text;
