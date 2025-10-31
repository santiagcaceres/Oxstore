-- Add brand column to size_guides table to support brand-specific size guides
ALTER TABLE size_guides
ADD COLUMN IF NOT EXISTS brand VARCHAR(255);

-- Create index for faster brand lookups
CREATE INDEX IF NOT EXISTS idx_size_guides_brand ON size_guides(brand);

-- Update the unique constraint to include brand
-- First drop the old constraint if it exists
ALTER TABLE size_guides DROP CONSTRAINT IF EXISTS size_guides_subcategory_gender_key;

-- Add new unique constraint that allows either subcategory OR brand guides
-- A guide can be for a subcategory+gender OR for a brand, but not both
CREATE UNIQUE INDEX IF NOT EXISTS size_guides_subcategory_gender_unique 
ON size_guides(subcategory, gender) 
WHERE brand IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS size_guides_brand_unique 
ON size_guides(brand) 
WHERE subcategory IS NULL;

-- Add comment to explain the structure
COMMENT ON COLUMN size_guides.brand IS 'Brand name for brand-specific size guides. If set, subcategory should be NULL.';
COMMENT ON COLUMN size_guides.subcategory IS 'Subcategory slug for category-specific size guides. If set, brand should be NULL.';
