import pool from './db';

export async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Create inbox_messages table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inbox_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('welcome', 'feature', 'notification', 'update') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        icon VARCHAR(50),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    connection.release();
  }
}
