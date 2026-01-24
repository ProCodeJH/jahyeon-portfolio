import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function createSettingsTable() {
    console.log("Creating settings table...");

    await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

    console.log("✅ Settings table created successfully!");

    // Insert default YouTube URL
    await sql`
    INSERT INTO settings (key, value, description)
    VALUES ('youtube_video_url', 'https://www.youtube.com/watch?v=X_idSUmKSBw', 'Homepage YouTube video URL')
    ON CONFLICT (key) DO NOTHING
  `;

    console.log("✅ Default YouTube URL inserted!");
}

createSettingsTable().catch(console.error);
