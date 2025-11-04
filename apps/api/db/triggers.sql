CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER TRIGGER_NAME_HERE BEFORE UPDATE ON "TABLE_NAME_HERE" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();