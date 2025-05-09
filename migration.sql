-- Add new columns for AI features
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS context TEXT[] DEFAULT ARRAY['general'],
ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(10),
ADD COLUMN IF NOT EXISTS dependencies TEXT[],
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update existing tasks to have default values
UPDATE tasks
SET 
    priority = 'medium',
    context = ARRAY['general'],
    estimated_duration = '30m',
    dependencies = ARRAY[]::TEXT[],
    metadata = '{"confidence": 1.0}'::JSONB
WHERE priority IS NULL;

-- Verify column names
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks'; 